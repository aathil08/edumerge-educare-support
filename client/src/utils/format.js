export const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_FOR_STUDENT: 'Waiting for student',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const PRIORITY_LABELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const CATEGORIES = ['Fees', 'Attendance', 'ID Card', 'Documents', 'Certificates', 'Other'];

// 45 -> "45m", 200 -> "3h 20m", 3000 -> "2d 2h"
export function formatDuration(totalMinutes) {
  const m = Math.abs(Math.round(totalMinutes));
  if (m < 1) return 'less than 1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  return `${formatDuration(minutes)} ago`;
}