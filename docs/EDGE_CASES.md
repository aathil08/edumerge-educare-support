# Edge Cases

| # | Scenario | Expected behavior | Status |
|---|---|---|---|
| 1 | Duplicate email on register | 409, "An account with this email already exists." | Tested |
| 2 | Invalid login | 401, same message for wrong email or wrong password | Tested |
| 3 | Expired JWT | 401, "Your session has expired. Please log in again." | Implemented |
| 4 | Student accesses another student's ticket | 404 (not 403, to avoid confirming the ticket exists) | Tested |
| 5 | Staff accesses a manager-only endpoint | 403 | Tested |
| 6 | Invalid ticket ID format | 400, "Invalid ticket ID." | Tested |
| 7 | Ticket not found | 404 | Tested |
| 8 | Empty ticket description | 400 with field error | Tested |
| 9 | Empty comment | 400, "Message cannot be empty." | Tested |
| 10 | Invalid category | 400 with field error | Tested |
| 11 | Invalid priority | 400 with field error | Implemented |
| 12 | Invalid status transition | 400, "Cannot change status from X to Y." | Tested |
| 13 | Action on an unassigned ticket | Staff can view; only claiming (assign or IN_PROGRESS) grants control | Tested |
| 14 | Reassignment | Manager: always allowed (not on Closed). Staff: only their own ticket | Tested |
| 15 | SLA approaching (AT_RISK) | Shown in staff/manager dashboards and ticket detail | Tested |
| 16 | SLA breached | Shown as overdue, with "Overdue by ..." on the ticket | Tested |
| 17 | Ticket already closed | New comments (409), priority change (409), reassignment (409) all blocked | Tested (comments); Implemented (priority/reassignment) |
| 18 | Reopening a closed ticket | Student within 7 days; staff/manager if assigned/any time; SLA restarts | Tested |
| 19 | API failure (backend down) | Friendly error banner with Retry, no raw error shown | Tested |
| 20 | Database failure | Central error handler returns a generic 500 without leaking details | Implemented |
| 21 | Empty dashboard (new user) | "You don't have any support tickets yet." with a Create Ticket action | Tested |
| 22 | No search results | "No tickets match your filters." | Implemented (pending final UI test) |
| 23 | Slow API | 15s client timeout with a friendly "taking too long" message | Implemented |
| 24 | Duplicate requests | Duplicate ticket within 30s rejected (409); submit buttons disable while in flight | Tested (duplicate ticket); Implemented (button guards) |
| 25 | Page refresh while logged in | Session restored via `/api/auth/me`, no flash to login | Tested |
| 26 | Logout | Confirmation dialog, token cleared, redirect to login | Tested |
| 27 | Missing environment variables | Server refuses to start with a clear message naming the missing variable | Tested |

"Implemented" means the code path exists and was reasoned through during development but was not run as an explicit, reported test in this conversation. All "Implemented" items should be spot-checked against the final verification checklist before submission.