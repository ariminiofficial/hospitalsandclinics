# Infinity Clinic Management System

Custom clinic management platform: patient website + booking, receptionist/OPD tools, doctor consultation tools, and admin control panel.

## Stack

- **Frontend:** React (Vite SPA)
- **Backend:** Node.js / Express
- **Database:** PostgreSQL (via PgBouncer in production)
- **Cache / Realtime:** Redis (pub/sub + token revocation)
- **Realtime:** Socket.IO

## Project Structure

```
infinity-clinic/
├── api/        # Express API
├── web/        # React SPA (public site + staff portal)
└── deploy/     # Nginx, PgBouncer, PM2 configs
```

## Local Development (no Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ running locally
- Redis running locally

### 1. Create the database

```bash
createdb infinity_clinic
```

### 2. API setup

```bash
cd api
cp .env.example .env
# Edit .env with your local Postgres/Redis credentials
npm install
npm run migrate
npm run seed
npm run dev
```

API runs at `https://clinic.arimini.in`.

### 3. Web setup

```bash
cd web
npm install
npm run dev
```

Web runs at `http://localhost:5173` (proxies `/api` and `/socket.io` to the API).

## Demo Accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@infinityclinic.com | Admin@123 |
| Doctor | doctor@infinityclinic.com | Doctor@123 |
| Receptionist | receptionist@infinityclinic.com | Reception@123 |

## Features

### Public Website
- CMS-driven home, about, contact pages
- Doctor listing with fees
- Services and testimonials
- Online appointment booking with slot availability

### Receptionist Portal
- Today's appointments (confirm, check-in, reschedule, cancel, no-show)
- Live OPD queue (Socket.IO)
- Walk-in registration
- Patient search and visit history
- Offline payment recording

### Doctor Portal
- Live queue with call/start/skip/complete
- Consultation notes (chief complaint, diagnosis)
- Prescription builder with print view
- Today's appointments list

### Admin Portal
- Dashboard metrics (patients, revenue, appointments)
- Doctor CRUD with schedule management
- Receptionist CRUD
- Appointment oversight by date
- Full website CMS (content sections, services, testimonials)
- Clinic settings

## End-to-End Flow

1. **Patient** books online at `/book`
2. **Receptionist** confirms → checks in → token issued
3. **Doctor** calls token → starts consultation → saves notes + prescription → completes
4. **Receptionist** records offline payment
5. **Admin** sees metrics on dashboard

## Production (VPS)

- Website: https://clinic.arimini.in (Nginx serves the React build)
- API: https://clinicapi.arimini.in (Nginx proxies `/api` + `/socket.io` to Express)
- Set `CORS_ORIGIN=https://clinic.arimini.in` and `COOKIE_SECURE=true` on the API
- Web build uses `VITE_API_URL=https://clinicapi.arimini.in` (see `web/.env.production`)
- PgBouncer in transaction mode on port 6432 (set `DATABASE_URL` accordingly)
- PM2 runs a single API instance
- See `deploy/` for configs

## Notes

- WhatsApp notifications excluded — `NotificationService` is a no-op stub
- Payment gateway on hold — offline payment recording only
- No self-registration for staff — accounts created by admin
