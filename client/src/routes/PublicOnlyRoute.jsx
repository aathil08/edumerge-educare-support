import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import PageLoader from '../components/PageLoader.jsx';
import { roleHome } from '../utils/roles.js';

// Login/register are not shown to users who are already logged in.
export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={roleHome(user.role)} replace />;

  return <Outlet />;
}