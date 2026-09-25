export const STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_STUDENT', 'RESOLVED'],
  WAITING_FOR_STUDENT: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS'],
};

export const STUDENT_TRANSITIONS = ['RESOLVED>CLOSED', 'RESOLVED>IN_PROGRESS', 'CLOSED>REOPENED'];
export const STUDENT_REOPEN_WINDOW_DAYS = 7;

export function getAvailableTransitions(role, ticket) {
  const from = ticket.status;
  const options = STATUS_TRANSITIONS[from] || [];
  if (role === 'STUDENT') {
    return options.filter((to) => STUDENT_TRANSITIONS.includes(`${from}>${to}`));
  }
  return options; // STAFF/MANAGER: backend further restricts by ownership
}

export function actionLabel(from, to) {
  if (to === 'IN_PROGRESS' && from === 'RESOLVED') return 'Not resolved, continue work';
  if (to === 'IN_PROGRESS') return 'Start working';
  if (to === 'WAITING_FOR_STUDENT') return 'Wait for student reply';
  if (to === 'RESOLVED') return 'Mark resolved';
  if (to === 'CLOSED') return 'Close ticket';
  if (to === 'REOPENED') return 'Reopen ticket';
  return to;
}

export function daysSince(date) {
  return (Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000);
}