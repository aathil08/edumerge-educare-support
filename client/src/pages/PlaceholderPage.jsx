import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

// TEMPORARY: replaced by the real screens in later chunks.
export default function PlaceholderPage({ title }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="card">
        <EmptyState
          title="This screen is not built yet"
          description="Navigation, login and role protection are working. This page will be built in a later step."
        />
      </div>
    </div>
  );
}