import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../app/NotificationContext';
import { useAuth } from '../../app/AuthContext';
import { ROUTES } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatRelativeTime } from '../../utils/formatting';
import { Bell, CheckCheck, ExternalLink, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();

  const getComplaintLink = (complaintId?: string) => {
    if (!complaintId) return ROUTES.HOME;
    if (user?.role === 'CITIZEN') return ROUTES.CITIZEN_COMPLAINT_DETAIL(complaintId);
    if (user?.role === 'OFFICER') return ROUTES.OFFICER_COMPLAINT_DETAIL(complaintId);
    return ROUTES.ADMIN_COMPLAINT_DETAIL(complaintId);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Notification History</h1>
          <p className="text-xs text-slate-500 mt-1">
            System alerts, officer investigation updates, deadline reminders, and resolution approvals (SRS Section 9).
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => markAllAsRead()}>
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No notifications received"
              description="Important grievance updates, assignment changes, and review decisions will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const isUnread = !n.read;

              return (
                <div
                  key={n.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                    isUnread ? 'bg-sky-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isUnread ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold text-slate-900">{n.title}</h2>
                        {isUnread && (
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                            UNREAD
                          </span>
                        )}
                        {/* Email delivery badge per Section 12: only shown if backend reports it */}
                        {n.emailDeliveryStatus && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${
                              n.emailDeliveryStatus === 'SENT'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <Mail className="w-3 h-3" />
                            Email: {n.emailDeliveryStatus}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{formatDate(n.createdAt)}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {n.relatedComplaintId && (
                      <Link
                        to={getComplaintLink(n.relatedComplaintId)}
                        onClick={() => markAsRead(n.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Open {n.relatedComplaintId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
