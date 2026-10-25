import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { WARDS_ZONES, CATEGORIES } from '../../config/referenceData';
import { ShieldCheck, UserCheck, Clock, MapPin, Edit3 } from 'lucide-react';

export function OfficersList() {
  const { showToast } = useToast();
  const [officers, setOfficers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Officer Modal
  const [selectedOfficer, setSelectedOfficer] = useState<User | null>(null);
  const [availability, setAvailability] = useState<'AVAILABLE' | 'ON_LEAVE' | 'BUSY'>('AVAILABLE');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOfficers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await adminService.getOfficers();
      setOfficers(list);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve department officers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const handleOpenEdit = (officer: User) => {
    setSelectedOfficer(officer);
    setAvailability(officer.availabilityStatus || 'AVAILABLE');
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setIsUpdating(true);
    try {
      await adminService.updateOfficerAvailability(selectedOfficer.id, availability);
      showToast({
        type: 'success',
        title: 'Officer Availability Updated',
        message: `${selectedOfficer.fullName} is now set to ${availability}. Routing engine will update automatic workload dispatch.`,
      });
      setSelectedOfficer(null);
      fetchOfficers();
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Department Officers & Eligibility</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage engineer profiles, assigned department divisions, category/ward eligibility, and real-time availability.
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
        <strong>Automatic Assignment Logic (SRS FR-09):</strong> The routing engine only dispatches complaints to officers
        who are actively marked <em>Available</em> and have matching category and zone eligibility. Setting an officer to
        <em>On Leave</em> diverts incoming cases to alternative eligible colleagues with lowest active caseload.
      </div>

      {/* Officers Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchOfficers} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Availability Status</th>
                  <th className="py-3 px-4">Eligible Zones</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                ) : (
                  officers.map((off) => {
                    const isAvailable = off.availabilityStatus === 'AVAILABLE';
                    const isOnLeave = off.availabilityStatus === 'ON_LEAVE';

                    return (
                      <tr key={off.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {off.fullName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {off.employeeId || 'OFF-N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-medium">
                          {off.departmentName || 'Public Works'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {off.email}
                          <p className="text-[10px] text-slate-400 tabular-nums">{off.phone}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isOnLeave
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {off.availabilityStatus || 'AVAILABLE'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {off.eligibleZoneIds && off.eligibleZoneIds.length > 0 ? (
                            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {off.eligibleZoneIds.length} wards assigned
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">All Municipal Zones</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(off)}>
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Update Status
                          </Button>
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

      {/* Edit Availability Modal */}
      <Dialog
        isOpen={selectedOfficer !== null}
        onClose={() => setSelectedOfficer(null)}
        title={`Update Status: ${selectedOfficer?.fullName}`}
      >
        <form onSubmit={handleSaveAvailability} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border rounded space-y-1">
            <p className="font-semibold text-slate-900">{selectedOfficer?.fullName}</p>
            <p className="text-slate-500">{selectedOfficer?.departmentName} · {selectedOfficer?.employeeId}</p>
          </div>

          <Select
            label="Availability Status"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
          >
            <option value="AVAILABLE">AVAILABLE (Receiving automated grievance dispatch)</option>
            <option value="ON_LEAVE">ON_LEAVE (Diverts complaints to alternative officers)</option>
            <option value="BUSY">BUSY (Temporarily reserved for critical emergency response)</option>
          </Select>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setSelectedOfficer(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isUpdating}>
              Save Availability
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
