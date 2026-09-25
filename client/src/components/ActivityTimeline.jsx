import { formatDateTime } from '../utils/format.js';

export default function ActivityTimeline({ activities }) {
  if (activities.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-500">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4 p-5">
      {activities.map((a) => (
        <li key={a._id} className="flex gap-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
          <div className="min-w-0">
            <p className="text-sm text-slate-800">{a.message}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {a.actor?.name || 'System'} &middot; {formatDateTime(a.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}