import Badge from './Badge.jsx';
import { PRIORITY_LABELS } from '../utils/format.js';

const STYLES = {
  CRITICAL: 'bg-red-50 text-red-700 ring-red-600/20',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  MEDIUM: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  LOW: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function PriorityBadge({ priority }) {
  return <Badge className={STYLES[priority] || STYLES.LOW}>{PRIORITY_LABELS[priority] || priority}</Badge>;
}