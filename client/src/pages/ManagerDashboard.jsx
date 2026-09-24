import { useFetch } from '../hooks/useFetch.js';
import { getManagerDashboard } from '../services/dashboardService.js';
import { STATUS_LABELS, PRIORITY_LABELS } from '../utils/format.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Section from '../components/Section.jsx';
import BarList from '../components/BarList.jsx';
import TicketTable from '../components/TicketTable.jsx';
import ErrorState from '../components/ErrorState.jsx';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';

export default function ManagerDashboard() {
  const { data, loading, error, reload } = useFetch(() => getManagerDashboard(), []);

  if (loading) return <DashboardSkeleton cards={8} />;
  if (error) {
    return (
      <div className="card">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const { counts, analytics, staffWorkload, attentionTickets } = data;

  const byPriority = analytics.byPriority.map((i) => ({ ...i, label: PRIORITY_LABELS[i.label] || i.label }));
  const byStatus = analytics.byStatus.map((i) => ({ ...i, label: STATUS_LABELS[i.label] || i.label }));

  return (
    <div className="space-y-6">
      <PageHeader title="Operations dashboard" description="Support workload, SLA risk and ticket trends." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total tickets" value={counts.total} />
        <StatCard label="Open" value={counts.open} />
        <StatCard label="In progress" value={counts.inProgress} />
        <StatCard label="Waiting for student" value={counts.waitingForStudent} />
        <StatCard label="SLA risk" value={counts.slaRisk} tone="warning" />
        <StatCard label="Overdue" value={counts.overdue} tone="danger" />
        <StatCard label="Resolved / closed" value={counts.resolved} tone="success" />
        <StatCard label="Unassigned" value={counts.unassigned} tone="warning" />
      </div>

      <Section title="Needs attention" description="Overdue tickets, oldest due date first.">
        {attentionTickets.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">No overdue tickets.</p>
        ) : (
          <TicketTable tickets={attentionTickets} showStudent />
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Tickets by category">
          <BarList items={analytics.byCategory} />
        </Section>
        <Section title="Tickets by priority">
          <BarList items={byPriority} barClassName="bg-orange-500" />
        </Section>
        <Section title="Tickets by status">
          <BarList items={byStatus} barClassName="bg-sky-500" />
        </Section>
        <Section title="Ageing of active tickets" description="Time since the ticket was created.">
          <BarList items={analytics.ageing} barClassName="bg-amber-500" />
        </Section>
      </div>

      <Section title="Staff workload" description="Active tickets per support staff member.">
        {staffWorkload.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">No support staff accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Staff</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">In progress</th>
                  <th className="px-4 py-3">At risk</th>
                  <th className="px-4 py-3">Overdue</th>
                  <th className="px-4 py-3">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffWorkload.map((row) => (
                  <tr key={row.staff._id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{row.staff.name}</p>
                      <p className="text-xs text-slate-500">{row.staff.department || row.staff.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.active}</td>
                    <td className="px-4 py-3 text-slate-700">{row.inProgress}</td>
                    <td className={`px-4 py-3 ${row.atRisk > 0 ? 'font-medium text-amber-600' : 'text-slate-700'}`}>
                      {row.atRisk}
                    </td>
                    <td className={`px-4 py-3 ${row.overdue > 0 ? 'font-medium text-red-600' : 'text-slate-700'}`}>
                      {row.overdue}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}