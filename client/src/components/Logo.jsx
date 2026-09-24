export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
        E
      </div>
      <span className={`text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>EduCare</span>
    </div>
  );
}