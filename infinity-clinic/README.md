# Clinixa — Enterprise Clinic & OPD Management Platform

![CI Pipeline](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey?style=flat-square)

> **Enterprise-Grade Clinic & OPD Management Platform (CMS & EMR) by [Arimini](https://www.arimini.in)**

**Clinixa** is an all-in-one, modern Clinic Management System designed for single-doctor practices, polyclinics, dental/specialty centers, and multi-branch hospital outpatient departments (OPDs). It connects the entire patient journey on a single record: automated online booking, real-time reception OPD queue, doctor consultation EMR workspace, digital prescription builder, pharmacy dispensing, and administrative billing.

---

## Tech Stack

- **Frontend:** React 19 (Vite SPA) + Vanilla CSS / Glassmorphic Design System
- **Backend:** Node.js / Express REST API (ES Modules)
- **Database:** PostgreSQL 15+ (via Connection Pooling / PgBouncer in production)
- **Cache & Message Broker:** Redis (Pub/Sub & session token management)
- **Realtime Sync:** Socket.IO / WebSockets (sub-millisecond token queue progression)
- **Test Frameworks:** Jest (Backend) + Vitest / React Testing Library (Frontend)
- **Security:** Helmet, CORS, bcrypt, rate limiting, and Zod input validation

---

## Project Structure

```
infinity-clinic/
├── .github/workflows/ # GitHub Actions CI workflows
├── api/              # Express API (Auth, EMR, OPD Queue, CMS, Billing)
│   ├── src/          # Source modules, routes, middleware, and config
│   └── tests/        # Jest integration & unit test suites
├── web/              # React Vite SPA (Patient portal + Staff workspaces)
│   ├── src/          # React components, pages, and context providers
│   └── src/__tests__/ # Vitest / Testing Library suites
├── deploy/           # Nginx, PgBouncer, and PM2 production configurations
└── docs/             # API specifications and product blueprints
```

---

## Local Development (Step-by-Step)

### Prerequisites

- **Node.js 20+** & npm
- **PostgreSQL 15+** running locally
- **Redis** running locally

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb infinity_clinic
```

### 2. API Setup

```bash
cd api
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis credentials:
# DATABASE_URL=postgres://user:password@localhost:5432/infinity_clinic
# REDIS_URL=redis://localhost:6379

npm install
npm run migrate
npm run seed
npm run dev
```

*The API server will run at `http://localhost:4000`.*

### 3. Web Frontend Setup

```bash
cd ../web
npm install
npm run dev
```

*The frontend application will run at `http://localhost:5173` (with `/api` and `/socket.io` reverse-proxied to port 4000).*

---

## Running Automated Test Suites

Both the backend and frontend include automated test suites covering authentication, appointment booking, patient privacy, and UI components.

```bash
# Run all tests across backend and frontend from repository root:
npm test

# Run backend API tests (Jest):
cd api && npm test

# Run frontend Web tests (Vitest):
cd web && npm test
```

---

## Demo Accounts (Generated from Seed)

| Role | Email | Password | Access Level |
|:-----|:------|:---------|:-------------|
| **Administrator** | `admin@pulseclinic.demo` | `Admin@123` | Full clinic management, staff CRUD, analytics & CMS |
| **Doctor (Cardiology)** | `doctor@pulseclinic.demo` | `Doctor@123` | Patient consultation, diagnosis, EMR & Rx builder |
| **Receptionist** | `receptionist@pulseclinic.demo` | `Reception@123` | Walk-in registration, token issuance & live queue |
| **Pharmacist** | `pharmacy@pulseclinic.demo` | `Pharmacy@123` | Real-time prescription feed & medicine dispensing |

---

## Core Feature Matrix

### 1. Patient-Facing CMS Website & Booking Engine
- Dynamic doctor directory with specialty spotlights, consultation fees, and real-time open slots.
- Instant online appointment booking with appointment ID generation (`/book`).
- Zero double-booking guarantee computed dynamically across doctor schedules.

### 2. Receptionist & Live OPD Queue Desk
- **Today's Command Center:** Universal patient search (Phone/Name/ID) and visit history.
- **Real-Time Token Queue:** Socket.IO-powered status updates: `Booked` $\rightarrow$ `Check-in` $\rightarrow$ `Token Issued` $\rightarrow$ `Called` $\rightarrow$ `In-Consultation`.
- **Walk-in Fast Registration:** Register new or returning walk-in patients in under 15 seconds.
- **POS / Payment Collection:** Cash, UPI, and Card tracking with invoice generation.

### 3. Doctor Consultation & Smart EMR
- Distraction-free live OPD queue with 1-click token call, skip, and status updates.
- Quick diagnosis picker, vital signs logging, and past consultation history timeline.
- Digital prescription builder with auto-suggest medicine templates, dosages, and instructions.

### 4. Pharmacy & Dispensing Workspace
- Live prescription feed auto-updating as doctors finish consultations.
- Instant prescription search and 1-click dispensing status workflow.

### 5. Administration & Clinic Analytics
- Revenue and payment audits with itemized breakdowns.
- Staff access controls and specialist roster management.
- Dynamic CMS configuration for public clinic website content.
