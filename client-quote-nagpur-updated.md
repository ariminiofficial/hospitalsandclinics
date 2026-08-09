# Project Quotation — Infinity Clinic Management System

**Client Region:** Nagpur, Maharashtra
**Prepared by:** Arimini — we build it like ours
**Project:** Custom Clinic Management System (Patient Website + Receptionist/Doctor/Admin Portals)
**Timeline:** 18–23 working days

---

## Why This Pays For Itself

- **Missed/no-show appointments**: even 3-4 missed bookings a week from phone-call scheduling and manual diary management adds up to real lost consultation revenue every month — online booking with confirmation cuts this significantly.
- **Front-desk overload**: a receptionist juggling phone calls, walk-ins, and a paper register loses time per patient that a digital queue recovers instantly — meaning more patients seen per day without adding staff.
- **Patient experience**: patients today expect to book online and see wait status, the way they do with every other service — clinics without this lose patients to competitors who have it.
- **One-time cost vs. ongoing leakage**: Option B costs less per month than a single missed high-value consultation slot.

## Recommended Starting Point

| | Option A — Handover | Option B — Monthly |
|---|---|---|
| Upfront cost | ₹59,000 | ₹6,500 |
| Ongoing cost | None (AMC optional) | ₹2,000/month |
| Ownership | Full (source code) | None (subscription access) |
| Best for | Full independence, in-house IT later | **Lowest risk way to start** |

**→ Recommended: start with Option B.** It gets the clinic live in the same 18–23 days with the smallest possible upfront commitment, and can be upgraded to Option A later once the system is proven in daily use — no work is wasted in that upgrade path since it's the same system either way.

## Risk-Reversal Terms (applies to both options)

- A working demo/preview of the patient booking flow is shown before the final milestone payment is due — client isn't paying for something unseen.
- 15-day free minor-revision window after go-live (content/branding tweaks, not new features) on both options.
- First payment is the smallest milestone in every option — the majority of cost is only due once the system is visibly working.

---

## 1. Scope Covered in This Quote

- Public patient website (home, about, doctors, services, testimonials, contact — all admin-editable)
- Online appointment booking with optional Razorpay payment (pay online or at clinic)
- Real-time OPD queue & token system (receptionist + doctor live dashboards)
- Receptionist panel (registration, search, appointments, walk-ins, queue, offline payment/receipts)
- Doctor panel (consultations, diagnosis, prescriptions, patient history)
- Admin panel (doctor/receptionist management, appointment oversight, full website CMS, clinic settings)
- Deployment on a single VPS with backups and SSL

**Excluded from both models:** WhatsApp Business API integration (requires separate Meta verification and a paid BSP subscription — can be added later without rework, since the system is built with a notification-channel extension point).

Market reference: custom-built clinic systems of this scope run ₹3–8 lakhs in the Indian market; ready-made SaaS tools (Practo Ray, HealthPlix) run ₹12,000–30,000/year but don't offer real-time OPD queue, full branding, or data ownership. The two models below sit between these poles depending on whether the client wants outright ownership or the lowest-friction way to start.

---

## 2. Technical Overview (for reference)

- **Built on modern, industry-standard technology**: React (frontend), Node.js/Express (backend), PostgreSQL (database) — the same class of stack used by large-scale healthcare and fintech products, not a page-builder or template system.
- **Real-time OPD queue**: token/queue updates push instantly to receptionist and doctor screens (via WebSockets), so both sides always see the current queue without refreshing the page.
- **Secure login system**: role-based access control (separate permissions for Admin, Doctor, Receptionist) with encrypted passwords and token-based authentication — no shared logins, each staff member has their own account and audit trail.
- **Payment security**: card/UPI details are handled entirely by Razorpay's secure checkout — this system never stores or touches raw card data, keeping the clinic out of PCI compliance scope.
- **HTTPS/SSL encryption** on the entire site by default, so all patient and clinic data in transit is encrypted.
- **Daily automated backups** of the database, so patient records and appointment history are protected against data loss.
- **Built to scale**: the same architecture supports adding more doctors, more receptionists, or a second clinic branch later without a redesign.

---

## Option A — Total Handover (One-Time Buyout)

Client owns everything outright: full source code, database, deployment credentials. No dependency on Arimini afterward — client can hire any developer to maintain or extend it.

| Item | Cost (INR) |
|---|---|
| Development (all phases, full scope) | ₹52,000 |
| Handover premium (source code + IP transfer, deployment docs, credential handover) | ₹7,000 |
| **Total one-time cost** | **₹59,000** |

**Includes:** 30-day post-launch bug-fix warranty. AMC is optional, not bundled — quoted separately if wanted (₹9,000–10,000/year, since ongoing support isn't pre-paid here).

**Payment terms:** 50% advance / 30% mid-development (after Phase 4) / 20% on final handover.

**Best for:** a client who wants full independence and may bring in their own IT person later.

---

## Option B — Monthly Subscription (Fully Managed, SaaS-style)

No large upfront dev cost. Arimini owns, hosts, and maintains the system on a dedicated (single-tenant) VPS for this clinic. Client pays a small onboarding fee, then a monthly fee to use it — similar to renting Practo Ray, but with real-time OPD queue and full clinic branding that generic SaaS tools don't offer.

| Item | Cost (INR) |
|---|---|
| One-time onboarding (branding, domain, data setup) | ₹6,500 |
| Monthly fee (hosting + maintenance + support + updates) | ₹2,000/month |

**Commitment:** 12-month minimum recommended (covers dedicated VPS + support cost); cancel anytime after with data export provided. No source code ownership — access ends if subscription lapses, same as any SaaS product.

**Best for:** a client who wants to start with minimal upfront investment and treat this as an operating expense rather than a capital purchase.

**Upgrade path:** can convert to Option A (full handover) at any time — the ₹6,500 onboarding and up to the first 6 months of subscription payments (max ₹12,000) are credited toward the ₹59,000 handover cost. Payments beyond 6 months are not credited, since they reflect ongoing hosting/support already delivered.

---

## Recurring / Third-Party Costs (Applies to Option A — Client Pays Directly)

| Item | Estimated Cost |
|---|---|
| Hostinger VPS (KVM2) | ₹700–900/month (~₹6,000–8,000/year annual plan) |
| Domain name (.com/.in) | ₹700–1,200/year |
| SSL Certificate | Free (Let's Encrypt, auto-renewed) |
| Razorpay transaction fee | ~2% + GST per online transaction (charged by Razorpay, not us) |

*(Under Option B, hosting is bundled into the monthly fee — client doesn't manage the VPS separately.)*

## Optional Add-On (Both Options)

| Add-on | Cost |
|---|---|
| WhatsApp Business API integration (dev/setup only) | ₹4,999 one-time |

*Note: Meta's own business verification and per-message/conversation charges are billed by Meta directly to the client — Arimini's ₹4,999 covers integration development only, not Meta's fees.*

## Timeline

**18–23 working days** from kickoff and receipt of advance/onboarding payment, assuming timely client feedback on content/branding during development.

---

*Draft quotation based on typical Nagpur/Maharashtra market rates and Indian clinic-software pricing benchmarks. Adjust line-item pricing to match your positioning and margin targets before sending to the client.*

*All prices above are exclusive of GST unless stated otherwise; GST will be added as applicable at billing.*
