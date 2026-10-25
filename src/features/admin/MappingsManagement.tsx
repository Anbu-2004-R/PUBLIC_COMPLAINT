import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { Category, Department } from '../../config/referenceData';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { PriorityBadge } from '../../components/ui/Badge';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { GitFork, Edit2, ShieldAlert } from 'lucide-react';

export function MappingsManagement() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Mapping Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<any>('HIGH');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, depts] = await Promise.all([
        adminService.getCategories(),
        adminService.getDepartments(),
      ]);
      setCategories(cats);
      setDepartments(depts);
    } catch {
      // transient
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setSelectedDeptId(cat.departmentId);
    setSelectedPriority(cat.defaultPriority);
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSaving(true);

    try {
      const updated: Category = {
        ...editingCategory,
        departmentId: selectedDeptId,
        defaultPriority: selectedPriority,
      };
      await adminService.saveCategory(updated);
      showToast({
        type: 'success',
        title: 'Routing Mapping Updated',
        message: `${editingCategory.name} will now route to ${
          departments.find((d) => d.id === selectedDeptId)?.name
        }.`,
      });
      setEditingCategory(null);
      fetchData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Routing & Service Mappings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Category-to-department and service mappings used by the automated routing engine (SRS FR-09, FR-26).
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
        <strong>Routing Architecture (SRS Section 8.1):</strong> When a complaint is submitted, the system queries
        these mappings to identify the responsible department, retrieves eligible officers in the complainant's ward,
        and assigns the officer with lowest active caseload.
      </div>

      {/* Mappings Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Grievance Category</th>
                <th className="py-3 px-4">Mapped Responsible Department</th>
                <th className="py-3 px-4">Department Code</th>
                <th className="py-3 px-4">Default Priority</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : (
                categories.map((cat) => {
                  const dept = departments.find((d) => d.id === cat.departmentId);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {cat.name}
                        <p className="text-[11px] text-slate-500 font-normal">{cat.description}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-medium">
                        {dept?.name || 'Unmapped'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {dept?.code || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={cat.defaultPriority} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(cat)}>
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit Mapping
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Mapping Modal */}
      <Dialog
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title={`Configure Routing: ${editingCategory?.name}`}
      >
        <form onSubmit={handleSaveMapping} className="space-y-4 text-xs">
          <Select
            label="Assigned Department Division"
            required
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>

          <Select
            label="Default Initial Priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="CRITICAL">CRITICAL (15m ack, 24/7 supervisor alerts)</option>
            <option value="HIGH">HIGH (4 working hours ack)</option>
            <option value="MEDIUM">MEDIUM (1 working day ack)</option>
            <option value="LOW">LOW (3 working days ack)</option>
          </Select>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSaving}>
              Save Mapping Rules
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
