/**
 * Formatting utilities using Intl API for dates, numbers, and strings
 */

export function formatDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatDateOnly(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) return 'just now';
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
    return formatDate(d);
  } catch {
    return '—';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

/**
 * Check if a complaint deadline has passed and is still in an unresolved state
 */
export function isComplaintOverdue(deadlineIso?: string | null, status?: string): boolean {
  if (!deadlineIso) return false;
  // If resolved, closed, or withdrawn, it cannot be overdue
  if (
    status === 'RESOLVED_AWAITING_FEEDBACK' ||
    status === 'CLOSED' ||
    status === 'WITHDRAWN' ||
    status === 'RESOLUTION_REPORT_SUBMITTED'
  ) {
    return false;
  }
  const deadline = new Date(deadlineIso).getTime();
  return Date.now() > deadline;
}

/**
 * Calculate remaining time string or overdue label
 */
export function getDeadlineCountdown(deadlineIso?: string | null, status?: string): {
  text: string;
  isOverdue: boolean;
} {
  if (!deadlineIso) return { text: 'No target set', isOverdue: false };
  if (
    status === 'RESOLVED_AWAITING_FEEDBACK' ||
    status === 'CLOSED' ||
    status === 'WITHDRAWN'
  ) {
    return { text: 'Completed', isOverdue: false };
  }

  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - Date.now();

  if (diffMs < 0) {
    const overdueHrs = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    if (overdueHrs < 24) {
      return { text: `Overdue by ${overdueHrs}h`, isOverdue: true };
    }
    const overdueDays = Math.ceil(overdueHrs / 24);
    return { text: `Overdue by ${overdueDays}d`, isOverdue: true };
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  if (hoursRemaining < 24) {
    return { text: `${hoursRemaining}h remaining`, isOverdue: false };
  }
  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return { text: `${daysRemaining}d remaining`, isOverdue: false };
}
