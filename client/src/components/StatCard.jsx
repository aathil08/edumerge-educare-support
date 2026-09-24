const COLORS = {
  default: 'text-slate-900',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  success: 'text-emerald-600',
};

// warning/danger colours only apply when the value is above zero.
export default function StatCard({ label, value, tone = 'default' }) {
  const color =
    (tone === 'warning' || tone === 'danger') && value === 0 ? COLORS.default : COLORS[tone];

  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}