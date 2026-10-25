import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../utils/formatting';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

export function UsersList() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('CITIZEN');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Toggle Confirmation
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await adminService.getUsers({ role: roleFilter || undefined, search: search.trim() || undefined });
      setUsers(list);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve user directory.');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggleConfirm = async () => {
    if (!targetUser) return;
    const nextStatus = targetUser.accountStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    setIsUpdating(true);

    try {
      await adminService.updateUserStatus(
        targetUser.id,
        nextStatus,
        `Administrative status update by administrator: changed to ${nextStatus}`
      );
      showToast({
        type: 'success',
        title: 'Account Status Updated',
        message: `${targetUser.fullName} has been ${nextStatus.toLowerCase()}. Complaint histories are preserved.`,
      });
      setTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage citizen complainant accounts and system access privileges. Deactivating disables login but never erases history.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[38px]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[38px] bg-white text-slate-700 sm:w-48"
        >
          <option value="">All Roles</option>
          <option value="CITIZEN">Citizens Only</option>
          <option value="OFFICER">Officers Only</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchUsers} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email Verified</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      No accounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isActive = u.accountStatus === 'ACTIVE';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {u.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">{u.phone}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.emailVerified ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              Verified
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {u.accountStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="sm"
                              variant={isActive ? 'danger' : 'outline'}
                              onClick={() => setTargetUser(u)}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
                              {isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={targetUser !== null}
        onClose={() => setTargetUser(null)}
        onConfirm={handleStatusToggleConfirm}
        isLoading={isUpdating}
        isDestructive={targetUser?.accountStatus === 'ACTIVE'}
        title={targetUser?.accountStatus === 'ACTIVE' ? 'Deactivate User Account' : 'Reactivate User Account'}
        consequenceText={
          targetUser?.accountStatus === 'ACTIVE'
            ? `Deactivating ${targetUser?.fullName}'s account prevents future sign-ins. In accordance with SRS FR-04 and 10.9, all submitted complaint records, evidence, and audit histories remain intact and will continue to be processed.`
            : `Reactivating ${targetUser?.fullName}'s account will restore normal login access immediately.`
        }
        confirmLabel={targetUser?.accountStatus === 'ACTIVE' ? 'Confirm Deactivation' : 'Confirm Activation'}
      />
    </div>
  );
}
