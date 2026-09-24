import Skeleton from './Skeleton.jsx';

export default function DashboardSkeleton({ cards = 4 }) {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="card mt-6 space-y-3 p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}