# Infinity Clinic Management System — Build Plan

## Context

Infinity Clinic wants a custom clinic management platform (patient website + booking, receptionist/OPD tools, doctor consultation tools, admin control panel). The original PRD scoped a 35-40 day build on Next.js/NestJS with WhatsApp reminders and mandatory payment. After discussion, the client tightened the ask to **7-15 days**, then — after seeing that the WhatsApp integration is what actually made the original estimate long, and that the chosen feature scope (full admin CMS, full marketing site, real-time queue) doesn't fit 7-15 days on its own — agreed to a **realistic ~18-23 day timeline** instead of cutting scope. This plan targets that full scope on the confirmed stack, with WhatsApp explicitly excluded but a clean extension point left for it later. Online payment gateway integration was subsequently put on hold (see below), bringing the estimate down to **~17-19 days**.

Working directory is currently empty (no git repo, no code) — this is a from-scratch build.

**Confirmed decisions:**
- Stack: React (Vite SPA) + Node.js/Express + PostgreSQL + PgBouncer + Redis, single Hostinger KVM2 VPS. No Next.js/NestJS (client override of original PRD).
- WhatsApp excluded entirely from this build — a `NotificationService` interface with a no-op implementation stands in its place so a channel can be added later without refactoring call sites.
- Full admin panel (doctor/receptionist/appointment mgmt, full website CMS, clinic settings) — not a minimal version.
- Full marketing patient website, all content admin-editable (not hardcoded).
- Real-time OPD queue via Redis pub/sub + Socket.IO — not simple polling.
- **Payment gateway integration is on hold for this build** — no Razorpay or any online payment gateway is integrated. Appointments confirm with no online-payment step; receptionist can record offline payment (cash/card/UPI collected in person). `payments` table stays in the schema as forward-compatible scaffolding so a gateway can be added later without a data-model change.
- Roles: Patient (public, unauthenticated, identified by phone), Receptionist/Doctor/Admin (JWT + RBAC, credentials issued by admin — no self-registration).

---

## 1. Database Schema (PostgreSQL)

UUID PKs for patient/appointment-facing entities, `timestamptz` everywhere, soft-delete (`is_active`) on staff entities, JSONB for flexible/CMS content instead of many narrow tables.

Core tables: `users` (unified staff auth w/ `role` check), `doctors`, `doctor_schedules`, `receptionists`, `patients` (unique on `phone`, no login), `appointments`, `opd_tokens`, `opd_token_counters`, `consultations`, `prescriptions` + `prescription_items`, `payments`, `website_content` (generic `section_key`/JSONB CMS table), `testimonials`, `services`, `clinic_settings` (key/JSONB), `audit_log`.

Load-bearing constraints:
- `opd_token_counters (doctor_id, visit_date) PK` — atomic per-doctor-per-day token counter (see §4), avoids `MAX()+1` race conditions.
- `opd_tokens` unique on `(doctor_id, visit_date, token_number)`; hot-path index on `(doctor_id, visit_date, status)` for queue reads.
- `appointments` partial unique index on `(doctor_id, appointment_date, appointment_time) WHERE status NOT IN ('cancelled','no_show')` — prevents double-booking while allowing rebook after cancellation.
- `payments` table kept as forward-compatible scaffolding (`razorpay_order_id/payment_id/signature` columns, nullable-safe unique on `razorpay_order_id`) even though no gateway is wired up yet; `method` distinguishes offline methods (`cash`/`card_offline`/`upi_offline`) from a future `razorpay` value.

## 2. Project Structure

Single git repo, two apps, no workspace tooling overhead needed at this size:

```
infinity-clinic/
├── api/        # Express: modules/{auth,patients,doctors,appointments,opd-queue,consultations,
│               #   prescriptions,payments,website-content,clinic-settings}, middleware/, 
│               #   notifications/ (NotificationService + NoopChannel), realtime/ (wsServer, queueChannel),
│               #   migrations/
├── web/        # React (Vite) SPA: public-site/, portal/{receptionist,doctor,admin}, shared/{api,auth,realtime}
└── deploy/     # nginx.conf, pgbouncer.ini, ecosystem.config.js (PM2), deploy.sh
```

- `api/src/config/db.js` connects to **PgBouncer** (`127.0.0.1:6432`, `transaction` pool mode), never directly to Postgres. All DB access via single-statement parameterized queries (no session-level features — they break under transaction pooling).
- Redis has two distinct roles: (1) pub/sub for OPD queue events (`queue:doctor:{id}`, `queue:clinic:all`), (2) refresh-token revocation set + short-TTL cache for public CMS content. Not used for sessions (auth is stateless JWT).

## 3. Auth / RBAC

- Short-lived JWT access token (15 min, in-memory on frontend, `Authorization: Bearer`) + httpOnly refresh cookie (7 days), checked against a Redis-held id for revocation on logout.
- `authenticate` + `authorize(...roles)` middleware. Routes split `/api/public/*` (unauthenticated: browse, book, pay) vs `/api/portal/*` (authenticated, role-gated).
- `express-rate-limit` (Redis-backed) on `/api/public/appointments` and `/auth/login`.
- Staff passwords via bcrypt (cost 12); accounts created by admin only, no self-registration.

## 4. Real-Time OPD Queue

