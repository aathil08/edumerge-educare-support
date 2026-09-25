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
import StudentDashboard from './pages/StudentDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import { ROLES } from './utils/roles.js';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />

          <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route
              path="/student/tickets"
              element={
                <TicketsPage
                  title="My Tickets"
                  description="All the support requests you have raised."
                  emptyTitle="You don't have any support tickets yet."
                  emptyDescription="Raise a ticket and our team will pick it up."
                  showCreate
                />
              }
            />
            <Route path="/student/tickets/new" element={<CreateTicket />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.STAFF]} />}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route
              path="/staff/tickets"
              element={
                <TicketsPage
                  title="Ticket Queue"
                  description="All support tickets, including unassigned ones."
                  emptyTitle="No tickets in the queue."
                  emptyDescription="New tickets from students will appear here."
                  showStudent
                  showSla
                  showAssigned
                />
              }
            />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.MANAGER]} />}>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route
              path="/manager/tickets"
              element={
                <TicketsPage
                  title="All Tickets"
                  description="Every support ticket across the institution."
                  emptyTitle="No tickets yet."
                  emptyDescription="Tickets raised by students will appear here."
                  showStudent
                  showSla
                  showAssigned
                />
              }
            />
            <Route path="/manager/workload" element={<Navigate to="/manager" replace />} />
            <Route path="/manager/reports" element={<Navigate to="/manager" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}