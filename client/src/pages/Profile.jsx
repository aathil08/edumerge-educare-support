import { useAuth } from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import { ROLE_LABELS } from '../utils/roles.js';

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', ROLE_LABELS[user.role] || user.role],
    ['Department', user.department || 'Not provided'],
    [
      'Member since',
      new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    ],
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />
      <div className="card max-w-2xl">
        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-4 px-5 py-4 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="col-span-2 min-w-0 break-words font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}