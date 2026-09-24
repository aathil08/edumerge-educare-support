import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import SlaBadge from './SlaBadge.jsx';

const Unassigned = () => <span className="italic text-slate-400">Unassigned</span>;

// Table on medium+ screens, stacked cards on small screens.
export default function TicketTable({ tickets, showStudent = false }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Ticket</th>
              {showStudent && <th className="px-4 py-3">Student</th>}
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50">
                <td className="max-w-xs px-5 py-3">
                  <p className="text-xs text-slate-500">{t.ticketNumber}</p>
                  <Link
                    to={`/tickets/${t._id}`}
                    className="block truncate font-medium text-slate-900 hover:text-indigo-700"
                  >
                    {t.subject}
                  </Link>
                </td>
                {showStudent && <td className="px-4 py-3 text-slate-700">{t.student?.name || '-'}</td>}
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{t.category}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <SlaBadge sla={t.sla} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {t.assignedTo?.name || <Unassigned />}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{t.ageing?.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {tickets.map((t) => (
          <li key={t._id}>
            <Link to={`/tickets/${t._id}`} className="block space-y-2 px-4 py-4 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{t.ticketNumber}</p>
                  <p className="break-words font-medium text-slate-900">{t.subject}</p>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={t.status} />
                <SlaBadge sla={t.sla} />
              </div>
              <p className="text-xs text-slate-500">
                {t.category}
                {showStudent && t.student?.name ? ` | ${t.student.name}` : ''} | {t.assignedTo?.name || 'Unassigned'} | Age:{' '}
                {t.ageing?.label}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}