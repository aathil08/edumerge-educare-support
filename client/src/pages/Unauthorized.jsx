import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function Unauthorized() {
  return (
    <div className="card">
      <EmptyState
        title="You do not have access to this page"
        description="Your account role does not allow you to view this section."
        action={
          <Link to="/" className="btn-primary">
            Go to my dashboard
          </Link>
        }
      />
    </div>
  );
}