- **Token generation**: atomic upsert against `opd_token_counters` (`INSERT ... ON CONFLICT DO UPDATE SET last_token = last_token + 1 RETURNING last_token`) inside the same transaction as the `opd_tokens` insert and `appointments.status → checked_in` update. Postgres row-locking serializes concurrent receptionists — no manual advisory locks needed.
- **Redis pub/sub**: publish only after the DB transaction commits. Channels: `queue:doctor:{doctorId}` (doctor's own queue) and `queue:clinic:all` (receptionist floor view).
- **Socket.IO** (not raw `ws`, for built-in reconnect/backoff/rooms) attached to the same HTTP server as Express, so Nginx proxies one port with `Upgrade` headers. JWT verified at handshake; doctors can only join their own room. Sockets are receive-only — all state changes go through authenticated REST endpoints, which write to Postgres then publish to Redis.
- **Reconnect correctness**: on reconnect, client always re-fetches the current queue snapshot via REST before trusting further pub/sub deltas — no attempt to replay missed messages.

## 5. Payments (on hold)

- No online payment gateway is integrated in this build. Appointment status is never blocked on payment — booking/confirmation flow doesn't reference a payment step at all.
- Offline payments recorded by receptionist (`POST /portal/payments/:appointmentId/record-offline`) with a printable receipt view (browser print, no PDF pipeline needed at this scope) — this is the only payment-adjacent functionality in scope.
- `payments` table and status fields exist in the schema (§1) purely as forward-compatible scaffolding, so a gateway (Razorpay or otherwise) can be added later without a data-model change. No order-creation, checkout, verify endpoint, or webhook is built now.

## 6. Phased Build Plan (~16-19 days)

| Phase | Days | Content |
|---|---|---|
| 0 — Infra & scaffolding | 1.5 | git init, VPS provisioning, Postgres/PgBouncer/Redis setup, repo scaffold, base Express+React shells, PM2/Nginx skeleton |
| 1 — Schema, auth, RBAC | 2 | Migrations, seed admin, JWT login/refresh, role middleware, protected routing |
| 2 — Patient site + booking | 3.5 | Public pages from CMS tables, doctor availability/slots, booking → patient+appointment (pending) |
| 3 — Receptionist panel + OPD queue | 4 | **Highest risk.** Dashboard, patient search/mgmt, appointment reschedule/cancel/walk-in, atomic token counter, Socket.IO+Redis wiring, live queue UI, offline payment recording + receipt |
| 4 — Doctor panel | 2.5 | Queue subscription, today's appointments, call-next/status transitions, history, consultation notes, prescription builder + print view |
| 5 — Admin panel + CMS | 3 | Doctor/receptionist CRUD, appointment oversight, CMS editors for all public sections, clinic settings, basic metrics |
| 6 — Hardening/testing/deploy | 2.5-3.5 | Full cross-role E2E pass, concurrent token-issuance check, TLS via Certbot, PM2 config, backups, deploy + buffer |

Total ≈ 17-19 days. Payment-gateway integration (Razorpay) is on hold and not included in this estimate — re-add ~2.5 days if/when it's reprioritized.

**Top risks**: (1) real-time queue concurrency/reconnect correctness, (2) accidentally using session-level Postgres features that break under PgBouncer transaction pooling, (3) locking the CMS JSONB content shape late (it's shared by both the public renderer and admin editor).

## 7. VPS Deployment (Single Hostinger KVM2, 2 vCPU/8GB)

```
Internet → Nginx (:443, TLS via Certbot)
   ├─ /            → static React build (served directly by Nginx, not Node)
   └─ /api, /socket.io → 127.0.0.1:4000 (Express+Socket.IO, PM2, single instance)
                              ├─ PgBouncer :6432 (transaction mode) → Postgres :5432 (localhost only)
                              └─ Redis :6379 (localhost only)
```

- PM2 runs **one instance, not cluster mode** — Socket.IO room state isn't shared across workers without `@socket.io/redis-adapter`, which isn't needed at single-clinic scale.
- Postgres/PgBouncer/Redis bound to localhost only, managed as systemd services.
- Backups: nightly `pg_dump` (gzip, 14-day retention) copied offsite (rclone/scp — not just kept on the same VPS), plus weekly Hostinger panel snapshot. `.env` backed up separately, encrypted.
- Deploy via a simple `deploy.sh` (git pull, install, migrate, build, `pm2 reload`, `nginx -s reload`) — full CI/CD is unnecessary overhead for this timeline.

## Verification

- Phase-by-phase: after each phase, manually run its flow end-to-end against a local Postgres/Redis/PgBouncer stack before moving on (e.g., after Phase 3, open two browser sessions as different receptionists and confirm concurrent check-ins never produce duplicate token numbers).
- Before Phase 6 sign-off, run the full path once: book as a patient → receptionist check-in/token → doctor calls token → consultation + prescription → receptionist records offline payment → admin dashboard reflects the appointment/payment.
- Load-check the OPD queue with several concurrent token-creation requests (e.g. a small script hitting the check-in endpoint in parallel) to confirm the atomic counter holds under real concurrency, not just in single-user testing.
- Confirm PgBouncer transaction-mode compatibility by exercising every module's DB access once under PgBouncer (not directly against Postgres) before deploying — this is where a silently-broken assumption would surface.
