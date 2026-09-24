import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { roleHome } from '../utils/roles.js';

export default function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user.role)} replace />;
}