# HospitalShield Frontend

**HospitalShield** is an enterprise-grade healthcare cybersecurity monitoring platform (SOC Console) designed for multi-hospital privacy governance, zero-trust access policy enforcement, real-time threat detection, and compliance telemetry.

---

## 1. Key Capabilities

- **Enterprise Healthcare SOC UI**: Built with dark navy sidebar (`#0B1220`), clean light grey canvas (`#F8FAFC`), and compact high-density data tables designed specifically for security operations centers.
- **Real-Time Telemetry Feed**: Live monitoring of access authorization attempts across outpatient terminals, clinical workstations, and diagnostic equipment.
- **Zero-Trust Policy Enforcement Point (PEP)**: Enforces RBAC and data classification policies (L1 Public, L2 Internal, L3 Confidential, L4 Highly Restricted).
- **Incident Management**: Incident triage with status lifecycle (`OPEN`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`) and resolution notes.
- **Cryptographic Audit Logs**: CERT-In 180-day compliant immutable log explorer with search, role/result/classification filtering, and JSON/archive export.
- **Regulatory Compliance Center**: Technical control readiness for **DPDP Act 2023**, **CERT-In Directions**, **ABDM Health Data Management Policy**, and **ISO 27799**.
- **Interactive Hackathon Demo Workflow Stepper**: A persistent, guided top-bar component that lets judges test and verify the 9-step denial & incident investigation demonstration live.

---

## 2. Tech Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query (React Query v5)**
- **Recharts**
- **React Hook Form & Zod**
- **Lucide React**

---

## 3. Supported Pages & Routes

| Route | Module | Purpose |
| :--- | :--- | :--- |
| `/login` | Authentication | Email/password sign-in, quick demo credentials, form validation |
| `/dashboard` | Overview SOC | KPI metrics, Recharts trends, request ratio donut, hospital activity |
| `/monitoring` | Security Monitoring | Live polling access feed, risk score badges, terminal telemetry |
| `/audit-logs` | Audit Logs | Server-side paginated event log, filters, detail drawer, export |
| `/incidents` | Security Incidents | Incident list, severity triage, status update to `INVESTIGATING` |
| `/users` | Users & Roles | Directory of 9 healthcare roles, enrollment modal, active toggles |
| `/policies` | Access Policies | Zero-Trust policy rules, allowed actions, classification scope |
| `/data-classification` | Data Classification | L1–L4 taxonomy, real clinical examples, entitlement matrix |
| `/compliance` | Compliance Center | DPDP Act, CERT-In, ABDM controls with statutory disclaimer |
| `/hospitals` | Hospital Management | Multi-hospital status, bed capacity, user counts, compliance scores |
| `/settings` | System Settings | Profile, security preferences, session timeout, backend simulator |

---

## 4. Hackathon Demo Workflow

The frontend includes an interactive **Demo Stepper** at the top of the interface that coordinates with backend APIs:

1. **Receptionist Logs In**: Switch persona or log in as Sunita Rao (`usr-rec-01`, `RECEPTIONIST`).
2. **Attempt Restricted Diagnosis Access**: Click *"Attempt L4 Oncology Query"*. The PEP intercepts the unauthorized request.
3. **Backend / PEP Denies Access**: Access is denied with `PEP-403-FORBIDDEN` due to policy violation.
4. **Denial Displayed**: The frontend displays the denial reason and elevated risk score (92/100).
5. **Audit Event Generated**: The event is recorded in the Audit Logs with terminal IP and metadata.
6. **Security Incident Created**: Incident `HS-INC-2026-089` is generated with `CRITICAL` severity.
7. **Switch to Security Admin**: Switch persona to Rahul Sharma (`usr-sec-01`, `SECURITY_ADMIN`).
8. **Investigate & Update Status**: Open incident details and change status to `INVESTIGATING` with notes.
9. **Status Transition Displayed**: Status updates to `INVESTIGATING` and reflects across all dashboard widgets.

---

## 5. Backend Integration

The app connects to the Node.js/Express backend via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5000`).

Endpoints implemented:
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/hospitals`
- `GET /api/v1/users`, `POST /api/v1/users`, `PATCH /api/v1/users/:id`, `PATCH /api/v1/users/:id/status`
- `GET /api/v1/resources`
- `GET /api/v1/policies`, `POST /api/v1/policies`, `PATCH /api/v1/policies/:id`
- `GET /api/v1/audit-logs`, `GET /api/v1/audit-logs/:id`
- `GET /api/v1/incidents`, `GET /api/v1/incidents/:id`, `PATCH /api/v1/incidents/:id/status`
- `GET /api/v1/dashboard/summary`, `GET /api/v1/dashboard/activity`, `GET /api/v1/dashboard/severity`, `GET /api/v1/dashboard/hospitals`

*If the backend is not running or unreachable, HospitalShield automatically operates in Standalone Simulation Mode with full local persistence, displaying a subtle `Demo SOC Engine` badge so evaluation can continue without interruption.*

---

## 6. Getting Started

### Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```
