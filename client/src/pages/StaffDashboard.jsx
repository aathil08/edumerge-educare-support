import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { getStaffDashboard } from '../services/dashboardService.js';
import { formatRelativeTime } from '../utils/format.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Section from '../components/Section.jsx';
import TicketTable from '../components/TicketTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';

const NoneNote = ({ children }) => (
  <p className="px-5 py-8 text-center text-sm text-slate-500">{children}</p>
);

export default function StaffDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => getStaffDashboard(), []);

  if (loading) return <DashboardSkeleton cards={6} />;
  if (error) {
    return (
      <div className="card">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const { counts, myQueue, slaRiskTickets, overdueTickets, recentActivity } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user.name.split(' ')[0]}`}
        description="Your assigned tickets and what needs attention."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Assigned to me" value={counts.assignedToMe} />
        <StatCard label="Open" value={counts.open} />
        <StatCard label="In progress" value={counts.inProgress} />
        <StatCard label="SLA risk" value={counts.slaRisk} tone="warning" />
        <StatCard label="Overdue" value={counts.overdue} tone="danger" />
        <StatCard label="Resolved" value={counts.resolved} tone="success" />
      </div>

      {counts.unassigned > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-indigo-200 bg-indigo-50 px-5 py-4">
          <p className="text-sm text-indigo-900">
            {counts.unassigned} unassigned {counts.unassigned === 1 ? 'ticket is' : 'tickets are'} waiting in the queue.
          </p>
          <Link to="/staff/tickets" className="btn-primary">
            Open queue
          </Link>
        </div>
      )}

      <Section title="My queue" description="Active tickets assigned to you, most urgent first.">
        {myQueue.length === 0 ? (
          <NoneNote>You have no active tickets. Check the queue for unassigned tickets.</NoneNote>
        ) : (
          <TicketTable tickets={myQueue} showStudent />
        )}
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="SLA-risk tickets" description="Approaching their due time.">
          {slaRiskTickets.length === 0 ? (
            <NoneNote>No tickets are at risk right now.</NoneNote>
          ) : (
            <TicketTable tickets={slaRiskTickets} showStudent />
          )}
        </Section>

        <Section title="Overdue tickets" description="Past their SLA due time.">
          {overdueTickets.length === 0 ? (
            <NoneNote>No overdue tickets.</NoneNote>
          ) : (
            <TicketTable tickets={overdueTickets} showStudent />
          )}
        </Section>
      </div>

      <Section title="Recent activity" description="Latest actions on your tickets.">
        {recentActivity.length === 0 ? (
          <NoneNote>No activity yet.</NoneNote>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((a) => (
              <li key={a._id} className="px-5 py-3 text-sm">
                <p className="text-slate-800">{a.message}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {a.actor?.name || 'Unknown'} on{' '}
                  {a.ticket ? (
                    <Link to={`/tickets/${a.ticket._id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {a.ticket.ticketNumber}
                    </Link>
                  ) : (
                    'a ticket'
                  )}{' '}
                  - {formatRelativeTime(a.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}