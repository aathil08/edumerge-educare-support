import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicOnlyRoute from './routes/PublicOnlyRoute.jsx';
import HomeRedirect from './routes/HomeRedirect.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import { ROLES } from './utils/roles.js';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/tickets/:id"
            element={<PlaceholderPage title="Ticket Details" />}
          />

          {/* Student */}
          <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
            <Route path="/student" element={<PlaceholderPage title="Student Dashboard" />} />
            <Route path="/student/tickets" element={<PlaceholderPage title="My Tickets" />} />
            <Route path="/student/tickets/new" element={<PlaceholderPage title="Create Ticket" />} />
          </Route>

          {/* Staff */}
          <Route element={<ProtectedRoute roles={[ROLES.STAFF]} />}>
            <Route path="/staff" element={<PlaceholderPage title="Staff Dashboard" />} />
            <Route path="/staff/tickets" element={<PlaceholderPage title="Ticket Queue" />} />
          </Route>

          {/* Manager */}
          <Route element={<ProtectedRoute roles={[ROLES.MANAGER]} />}>
            <Route path="/manager" element={<PlaceholderPage title="Manager Dashboard" />} />
            <Route path="/manager/tickets" element={<PlaceholderPage title="All Tickets" />} />
            <Route path="/manager/workload" element={<PlaceholderPage title="Staff Workload" />} />
            <Route path="/manager/reports" element={<PlaceholderPage title="Reports & Insights" />} />
          </Route>
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}