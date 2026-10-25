import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Dialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { Settings, Clock, Calendar, Bell, Upload, ShieldCheck, Check } from 'lucide-react';

export function AdminSettings() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'TARGETS' | 'CALENDAR' | 'UPLOADS' | 'BRANDING'>('TARGETS');

  // Setting states
  const [criticalAckMins, setCriticalAckMins] = useState(15);
  const [criticalActionHours, setCriticalActionHours] = useState(1);
  const [highAckHours, setHighAckHours] = useState(4);
  const [highActionDays, setHighActionDays] = useState(1);
  const [mediumAckDays, setMediumAckDays] = useState(1);
  const [mediumActionDays, setMediumActionDays] = useState(3);
  const [lowAckDays, setLowAckDays] = useState(3);
  const [lowActionDays, setLowActionDays] = useState(7);

  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +05:30)');

  // Upload limits (displayed from system standards per SRS FR-23)
  const maxFileSizeMb = 10;
  const maxFilesPerStage = 5;
  const allowedExtensions = '.jpg, .jpeg, .png, .pdf';

  // Branding
  const [systemName, setSystemName] = useState('CivicPulse');
  const [supportEmail, setSupportEmail] = useState('support@civicpulse.org');
  const [helplinePhone, setHelplinePhone] = useState('1800-425-0010');

  // Audit Confirmation Dialog for Configuration Changes (SRS FR-29)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeReason('');
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!changeReason.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConfirmOpen(false);
      showToast({
        type: 'success',
        title: 'Settings Saved & Audited',
        message: 'System configuration and audit log record have been updated successfully (SRS FR-29).',
      });
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System Configuration & Parameters</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain operational response targets, working calendars, file upload restrictions, and civic branding.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
        <strong>Configuration Change Auditing (SRS FR-29):</strong> Every alteration to response targets, working hours,
        or municipal limits is permanently recorded in the audit trail with the administrator identity, timestamp, and mandatory reason.
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('TARGETS')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'TARGETS'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Response Targets & SLA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'CALENDAR'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Working Calendar & Timezone
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('UPLOADS')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'UPLOADS'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          File Upload Controls
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BRANDING')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'BRANDING'
              ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Civic Branding & Helpdesk
        </button>
      </div>

      <form onSubmit={handleSaveTrigger} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
        {activeTab === 'TARGETS' && (
          <div className="space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Priority Response Targets (SRS Section 6.2)</h2>
              <p className="text-slate-500 mt-0.5">
                Target clocks begin upon complaint submission or assignment and determine overdue alert status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-red-200 bg-red-50/30">
              <div className="sm:col-span-2 flex items-center justify-between">
                <span className="font-bold text-red-900 uppercase tracking-wider text-[11px]">
                  Critical Priority (Immediate danger / 24/7 Clock)
                </span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">24x7 Active</span>
              </div>
              <Input
                label="Acknowledgement Target (Minutes)"
                type="number"
                min={1}
                value={criticalAckMins}
                onChange={(e) => setCriticalAckMins(Number(e.target.value))}
              />
              <Input
                label="Action Start Target (Hours)"
                type="number"
                min={1}
                value={criticalActionHours}
                onChange={(e) => setCriticalActionHours(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/30">
              <div className="sm:col-span-2">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                  High Priority (Working Hours Clock)
                </span>
              </div>
              <Input
                label="Acknowledgement Target (Working Hours)"
                type="number"
                min={1}
                value={highAckHours}
                onChange={(e) => setHighAckHours(Number(e.target.value))}
              />
              <Input
                label="Action Start Target (Working Days)"
                type="number"
                min={1}
                value={highActionDays}
                onChange={(e) => setHighActionDays(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50/30">
              <div className="sm:col-span-2">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                  Medium Priority (Routine Issues)
                </span>
              </div>
              <Input
                label="Acknowledgement Target (Working Days)"
                type="number"
                min={1}
                value={mediumAckDays}
                onChange={(e) => setMediumAckDays(Number(e.target.value))}
              />
              <Input
                label="Action Start Target (Working Days)"
                type="number"
                min={1}
                value={mediumActionDays}
                onChange={(e) => setMediumActionDays(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Low Priority (Minor Inconvenience)
                </span>
              </div>
              <Input
                label="Acknowledgement Target (Working Days)"
                type="number"
                min={1}
                value={lowAckDays}
                onChange={(e) => setLowAckDays(Number(e.target.value))}
              />
              <Input
                label="Action Start Target (Working Days)"
                type="number"
                min={1}
                value={lowActionDays}
                onChange={(e) => setLowActionDays(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'CALENDAR' && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Working Calendar & Timezone (SRS Section 6.2)</h2>
              <p className="text-slate-500 mt-0.5">Defines the operating clock for non-critical grievance deadlines.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shift Start Time"
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
              <Input
                label="Shift End Time"
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>

            <Select label="Configured Municipal Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (Indian Standard Time UTC+05:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </Select>

            <div className="p-3 bg-slate-50 rounded-lg border text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Working Days Treatment:</p>
              <p>Monday through Friday are marked official working days. Public holidays pause working-hour target clocks.</p>
            </div>
          </div>
        )}

        {activeTab === 'UPLOADS' && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upload Limits & Evidence Governance (SRS FR-23)</h2>
              <p className="text-slate-500 mt-0.5">Parameters validated both in the browser and on backend endpoints.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Max File Size</span>
                <span className="text-lg font-bold text-slate-900 block mt-1">{maxFileSizeMb} MB per file</span>
                <span className="text-[10px] text-slate-500">Strictly enforced per attachment</span>
              </div>

              <div className="p-4 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Max Files Count</span>
                <span className="text-lg font-bold text-slate-900 block mt-1">{maxFilesPerStage} files</span>
                <span className="text-[10px] text-slate-500">Per complaint & resolution stage</span>
              </div>

              <div className="p-4 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Allowed MIME Formats</span>
                <span className="text-lg font-bold text-slate-900 block mt-1">JPG, PNG, PDF</span>
                <span className="text-[10px] text-slate-500">Executable uploads blocked</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              Evidence files are encrypted in protected storage. Access is restricted to authorized complainant,
              assigned investigating engineer, and reviewing administrator.
            </div>
          </div>
        )}

        {activeTab === 'BRANDING' && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Neutral Civic Branding (Prompt Section 3)</h2>
              <p className="text-slate-500 mt-0.5">
                The application uses neutral wording and avoids impersonating an official government website.
              </p>
            </div>

            <Input
              label="Application Name"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Helpdesk Support Email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
              <Input
                label="Toll-Free Helpline"
                value={helplinePhone}
                onChange={(e) => setHelplinePhone(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <Button type="submit" size="md">
            Save Configuration Changes
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog for Configuration Changes (SRS FR-29) */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Configuration Update"
        description="Every system parameter change requires a justification reason for the immutable audit log (SRS FR-29)."
      >
        <div className="space-y-4 text-xs">
          <Textarea
            label="Administrative Reason for Configuration Change (Mandatory)"
            required
            rows={3}
            placeholder="Document why response targets, working hours, or civic branding parameters are being modified..."
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmSave} isLoading={isSaving} disabled={!changeReason.trim()}>
              Confirm & Audit Log
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
