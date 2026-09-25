import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getTicket } from '../services/ticketService.js';
import { listComments, listActivity } from '../services/commentService.js';
import { formatDateTime } from '../utils/format.js';
import { getErrorMessage } from '../utils/errors.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SlaBadge from '../components/SlaBadge.jsx';
import Section from '../components/Section.jsx';
import CommentThread from '../components/CommentThread.jsx';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import TicketActionsPanel from '../components/TicketActionsPanel.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';

function DetailSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading ticket">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, c, a] = await Promise.all([getTicket(id), listComments(id), listActivity(id)]);
      setTicket(t);
      setComments(c);
      setActivities(a);
    } catch (err) {
      setError(getErrorMessage(err, 'Ticket not found.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // After an action (status/priority/assign), refresh the ticket and its activity.
  const refreshAfterAction = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([getTicket(id), listActivity(id)]);
      setTicket(t);
      setActivities(a);
    } catch {
      load(); // fall back to a full reload if a partial refresh fails
    }
  }, [id, load]);

  const refreshAfterComment = useCallback(async () => {
    try {
      const [t, c, a] = await Promise.all([getTicket(id), listComments(id), listActivity(id)]);
      setTicket(t);
      setComments(c);
      setActivities(a);
    } catch {
      load();
    }
  }, [id, load]);

  if (loading) return <DetailSkeleton />;
  if (error || !ticket) {
    return (
      <div className="card">
        <ErrorState message={error || 'Ticket not found.'} />
        <div className="pb-6 text-center">
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isStaffOrManager = user.role === 'STAFF' || user.role === 'MANAGER';
  const isClosed = ticket.status === 'CLOSED';
  const isOwner = user.role === 'STUDENT' && String(ticket.student._id) === String(user._id);
  const isAssignedStaff = user.role === 'STAFF' && ticket.assignedTo?._id === user._id;
  const canComment = !isClosed && (isOwner || isAssignedStaff || user.role === 'MANAGER');

  return (
    <div>
      <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <Icon name="home" className="h-4 w-4" /> Back to dashboard
      </Link>

      <PageHeader
        title={ticket.subject}
        description={ticket.ticketNumber}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SlaBadge sla={ticket.sla} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Description">
            <p className="whitespace-pre-wrap break-words px-5 py-4 text-sm text-slate-700">
              {ticket.description}
            </p>
          </Section>

          <Section title="Conversation">
            <CommentThread
              ticketId={ticket._id}
              comments={comments}
              canComment={canComment}
              isStaffOrManager={isStaffOrManager}
              closedMessage={
                isClosed
                  ? 'This ticket is closed. Reopen it to add a response.'
                  : 'You do not have permission to respond on this ticket.'
              }
              onAdded={refreshAfterComment}
            />
          </Section>

          <Section title="Activity timeline">
            <ActivityTimeline activities={activities} />
          </Section>
        </div>

        <div className="space-y-6">
          <div className="card space-y-3 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Student</span>
              <span className="font-medium text-slate-900">{ticket.student?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-900">{ticket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned staff</span>
              <span className="font-medium text-slate-900">{ticket.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="font-medium text-slate-900">{formatDateTime(ticket.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Updated</span>
              <span className="font-medium text-slate-900">{formatDateTime(ticket.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SLA due</span>
              <span className="font-medium text-slate-900">{formatDateTime(ticket.slaDueAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Age</span>
              <span className="font-medium text-slate-900">{ticket.ageing?.label}</span>
            </div>
            {ticket.resolutionSummary && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-slate-500">Resolution summary</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-slate-800">{ticket.resolutionSummary}</p>
              </div>
            )}
          </div>

          <TicketActionsPanel ticket={ticket} onUpdated={refreshAfterAction} />
        </div>
      </div>
    </div>
  );
}