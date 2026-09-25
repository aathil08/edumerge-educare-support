# EduCare

Student Support & Ticket Management Platform — built for the Edumerge Solutions Pre-Drive Product Engineering Assignment (Assignment 4).

## Overview
Students raise support tickets for administrative matters (fees, attendance, ID cards, documents, certificates, other). Support staff own, prioritize, and resolve tickets. Managers monitor SLA risk, overdue tickets, and staff workload.

## Problem
Ad-hoc communication for student support requests makes ownership, prioritization, and follow-through hard to track. EduCare gives every request a ticket, an owner, a status, and a full history.

## Solution
A three-role support desk with backend-enforced permissions, a documented status workflow, calculated SLA due times, activity logging on every action, and role-specific dashboards.

## Features
- Email/password auth with JWT and bcrypt password hashing
- Role-based authorization enforced on the backend (Student / Support Staff / Manager)
- Ticket CRUD, assignment, reassignment, priority changes
- Status workflow: OPEN → IN_PROGRESS → WAITING_FOR_STUDENT → RESOLVED → CLOSED, with REOPENED support
- SLA due-time calculation, ON_TRACK / AT_RISK / BREACHED states, and ageing
- Public and internal (staff-only) comments, with full activity timeline
- Search, filter, sort and pagination on ticket lists
- Student, Staff, and Manager dashboards with real-time counts and simple charts
- Responsive UI: desktop persistent sidebar, mobile collapsible navigation, no page-wide horizontal scroll
- Loading, empty and error states throughout

## User Roles
| Role | Highlights |
|---|---|
| Student | Create tickets, view/search own tickets, reply, close resolved tickets, reopen within 7 days |
| Support Staff | View queue, claim/reassign, change priority/status, internal notes, resolve tickets |
| Manager | Full visibility, reassign any ticket, workload and analytics |

## Tech Stack
- **Frontend:** React, Vite, React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs

## Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project Structure



## Setup Instructions

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, CLIENT_URL
node scripts/seedUsers.js
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Environment Variables
See `server/.env.example` and `client/.env.example`.

## Running Locally
Backend: `http://localhost:5000` (see `server/.env`). Frontend: `http://localhost:5173`, proxies `/api` to the backend in development.

## Demo Accounts
Password for all: `Educare@123`
- `manager@educare.test`
- `staff1@educare.test`, `staff2@educare.test`
- `student1@educare.test`, `student2@educare.test`

## API Overview
`/api/auth/*`, `/api/tickets/*` (+ `/status`, `/assign`, `/comments`, `/activity`), `/api/users/staff`, `/api/dashboard/{student,staff,manager}`. Full list in `docs/ARCHITECTURE.md`.

## Ticket Lifecycle
`OPEN → IN_PROGRESS → WAITING_FOR_STUDENT → RESOLVED → CLOSED`, with `CLOSED → REOPENED → IN_PROGRESS`. See `docs/ARCHITECTURE.md` for the enforced transition map.

## SLA Model
Product assumption (not specified by Edumerge): Critical 2h, High 8h, Medium 24h, Low 48h. AT_RISK when 25% or less of the window remains; BREACHED when the due time has passed.

## Validation
Enforced on both frontend and backend (backend is authoritative). See `docs/ASSUMPTIONS.md` and `docs/EDGE_CASES.md`.

## Edge Cases
See [docs/EDGE_CASES.md](docs/EDGE_CASES.md).

## Screenshots
_Add screenshots of the dashboards and ticket detail page here before submission._

## AI Usage
Claude Sonnet was used throughout development. See [docs/AI_USAGE_REPORT.md](docs/AI_USAGE_REPORT.md).

## Trade-offs
- Dashboard analytics are computed in Node from up to 5,000 tickets rather than via MongoDB aggregation — fine at prototype scale, would need to change for production scale.
- SLA clock does not pause during `WAITING_FOR_STUDENT`.
- Staff Workload and Reports are sections of the Manager Dashboard rather than separate pages, to avoid duplicating the same data under the deadline.
- JWT is stored in `localStorage`, which is simple but exposed to XSS; documented as a known limitation.

## Future Improvements
- Email notifications on assignment/SLA breach
- MongoDB aggregation-based analytics for scale
- Pausing the SLA clock while waiting on the student
- Automated tests (unit + integration)