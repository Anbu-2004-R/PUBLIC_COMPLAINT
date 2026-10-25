import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, AnalyticsSummary } from '../../services/analyticsService';
import { adminService } from '../../services/adminService';
import { Complaint } from '../../types';
import { ROUTES } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useTheme } from '../../app/ThemeContext';
import {
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export function AdminOverview() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [deptWorkload, setDeptWorkload] = useState<any[]>([]);
  const [unassignedList, setUnassignedList] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sum, dist, workload, unassigned] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getStatusDistribution(),
        analyticsService.getDepartmentWorkload(),
        adminService.getUnassignedQueue({ size: 5 }),
      ]);
      setSummary(sum);
      setStatusDistribution(dist);
      setDeptWorkload(workload);
      setUnassignedList(unassigned.items);
    } catch (err: any) {
      setError(err.message || 'Unable to load administrative overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Failed to load system data.'} onRetry={loadData} />;
  }

  const tooltipBg = isDark ? '#152238' : '#ffffff';
  const tooltipBorder = isDark ? '#29384D' : '#E2E8F0';
  const tooltipText = isDark ? '#F1F5F9' : '#0F172A';
  const axisColor = isDark ? '#94A3B8' : '#64748b';

  return (
    <div className="space-y-5">
      {/* Header: Compact on Single Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
            Administrator Oversight Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System-wide operational tracking, departmental workload compliance, and resolution reviews.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={ROUTES.ADMIN_UNASSIGNED}>
            <Button size="sm" variant={summary.unassigned > 0 ? 'danger' : 'outline'}>
              Unassigned ({summary.unassigned})
            </Button>
          </Link>
          <Link to={ROUTES.ADMIN_REVIEWS}>
            <Button size="sm" variant="primary">
              Reviews Due ({summary.awaitingReview})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip: 7 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="p-3 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
            Total Cases
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] tabular-nums mt-0.5">{summary.total}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Registry total</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-indigo-200 dark:border-indigo-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
            In Progress
          </span>
          <p className="text-xl font-bold text-indigo-900 dark:text-indigo-300 tabular-nums mt-0.5">{summary.inProgress}</p>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Active</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-amber-200 dark:border-amber-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
            Unassigned
          </span>
          <p className="text-xl font-bold text-amber-900 dark:text-amber-300 tabular-nums mt-0.5">{summary.unassigned}</p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400">Needs routing</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-purple-200 dark:border-purple-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
            Reviews Due
          </span>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-300 tabular-nums mt-0.5">{summary.awaitingReview}</p>
          <span className="text-[10px] text-purple-700 dark:text-purple-400">Reports filed</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-teal-200 dark:border-teal-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
            Citizen Window
          </span>
          <p className="text-xl font-bold text-teal-900 dark:text-teal-300 tabular-nums mt-0.5">
            {summary.resolvedAwaitingFeedback}
          </p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400">7-day recourse</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-rose-200 dark:border-rose-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
            Overdue
          </span>
          <p className="text-xl font-bold text-rose-900 dark:text-rose-300 tabular-nums mt-0.5">{summary.overdue}</p>
          <span className="text-[10px] text-rose-700 dark:text-rose-400">Target missed</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#152238] border border-emerald-200 dark:border-emerald-800/60 rounded-xl shadow-xs transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Compliance
          </span>
          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 tabular-nums mt-0.5">
            {summary.complianceRate}%
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">SLA adherence</span>
        </div>
      </div>

      {/* Unassigned Emergency Queue Alert */}
      {summary.unassigned > 0 && (
        <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                Unassigned Queue Alert ({summary.unassigned} grievances awaiting routing)
              </h2>
            </div>
            <Link
              to={ROUTES.ADMIN_UNASSIGNED}
              className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-amber-200/60 dark:divide-amber-800/50 bg-white/90 dark:bg-[#152238] rounded-lg border border-amber-200 dark:border-amber-800/60 overflow-hidden text-xs">
            {unassignedList.map((c) => (
              <div key={c.id} className="p-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 mr-2">{c.id}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{c.title}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {c.categoryName} · {c.wardZoneName}
                  </p>
                </div>
                <Link to={ROUTES.ADMIN_COMPLAINT_DETAIL(c.id)} className="shrink-0">
                  <Button size="sm" variant="primary">
                    Assign Officer
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl p-4 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">Complaint Status Distribution</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Live breakdown across lifecycle stages</p>
            </div>
            <Link
              to={ROUTES.ADMIN_ANALYTICS}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
            >
              Full Analytics →
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} complaints`, 'Count']}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipText,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: tooltipText }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Bar Chart */}
        <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl p-4 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">Department Workload Distribution</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Active vs. resolved cases across divisions</p>
            </div>
            <Link
              to={ROUTES.ADMIN_ANALYTICS}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
            >
              View Trends →
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department" stroke={axisColor} fontSize={11} />
                <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipText,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: tooltipText }} />
                <Bar
                  dataKey="active"
                  name="Active Cases"
                  fill={isDark ? '#38BDF8' : '#1E2A44'}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
