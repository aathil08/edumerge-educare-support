# Assumptions

## Assignment requirements (from Edumerge's brief)
- Three roles: Student, Support Staff, Manager/Admin
- Categories: Fees, Attendance, ID Card, Documents, Certificates, Other
- Priorities: Critical, High, Medium, Low
- Backend-enforced permissions, not just hidden UI
- A working prototype, source code, approach/assumptions, architecture/trade-offs, validation/edge cases, and an AI usage report

## Product assumptions (decided by us — not specified by Edumerge)
- **Registration:** public registration always creates a STUDENT account. Staff and manager accounts are created by a seed script only.
- **SLA durations:** Critical 2h, High 8h, Medium 24h, Low 48h.
- **SLA states:** ON_TRACK, AT_RISK (≤25% of the window remaining), BREACHED (past due). Finished tickets are MET or BREACHED based on whether they finished before the due time.
- **Status transitions:** `OPEN→IN_PROGRESS→WAITING_FOR_STUDENT⇄RESOLVED→CLOSED`, with `CLOSED→REOPENED→IN_PROGRESS`, and `RESOLVED→IN_PROGRESS` for "not satisfied".
- **Students** may only: close a RESOLVED ticket, move RESOLVED back to IN_PROGRESS, or reopen a CLOSED ticket within 7 days.
- **Staff** may act on tickets assigned to them, plus claim an unassigned ticket by moving it to IN_PROGRESS (or via explicit assign-to-self).
- **Managers** may perform any valid transition or reassignment on any ticket.
- **Assignment:** a Closed ticket cannot be reassigned until reopened.
- **Priority:** students cannot set it; new tickets start at MEDIUM. Priority changes recalculate the SLA due time from the original SLA start time.
- **Reopen:** resets `slaStartedAt`/`slaDueAt` to the reopen time.
- **Comments:** PUBLIC or INTERNAL (staff/manager only). Students never receive internal notes or internal-note activity entries. A student reply on a WAITING_FOR_STUDENT ticket automatically moves it to IN_PROGRESS.
- **Delete:** no hard delete of tickets, for audit-trail reasons.
- **Duplicate protection:** an identical ticket (same student/category/subject/description) within 30 seconds is rejected.
- **Manager Staff Workload / Reports** are sections of the single Manager Dashboard rather than separate pages, to avoid duplicating the same analytics under the deadline.

## Technical assumptions
- JWT contains only the user ID; role is always re-read from the database on each request, never trusted from the token.
- JWT is stored in `localStorage` on the client (documented limitation: exposed to XSS).
- Dashboard analytics are computed in Node from at most 5,000 tickets per role query (prototype-scale; would move to MongoDB aggregation at real scale).
- MongoDB Atlas, database name `educare`, explicit in the connection string.
- No automated test suite; validation was manual (Postman for the API, browser for the UI), phase by phase, as documented in `AI_USAGE_REPORT.md`.