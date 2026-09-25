import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listStaff } from '../services/userService.js';
import { updateTicketPriority, changeTicketStatus, assignTicket } from '../services/ticketService.js';
import { getAvailableTransitions, actionLabel, daysSince, STUDENT_REOPEN_WINDOW_DAYS } from '../utils/workflow.js';
import { PRIORITY_LABELS } from '../utils/format.js';
import { getErrorMessage } from '../utils/errors.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import Spinner from './Spinner.jsx';

export default function TicketActionsPanel({ ticket, onUpdated }) {
  const { user } = useAuth();
  const toast = useToast();
  const isStaffOrManager = user.role === 'STAFF' || user.role === 'MANAGER';
  const isClosed = ticket.status === 'CLOSED';

  const [staffList, setStaffList] = useState([]);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignTo, setAssignTo] = useState(ticket.assignedTo?._id || '');
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { to } or null
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [confirmSimple, setConfirmSimple] = useState(null); // { to, label } for non-resolve transitions

  useEffect(() => setPriority(ticket.priority), [ticket.priority]);
  useEffect(() => setAssignTo(ticket.assignedTo?._id || ''), [ticket.assignedTo]);

  useEffect(() => {
    if (isStaffOrManager) {
      listStaff().then(setStaffList).catch(() => {});
    }
  }, [isStaffOrManager]);

  const run = async (fn, successMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      onUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err, 'That action could not be completed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handlePriorityUpdate = () => {
    if (priority === ticket.priority) return;
    run(() => updateTicketPriority(ticket._id, priority), 'Priority updated.');
  };

  const handleAssign = () => {
    if (!assignTo || assignTo === (ticket.assignedTo?._id || '')) return;
    run(() => assignTicket(ticket._id, assignTo), 'Ticket assigned.');
  };

  const handleClaim = () => {
    run(() => assignTicket(ticket._id, user._id), 'Ticket assigned to you.');
  };

  const doStatusChange = (to, summary) => {
    run(
      () => changeTicketStatus(ticket._id, { status: to, ...(summary ? { resolutionSummary: summary } : {}) }),
      `Status updated to ${to.replace(/_/g, ' ')}.`
    );
  };

  const transitions = getAvailableTransitions(user.role, ticket);
  const reopenBlocked =
    user.role === 'STUDENT' &&
    ticket.status === 'CLOSED' &&
    ticket.closedAt &&
    daysSince(ticket.closedAt) > STUDENT_REOPEN_WINDOW_DAYS;

  return (
    <div className="card space-y-5 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Actions</h3>

      {/* Priority */}
      {isStaffOrManager && !isClosed && (
        <div>
          <label htmlFor="priority" className="label">Priority</label>
          <div className="flex gap-2">
            <select
              id="priority"
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={busy}
            >
              {Object.entries(PRIORITY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={handlePriorityUpdate}
              disabled={busy || priority === ticket.priority}
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Assignment */}
      {!isClosed && user.role === 'MANAGER' && (
        <div>
          <label htmlFor="assign" className="label">Assigned to</label>
          <div className="flex gap-2">
            <select
              id="assign"
              className="input"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              disabled={busy}
            >
              <option value="">Unassigned</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={handleAssign}
              disabled={busy || !assignTo || assignTo === (ticket.assignedTo?._id || '')}
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {!isClosed && user.role === 'STAFF' && !ticket.assignedTo && (
        <button type="button" className="btn-secondary w-full" onClick={handleClaim} disabled={busy}>
          Claim this ticket
        </button>
      )}

      {!isClosed && user.role === 'STAFF' && ticket.assignedTo?._id === user._id && staffList.length > 1 && (
        <div>
          <label htmlFor="reassign" className="label">Reassign to</label>
          <div className="flex gap-2">
            <select
              id="reassign"
              className="input"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              disabled={busy}
            >
              <option value="">Choose staff member</option>
              {staffList.filter((s) => s._id !== user._id).map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={handleAssign}
              disabled={busy || !assignTo}
            >
              Reassign
            </button>
          </div>
        </div>
      )}

      {/* Status transitions */}
      {transitions.length > 0 && (
        <div>
          <p className="label">Status</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((to) => (
              <button
                key={to}
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => {
                  if (to === 'RESOLVED') setPendingAction({ to });
                  else setConfirmSimple({ to, label: actionLabel(ticket.status, to) });
                }}
              >
                {actionLabel(ticket.status, to)}
              </button>
            ))}
          </div>
        </div>
      )}

      {reopenBlocked && (
        <p className="text-xs text-slate-500">
          This ticket was closed more than {STUDENT_REOPEN_WINDOW_DAYS} days ago and can no longer be reopened.
          Please create a new ticket if you still need help.
        </p>
      )}

      {/* Resolve: needs a resolution summary */}
      {pendingAction?.to === 'RESOLVED' && (
        <div className="rounded-lg border border-slate-200 p-3">
          <label htmlFor="resolutionSummary" className="label">Resolution summary</label>
          <textarea
            id="resolutionSummary"
            rows={3}
            className="input"
            placeholder="Briefly describe how this was resolved (at least 5 characters)"
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            disabled={busy}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setPendingAction(null);
                setResolutionSummary('');
              }}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={busy || resolutionSummary.trim().length < 5}
              onClick={() => {
                const summary = resolutionSummary.trim();
                setPendingAction(null);
                setResolutionSummary('');
                doStatusChange('RESOLVED', summary);
              }}
            >
              {busy && <Spinner className="h-4 w-4" />}
              Confirm resolve
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmSimple)}
        title={confirmSimple?.label}
        message={`Change this ticket's status to ${confirmSimple?.to.replace(/_/g, ' ')}?`}
        confirmLabel="Confirm"
        loading={busy}
        onConfirm={() => {
          const { to } = confirmSimple;
          setConfirmSimple(null);
          doStatusChange(to);
        }}
        onCancel={() => setConfirmSimple(null)}
      />
    </div>
  );
}