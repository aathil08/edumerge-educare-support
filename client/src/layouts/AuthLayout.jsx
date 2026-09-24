import { Outlet } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

const POINTS = [
  'Raise and track support requests in one place',
  'Clear ownership, priorities and SLA tracking',
  'Full activity history on every ticket',
];

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <Logo dark />
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Student support,
            <br />
            handled properly.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">EduCare Student Support Platform</p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}