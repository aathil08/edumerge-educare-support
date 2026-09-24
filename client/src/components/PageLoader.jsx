import Spinner from './Spinner.jsx';

export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <div className="flex items-center gap-3 text-slate-500">
        <Spinner className="h-6 w-6 text-indigo-600" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}