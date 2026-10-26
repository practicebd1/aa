import React, { useState, useEffect } from 'react';
import { Sliders, Key, Lock, Mail, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { PlatformSettings } from '../../types';
import { api } from '../../services/api';
import { SupabaseSettingsCard } from './SupabaseSettingsCard';

interface SettingsTabProps {
  settings: PlatformSettings | null;
  onRefreshSettings: () => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onRefreshSettings }) => {
  // Platform details
  const [platformName, setPlatformName] = useState(settings?.siteName || 'SkillStream Learning Platform');
  const [supportEmail, setSupportEmail] = useState(settings?.contactEmail || 'practicebd22@gmail.com');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [platformMessage, setPlatformMessage] = useState<string | null>(null);

  // Admin credentials update
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credMessage, setCredMessage] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.siteName);
      setSupportEmail(settings.contactEmail);
    }
  }, [settings]);

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlatformMessage(null);
    setLoading(true);

    try {
      await api.updateSettings({
        siteName: platformName,
        contactEmail: supportEmail,
        ...(youtubeApiKey.trim() ? { youtubeApiKey: youtubeApiKey.trim() } : {})
      });
      setPlatformMessage('Platform configuration and YouTube API key updated successfully.');
      setYoutubeApiKey('');
      await onRefreshSettings();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.updateCredentials({
        ...(adminEmail.trim() ? { email: adminEmail.trim() } : {}),
        ...(newPassword.trim() ? { password: newPassword.trim() } : {})
      });
      setCredMessage('Administrator credentials updated securely.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setCredError(err.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h2 className="font-heading font-bold text-xl text-stone-900">
          Platform Settings & Integration Keys
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure API credentials, platform identity, and administrator authentication.
        </p>
      </div>

      {/* Supabase Cloud Backend Card */}
      <SupabaseSettingsCard />

      {/* Platform & YouTube API Key Configuration */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-stone-900">
              YouTube Data API v3 Key
            </h3>
            <p className="text-xs text-stone-500">
              Optional but recommended for high-volume playlist synchronization. (Web scraping fallback is automatically used when key is omitted).
            </p>
          </div>
        </div>

        {platformMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{platformMessage}</span>
          </div>
        )}

        <form onSubmit={handleSavePlatformSettings} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 uppercase text-xs">
                YouTube Data API Key
              </label>
              <span className={`text-[11px] font-bold ${settings?.youtubeApiKeyConfigured ? 'text-emerald-600' : 'text-stone-400'}`}>
                {settings?.youtubeApiKeyConfigured ? '● Active Key Stored' : '○ Not Configured (Scraper Active)'}
              </span>
            </div>
            <input
              type="password"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder={settings?.youtubeApiKeyConfigured ? '•••••••••••••••••••••••• (Leave blank to keep current key)' : 'AIzaSy...'}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-mono text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-heading font-bold text-xs tracking-wider rounded-xl shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Credentials & Password Change */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-xl bg-stone-100 text-stone-900">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-stone-900">
              Administrator Credentials & Password
            </h3>
            <p className="text-xs text-stone-500">
              Modify the email address or update the master password required for CMS access.
            </p>
          </div>
        </div>

        {credMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{credMessage}</span>
          </div>
        )}

        {credError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{credError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Change Admin Email (Optional)
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="practicebd22@gmail.com"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (!adminEmail && !newPassword)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider rounded-xl shadow-sm disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Update Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
