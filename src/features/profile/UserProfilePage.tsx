import React, { useState } from 'react';
import { useAuth } from '../../app/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Lock, CheckCircle2 } from 'lucide-react';

export function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      updateUser({ fullName, phone });
      setIsSavingProfile(false);
      showToast({ type: 'success', title: 'Profile Updated', message: 'Your name and contact phone have been updated.' });
    }, 300);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast({ type: 'success', title: 'Password Changed', message: 'Your login credentials have been updated.' });
    }, 400);
  };

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-3xl pb-8">
      <div className="pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
          User Profile & Account Security
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your contact credentials and password protection (SRS FR-04).
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl p-5 shadow-2xs space-y-5 transition-colors">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-[#29384D]">
          <div className="w-12 h-12 rounded-full bg-[#0B1220] dark:bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">{user.fullName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{user.role}</strong> · Status:{' '}
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Active</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Contact Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              hint="Indian mobile format (+91)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Registered Email Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full text-xs px-3 py-2 bg-slate-100 dark:bg-[#121E33] border border-slate-200 dark:border-[#29384D] rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed min-h-[38px]"
              />
              <span className="shrink-0 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Email change requires separate inbox verification per SRS FR-01.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" isLoading={isSavingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl p-5 shadow-2xs space-y-3.5 transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            Change Account Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Updating your password requires current credentials for security verification.
          </p>
        </div>

        {passwordError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-800 dark:text-rose-300">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
          <Input
            type="password"
            label="Current Password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              type="password"
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Minimum 8 characters"
            />

            <Input
              type="password"
              label="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" variant="outline" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
