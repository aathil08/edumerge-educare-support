import Badge from './Badge.jsx';
import { formatDuration } from '../utils/format.js';

// Displays the SLA state calculated by the backend (ticket.sla).
export default function SlaBadge({ sla }) {
  if (!sla) return null;

  if (sla.state === 'MET') {
    return <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20">SLA met</Badge>;
  }
  if (sla.state === 'BREACHED') {
    return (
      <Badge className="bg-red-50 text-red-700 ring-red-600/20">
        {sla.isOverdue ? `Overdue by ${formatDuration(sla.remainingMinutes)}` : 'SLA breached'}
      </Badge>
    );
  }
  if (sla.state === 'AT_RISK') {
    return (
      <Badge className="bg-amber-50 text-amber-700 ring-amber-600/20">
        At risk, {formatDuration(sla.remainingMinutes)} left
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">
      On track, {formatDuration(sla.remainingMinutes)} left
    </Badge>
  );
}