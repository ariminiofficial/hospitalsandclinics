# 🏥 Clinixa — Your Clinic Companion
> **Enterprise-Grade Clinic & OPD Management Platform (CMS & EMR) by [Arimini](https://www.arimini.in)**

**Clinixa** is an all-in-one, modern Clinic Management System designed for single-doctor practices, polyclinics, dental/specialty centers, and multi-branch hospital outpatient departments (OPDs). It connects the entire patient journey on a single record: automated online booking, real-time reception OPD queue, doctor consultation EMR workspace, digital prescription builder, pharmacy dispensing, and administrative billing.

---

## 🚀 Tech Stack

- **Frontend:** React 18 (Vite SPA) + Vanilla CSS / Modern Glassmorphic Design System
- **Backend:** Node.js / Express REST API
- **Database:** PostgreSQL 15+ (via PgBouncer in production)
- **Cache & Message Broker:** Redis (Pub/Sub & session token management)
- **Realtime Sync:** Socket.IO / WebSockets (sub-millisecond token queue progression)
- **Form Delivery:** EmailJS Integration for demo requests & inquiries

---

## 📁 Project Structure

```
infinity-clinic/
├── api/          # Express API (Auth, EMR, OPD Queue, CMS, Billing)
├── web/          # React Vite SPA (Patient portal + Staff workspaces)
├── deploy/       # Nginx, PgBouncer, and PM2 production configurations
└── docs/         # API specifications and product blueprints
```

---

## 🛠️ Local Development (Step-by-Step)

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

## 🔐 Demo Accounts (Generated from Seed)

| Role | Email | Password | Access Level |
|:-----|:------|:---------|:-------------|
| **Administrator** | `admin@pulseclinic.demo` | `Admin@123` | Full clinic management, staff CRUD, analytics & CMS |
| **Doctor (Cardiology)** | `doctor@pulseclinic.demo` | `Doctor@123` | Patient consultation, diagnosis, EMR & Rx builder |
| **Receptionist** | `receptionist@pulseclinic.demo` | `Reception@123` | Walk-in registration, token issuance & live queue |
| **Pharmacist** | `pharmacy@pulseclinic.demo` | `Pharmacy@123` | Real-time prescription feed & medicine dispensing |

---

## ✨ Core Feature Matrix

### 🌐 1. Patient-Facing CMS Website & Booking Engine
- Dynamic doctor directory with specialty spotlights, consultation fees, and real-time open slots.
- Instant online appointment booking with appointment ID generation (`/book`).
- Zero double-booking guarantee computed dynamically across doctor schedules.

### 🛎️ 2. Receptionist & Live OPD Queue Desk
- **Today's Command Center:** Universal patient search (Phone/Name/ID) and visit history.
- **Real-Time Token Queue:** Socket.IO-powered status updates: `Booked` $\rightarrow$ `Check-in` $\rightarrow$ `Token Issued` $\rightarrow$ `Called` $\rightarrow$ `In-Consultation`.
- **Walk-in Fast Registration:** Register new or returning walk-in patients in under 15 seconds.
- **POS / Payment Collection:** Cash, UPI, and Card tracking with invoice generation.

### 👨‍⚕️ 3. Doctor Consultation & Smart EMR
- Distraction-free live OPD queue with 1-click token call, skip, and status updates.
- Clinical note logging: Chief complaints, vitals (BP, Pulse, SpO2), provisional & final diagnosis.
- **Digital Prescription Builder:** Drug search, dosage (e.g. 1-0-1), duration, food instructions, and 1-click printable branded PDF Rx with doctor registration number.
- Longitudinal patient medical history accessible during consultation.

### 💊 4. Pharmacy & Dispensing Module
- Instant prescription feed routed from doctor rooms the second consultation completes.
- Dispensing verification checklist and consolidated medicine billing handoff.

### ⚙️ 5. Clinic Administration & Analytics
- Executive dashboard with daily/monthly revenue, consultation throughput, and peak OPD hours.
- Doctor schedule and consultation fee manager.
- Full website CMS editor (services, doctor bios, reviews, contact information).

---

## 🔄 End-to-End Patient Flow

```mermaid
graph LR
    A[Patient Books Online / Walk-in] --> B[Reception Issues Token]
    B --> C[Live Waiting Queue Display]
    C --> D[Doctor Consult & Digital Rx]
    D --> E[Pharmacy Dispenses Medicines]
    E --> F[Settled Bill & Analytics Log]
```

1. **Patient** books slot online at `/book` or arrives as an OPD walk-in.
2. **Receptionist** checks in patient and issues a live queue token.
3. **Doctor** calls next token on their dashboard, logs diagnosis, and writes digital Rx.
4. **Pharmacy Desk** receives real-time electronic prescription and dispenses medicines.
5. **Admin Dashboard** reflects revenue, visit records, and doctor performance metrics instantly.

---

## 🌐 Production Deployment (VPS / Cloud)

- **Patient Web App:** `https://clinic.arimini.in` (Nginx serving optimized Vite build)
- **API Server:** `https://clinicapi.arimini.in` (Nginx reverse-proxying `/api` + `/socket.io` to Node.js / PM2)
- **Database:** PostgreSQL cluster via PgBouncer in transaction pooling mode (port `6432`)
- **Configs:** See `deploy/` for complete Nginx, PgBouncer, and PM2 ecosystem files.

---

## 🏢 Support & Commercial Inquiries

Clinixa is engineered by **Arimini**. For custom multi-tenant white-label deployments, regional hospital rollouts, or integration support:

- 🌐 **Website:** [arimini.in](https://www.arimini.in)
- ✉️ **Email:** [hello@arimini.in](mailto:hello@arimini.in)
- 📞 **Phone:** +91 94050 58496
- 📍 **Headquarters:** Nagpur, Maharashtra, India

---

*© 2026 Clinixa · Engineered by Arimini. All rights reserved.*
