import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { WardZone } from '../../config/referenceData';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { MapPin, Plus, Edit2 } from 'lucide-react';

export function ZonesManagement() {
  const { showToast } = useToast();
  const [zones, setZones] = useState<WardZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<WardZone | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [zone, setZone] = useState<'North' | 'South' | 'East' | 'West' | 'Central'>('North');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await adminService.getZones();
      setZones(list);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve wards.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleOpenAdd = () => {
    setEditingZone(null);
    setName('');
    setCode('');
    setZone('North');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: WardZone) => {
    setEditingZone(w);
    setName(w.name);
    setCode(w.code);
    setZone(w.zone);
    setDescription(w.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: WardZone = {
        id: editingZone?.id || 'w-' + Date.now(),
        name,
        code,
        zone,
        description,
        activeStatus: true,
      };
      await adminService.saveZone(payload);
      showToast({
        type: 'success',
        title: editingZone ? 'Ward Updated' : 'Ward Created',
        message: `${name} (${zone} Zone) configured successfully.`,
      });
      setIsModalOpen(false);
      fetchZones();
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wards and Geographic Zones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain municipal boundaries used for automated complaint routing and field team assignments (SRS FR-26).
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Ward
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchZones} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Ward Name</th>
                  <th className="py-3 px-4">Ward Code</th>
                  <th className="py-3 px-4">Zone Division</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : (
                  zones.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {w.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {w.code}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {w.zone} Zone
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">{w.description}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px]">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(w)}>
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

      {/* Add / Edit Ward Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Edit Ward / Zone' : 'Add New Municipal Ward'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Ward Name"
            required
            placeholder="e.g. Ward 9 - Whitefield Tech Zone"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ward Code"
              required
              placeholder="e.g. W-09"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Select
              label="Zone Division"
              value={zone}
              onChange={(e) => setZone(e.target.value as any)}
            >
              <option value="North">North Zone</option>
              <option value="South">South Zone</option>
              <option value="East">East Zone</option>
              <option value="West">West Zone</option>
              <option value="Central">Central Zone</option>
            </Select>
          </div>

          <Input
            label="Geographic Scope Description"
            placeholder="Key neighborhoods and arterial roads included..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSaving}>
              Save Ward
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
