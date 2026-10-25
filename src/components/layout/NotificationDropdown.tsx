import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../app/NotificationContext';
import { ROUTES } from '../../config/routes';
import { formatRelativeTime } from '../../utils/formatting';
import { useAuth } from '../../app/AuthContext';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getComplaintLink = (complaintId?: string) => {
    if (!complaintId) return ROUTES.NOTIFICATIONS;
    if (user?.role === 'CITIZEN') return ROUTES.CITIZEN_COMPLAINT_DETAIL(complaintId);
    if (user?.role === 'OFFICER') return ROUTES.OFFICER_COMPLAINT_DETAIL(complaintId);
    return ROUTES.ADMIN_COMPLAINT_DETAIL(complaintId);
  };

  const recentList = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2C47] transition-colors cursor-pointer"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#152238] rounded-xl shadow-xl border border-slate-200 dark:border-[#29384D] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#29384D] bg-slate-50/70 dark:bg-[#121E33]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 px-1.5 py-0.5 rounded">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-teal-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#29384D]">
            {recentList.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No notifications yet.
              </div>
            ) : (
              recentList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-[#1A2C47] transition-colors ${
                    !item.read ? 'bg-sky-50/40 dark:bg-teal-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{item.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    {item.relatedComplaintId ? (
                      <Link
                        to={getComplaintLink(item.relatedComplaintId)}
                        onClick={() => {
                          markAsRead(item.id);
                          setIsOpen(false);
                        }}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:underline flex items-center gap-1"
                      >
                        View Case {item.relatedComplaintId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span />
                    )}
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 border-t border-slate-100 dark:border-[#29384D] bg-slate-50 dark:bg-[#121E33] text-center">
            <Link
              to={ROUTES.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-teal-300 hover:underline block"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
