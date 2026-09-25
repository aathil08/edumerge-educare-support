import { useEffect, useState } from 'react';
import { CATEGORIES, PRIORITY_LABELS } from '../utils/format.js';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_STUDENT', 'RESOLVED', 'CLOSED', 'REOPENED'];
const SLA_OPTIONS = ['ON_TRACK', 'AT_RISK', 'BREACHED'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
  { value: 'sla_due', label: 'SLA due time' },
];

export default function TicketFilters({ value, onChange, showSla = false, showAssigned = false }) {
  const [search, setSearch] = useState(value.search || '');

  // Debounce search so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== value.search) onChange({ search });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectClass = 'input py-1.5 text-sm';

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:flex-wrap md:items-center">
      <input
        type="text"
        className="input md:w-64"
        placeholder="Search ticket #, subject or student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search tickets"
      />

      <select
        className={selectClass}
        value={value.category}
        onChange={(e) => onChange({ category: e.target.value })}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={value.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {Object.entries(PRIORITY_LABELS).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={value.status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {showSla && (
        <select
          className={selectClass}
          value={value.sla}
          onChange={(e) => onChange({ sla: e.target.value })}
          aria-label="Filter by SLA state"
        >
          <option value="">All SLA states</option>
          {SLA_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      )}

      {showAssigned && (
        <select
          className={selectClass}
          value={value.assignedTo}
          onChange={(e) => onChange({ assignedTo: e.target.value })}
          aria-label="Filter by assignment"
        >
          <option value="">All tickets</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
        </select>
      )}

      <select
        className={`${selectClass} md:ml-auto`}
        value={value.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        aria-label="Sort tickets"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}