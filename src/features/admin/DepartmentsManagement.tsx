import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { Department } from '../../config/referenceData';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { Building2, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';

export function DepartmentsManagement() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Department Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headOfficerName, setHeadOfficerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await adminService.getDepartments();
      setDepartments(list);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve departments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setHeadOfficerName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description);
    setHeadOfficerName(dept.headOfficerName);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Department = {
        id: editingDept?.id || 'dept-' + Date.now(),
        name,
        code,
        description,
        headOfficerName,
        activeStatus: true,
      };
      await adminService.saveDepartment(payload);
      showToast({
        type: 'success',
        title: editingDept ? 'Department Updated' : 'Department Created',
        message: `${name} (${code}) configured successfully.`,
      });
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Municipal Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure administrative departments responsible for investigating and resolving public complaints (SRS FR-26).
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Department
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchDepartments} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Description / Responsibility</th>
                  <th className="py-3 px-4">Head Engineer / Officer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {dept.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {dept.code}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">{dept.description}</td>
                      <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap font-medium">
                        {dept.headOfficerName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px]">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(dept)}>
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Department Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Municipal Department' : 'Add New Department'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Department Full Name"
            required
            placeholder="e.g. Solid Waste Management & Sanitation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Short Code"
              required
              placeholder="e.g. SWMS"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Head Officer / Engineer"
              required
              placeholder="e.g. Dr. Suresh Patil"
              value={headOfficerName}
              onChange={(e) => setHeadOfficerName(e.target.value)}
            />
          </div>

          <Textarea
            label="Functional Scope & Jurisdiction"
            required
            rows={3}
            placeholder="Describe public services managed by this department..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSaving}>
              Save Department
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
