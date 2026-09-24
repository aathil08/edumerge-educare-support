export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  MANAGER: 'MANAGER',
});

export const ROLE_LABELS = {
  STUDENT: 'Student',
  STAFF: 'Support Staff',
  MANAGER: 'Manager',
};

export function roleHome(role) {
  if (role === ROLES.STAFF) return '/staff';
  if (role === ROLES.MANAGER) return '/manager';
  return '/student';
}