import React from 'react';
import { ComplaintPriority, ComplaintStatus } from '../../types';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../config/workflow';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
  className?: string;
}

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
  className?: string;
}

interface OverdueBadgeProps {
  isOverdue: boolean;
  text?: string;
  className?: string;
}

const statusDarkStyles: Record<ComplaintStatus, string> = {
  SUBMITTED: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  UNASSIGNED: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  ASSIGNED: 'dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
  ACKNOWLEDGED: 'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
  IN_PROGRESS: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
  AWAITING_CITIZEN_INFO: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  RESOLUTION_REPORT_SUBMITTED: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  RESOLUTION_REPORT_REJECTED: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  RESOLVED_AWAITING_FEEDBACK: 'dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/60',
  REOPENED: 'dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
  ESCALATED: 'dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60',
  CLOSED: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  WITHDRAWAL_REQUEST_PENDING: 'dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  WITHDRAWN: 'dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

const priorityDarkStyles: Record<ComplaintPriority, string> = {
  CRITICAL: 'dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/70',
  HIGH: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
  MEDIUM: 'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70',
  LOW: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const meta = STATUS_DEFINITIONS[status] || {
    label: status,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const darkClass = statusDarkStyles[status] || 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap shrink-0 ${meta.badgeClass} ${darkClass} ${sizeClasses} ${className}`}
      title={meta.label}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span className="truncate max-w-[150px]">{meta.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm', className = '' }: PriorityBadgeProps) {
  const meta = PRIORITY_DEFINITIONS[priority] || {
    label: priority,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const darkClass = priorityDarkStyles[priority] || 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-md whitespace-nowrap shrink-0 ${meta.badgeClass} ${darkClass} ${sizeClasses} ${className}`}
      title={`Priority: ${meta.label}`}
    >
      <span className="opacity-75">P:</span>
      <span className="font-semibold">{meta.label}</span>
    </span>
  );
}

export function OverdueBadge({ isOverdue, text, className = '' }: OverdueBadgeProps) {
  if (!isOverdue) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-md bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70 px-2 py-0.5 text-xs whitespace-nowrap shrink-0 ${className}`}
    >
      <span aria-hidden="true">⚠️</span>
      <span>{text || 'OVERDUE'}</span>
    </span>
  );
}
