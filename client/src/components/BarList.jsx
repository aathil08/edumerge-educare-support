// Simple horizontal bar chart made with plain HTML/CSS.
export default function BarList({ items, barClassName = 'bg-indigo-500' }) {
  const max = Math.max(...items.map((i) => i.count), 0);

  if (max === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-500">No data yet.</p>;
  }

  return (
    <ul className="space-y-3 px-5 py-4">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full ${barClassName}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}