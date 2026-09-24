import Badge from './Badge.jsx';
import { STATUS_LABELS } from '../utils/format.js';

const STYLES = {
  OPEN: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  WAITING_FOR_STUDENT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  REOPENED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

export default function StatusBadge({ status }) {
  return <Badge className={STYLES[status] || STYLES.CLOSED}>{STATUS_LABELS[status] || status}</Badge>;
}