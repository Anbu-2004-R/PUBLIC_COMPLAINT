import React, { useEffect, useState } from 'react';
import { analyticsService, AnalyticsSummary } from '../../services/analyticsService';
import { DEPARTMENTS, CATEGORIES, WARDS_ZONES } from '../../config/referenceData';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Download, Filter, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function AdminAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      analyticsService.getSummary(),
      analyticsService.getStatusDistribution(),
      analyticsService.getDepartmentWorkload(),
      analyticsService.getTrendData(),
    ])
      .then(([sum, dist, work, tr]) => {
        setSummary(sum);
        setStatusDist(dist);
        setWorkload(work);
        setTrends(tr);
      })
      .catch((err) => setError(err.message || 'Unable to retrieve analytics data.'))
      .finally(() => setIsLoading(false));
  }, [granularity]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Failed to load analytics.'} />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Administrative Analytics & Reporting</h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental throughput, SLA target compliance, and resolution trend analytics (SRS FR-22).
          </p>
        </div>

        {/* Exports per Section 10 */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled title="Backend export endpoint pending connection">
            <Download className="w-3.5 h-3.5 mr-1" />
            PDF Export (Not yet connected)
          </Button>
          <Button variant="outline" size="sm" disabled title="Backend export endpoint pending connection">
            <Download className="w-3.5 h-3.5 mr-1" />
            XLSX Export (Not yet connected)
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">SLA Compliance Rate</span>
          <p className="text-2xl font-bold text-emerald-900 tabular-nums mt-1">{summary.complianceRate}%</p>
          <span className="text-[11px] text-emerald-700 font-medium">Met acknowledgement & start target</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Avg Acknowledgement</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{summary.avgAckHours} hours</p>
          <span className="text-[11px] text-slate-500">Across all priority tiers</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Avg Resolution Time</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{summary.avgResolutionDays} days</p>
          <span className="text-[11px] text-slate-500">Submission to approved report</span>
        </div>

        <div className="p-5 bg-white border border-rose-200 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 block">Active Overdue Cases</span>
          <p className="text-2xl font-bold text-rose-900 tabular-nums mt-1">{summary.overdue}</p>
          <span className="text-[11px] text-rose-700">Missed target milestone</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complaint Inflow vs. Resolution Trend</h2>
              <p className="text-xs text-slate-500">Daily intake compared against approved remediation closures</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              {(['day', 'week', 'month'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-2.5 py-1 rounded font-semibold capitalize cursor-pointer ${
                    granularity === g ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="submitted" name="New Grievances" stroke="#1E2A44" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" name="Approved Resolutions" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Caseload & Clearance</h2>
            <p className="text-xs text-slate-500">Active investigation vs. completed remediation by division</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="active" name="Active Caseload" fill="#1E2A44" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Cases" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Grievances by Lifecycle Stage</h2>
            <p className="text-xs text-slate-500">System state distribution per SRS v1.1 status matrix</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} complaints`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Interpretation Notice per SRS 15.4 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-600">
          <h2 className="text-sm font-bold text-slate-900">Interpretation Guidelines (SRS Section 15.4)</h2>
          <ul className="list-disc pl-4 space-y-2 leading-relaxed text-slate-700">
            <li>
              <strong>Administrative Closure:</strong> An approved resolution report means the administrator verified the
              evidence and actions under system rules. It does not certify that physical infrastructure has been independently inspected.
            </li>
            <li>
              <strong>Target Compliance:</strong> Calculated against configured working hours (09:00 - 18:00 IST). Critical
              cases run on an unpaused 24/7 clock.
            </li>
            <li>
              <strong>Workload Distribution:</strong> Figures reflect active volume and should not be used as the sole measure
              of individual engineer performance without factoring in complexity.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
