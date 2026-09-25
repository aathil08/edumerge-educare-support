export const NAV_ITEMS = {
  STUDENT: [
    { to: '/student', label: 'Dashboard', icon: 'home', end: true },
    { to: '/student/tickets', label: 'My Tickets', icon: 'list', end: true },
    { to: '/student/tickets/new', label: 'Create Ticket', icon: 'plus', end: true },
    { to: '/profile', label: 'Profile', icon: 'user', end: true },
  ],
  STAFF: [
    { to: '/staff', label: 'Dashboard', icon: 'home', end: true },
    { to: '/staff/tickets', label: 'Ticket Queue', icon: 'list', end: true },
    { to: '/profile', label: 'Profile', icon: 'user', end: true },
  ],
  MANAGER: [
    { to: '/manager', label: 'Dashboard', icon: 'home', end: true },
    { to: '/manager/tickets', label: 'All Tickets', icon: 'list', end: true },
    { to: '/profile', label: 'Profile', icon: 'user', end: true },
  ],
};