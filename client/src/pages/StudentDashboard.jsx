import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { getStudentDashboard } from '../services/dashboardService.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Section from '../components/Section.jsx';
import TicketTable from '../components/TicketTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';
import Icon from '../components/Icon.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => getStudentDashboard(), []);

  const createButton = (
    <Link to="/student/tickets/new" className="btn-primary">
      <Icon name="plus" className="h-4 w-4" />
      Create ticket
    </Link>
  );

  if (loading) return <DashboardSkeleton cards={4} />;
  if (error) {
    return (
      <div className="card">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const { counts, recentTickets, pendingTickets } = data;
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="An overview of your support requests."
        actions={createButton}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total tickets" value={counts.total} />
        <StatCard label="Open" value={counts.open} />
        <StatCard label="In progress" value={counts.inProgress} />
        <StatCard label="Resolved / closed" value={counts.resolvedClosed} tone="success" />
      </div>

      {counts.total === 0 ? (
        <div className="card">
          <EmptyState
            title="You don't have any support tickets yet."
            description="Need help with fees, attendance, ID cards or documents? Raise a ticket and our team will pick it up."
            action={createButton}
          />
        </div>
      ) : (
        <>
          {pendingTickets.length > 0 && (
            <Section
              title="Needs your reply"
              description="Support staff are waiting for more information from you."
            >
              <TicketTable tickets={pendingTickets} />
            </Section>
          )}

          <Section
            title="Recent tickets"
            action={
              <Link to="/student/tickets" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all
              </Link>
            }
          >
            <TicketTable tickets={recentTickets} />
          </Section>
        </>
      )}
    </div>
  );
}