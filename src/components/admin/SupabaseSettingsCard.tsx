import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Code2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Layers,
  FileText
} from 'lucide-react';
import { SupabaseStatus } from '../../types';
import { api } from '../../services/api';

export const SupabaseSettingsCard: React.FC = () => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getSupabaseStatus();
      setStatus(res.status);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to check Supabase connection.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await api.getSupabaseSchema();
      setSqlSchema(res.sql);
      setShowSqlModal(true);
    } catch (err: any) {
      alert('Failed to load SQL schema: ' + err.message);
    }
  };

  const handlePushData = async () => {
    setActionLoading('push');
    setMessage(null);
    try {
      const res = await api.pushToSupabase();
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Successfully pushed data to Supabase! (${res.pushed.courses} courses, ${res.pushed.sections} sections, ${res.pushed.lessons} lessons, ${res.pushed.playlists} playlists).`,
        });
        await fetchStatus();
      } else {
        setMessage({
          type: 'error',
          text: `Push finished with warnings: ${res.errors.join(', ')}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to push data to Supabase. Ensure tables are created first.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePullData = async () => {
    if (!confirm('Pulling data will update your local cache with records from Supabase. Continue?')) {
      return;
    }
    setActionLoading('pull');
    setMessage(null);
    try {
      const res = await api.pullFromSupabase();
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Successfully synced from Supabase! Pulled ${res.counts?.courses || 0} courses and ${res.counts?.lessons || 0} lessons.`,
        });
        await fetchStatus();
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Failed to pull data.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to pull data from Supabase.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-stone-900">
                Supabase Backend Database
              </h3>
              {status?.connected && status.tablesExist ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Synced
                </span>
              ) : status?.connected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Connected · Needs Schema
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Connecting...
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Cloud PostgreSQL database powered by Supabase project <code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">cksbfdfteqqsngdbfvte</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : message.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-stone-50 border-stone-200 text-stone-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* Connection & Configuration Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <span className="text-stone-500 font-medium block">Project URL</span>
          <span className="font-mono text-stone-800 block truncate" title={status?.projectUrl}>
            {status?.projectUrl || 'https://cksbfdfteqqsngdbfvte.supabase.co'}
          </span>
        </div>

        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <span className="text-stone-500 font-medium block">Project ID</span>
          <span className="font-mono text-stone-800 font-bold block">
            {status?.projectId || 'cksbfdfteqqsngdbfvte'}
          </span>
        </div>

        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <span className="text-stone-500 font-medium block">API Key (Anon)</span>
          <span className="font-mono text-stone-800 block truncate" title={status?.anonKeyMasked}>
            {status?.anonKeyMasked || '••••••••'}
          </span>
        </div>
      </div>

      {/* Table Status Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            Supabase PostgreSQL Tables
          </h4>
          <span className="text-[11px] text-stone-500">
            {status?.tablesExist
              ? 'All required tables are verified in Supabase.'
              : 'Tables must be created using the SQL Editor.'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { key: 'courses', label: 'public.courses', count: status?.counts?.courses },
            { key: 'sections', label: 'public.sections', count: status?.counts?.sections },
            { key: 'lessons', label: 'public.lessons', count: status?.counts?.lessons },
            { key: 'playlists', label: 'public.playlists', count: status?.counts?.playlists },
            { key: 'audit_logs', label: 'public.audit_logs' },
            { key: 'app_users', label: 'public.app_users' },
            { key: 'platform_settings', label: 'public.platform_settings' },
          ].map((t) => {
            const exists = status?.tables ? (status.tables as any)[t.key] : false;
            return (
              <div
                key={t.key}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  exists
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="truncate">
                  <span className="font-mono text-[11px] block truncate font-medium">{t.label}</span>
                  {t.count !== undefined && exists && (
                    <span className="text-[10px] text-emerald-700">{t.count} records</span>
                  )}
                </div>
                {exists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />
                ) : (
                  <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-200/70 px-1.5 py-0.5 rounded">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice & Setup Guide */}
      {!status?.tablesExist && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Action Required: Initialize Supabase Schema</span>
          </div>
          <p className="leading-relaxed text-amber-900">
            Your Supabase project is reachable, but the tables (courses, sections, lessons, etc.) have not been created yet in PostgreSQL. Follow these quick steps:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-amber-900 font-medium">
            <li>Click <strong>"View / Copy SQL Schema"</strong> below to copy the pre-built DDL script.</li>
            <li>Go to your <strong>Supabase Dashboard</strong> &rarr; <strong>SQL Editor</strong>.</li>
            <li>Click <strong>"New query"</strong>, paste the script, and click <strong>"Run"</strong>.</li>
            <li>Return here and click <strong>"Check Status"</strong>, then <strong>"Push Local Data"</strong> to migrate all courses.</li>
          </ol>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={fetchSchema}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-heading font-bold text-xs tracking-wider transition-colors shadow-sm"
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>View / Copy SQL Schema</span>
        </button>

        <button
          type="button"
          onClick={handlePushData}
          disabled={actionLoading !== null}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-heading font-bold text-xs tracking-wider transition-colors shadow-sm disabled:opacity-50"
        >
          <UploadCloud className={`w-4 h-4 ${actionLoading === 'push' ? 'animate-bounce' : ''}`} />
          <span>{actionLoading === 'push' ? 'Pushing Data...' : 'Push Local Data to Supabase'}</span>
        </button>

        <button
          type="button"
          onClick={handlePullData}
          disabled={actionLoading !== null || !status?.tablesExist}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-heading font-bold text-xs tracking-wider transition-colors disabled:opacity-50"
          title={!status?.tablesExist ? 'Create tables in Supabase first' : 'Pull latest records from Supabase'}
        >
          <DownloadCloud className={`w-4 h-4 ${actionLoading === 'pull' ? 'animate-spin' : ''}`} />
          <span>{actionLoading === 'pull' ? 'Pulling...' : 'Pull from Supabase'}</span>
        </button>

        <a
          href="https://supabase.com/dashboard/project/cksbfdfteqqsngdbfvte/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2.5 text-stone-600 hover:text-stone-900 text-xs font-semibold ml-auto transition-colors"
        >
          <span>Open Supabase SQL Editor</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
                    Supabase PostgreSQL Schema (DDL)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tables: courses, sections, lessons, playlists, audit_logs, platform_settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Ready to paste into Supabase SQL Editor:
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed select-all">
                {sqlSchema}
              </pre>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
                <span className="font-bold text-stone-800 block">How to run in Supabase:</span>
                <p>
                  1. Copy the script using the button above.<br />
                  2. Go to <strong>https://supabase.com/dashboard/project/cksbfdfteqqsngdbfvte/editor</strong><br />
                  3. Click <strong>New query</strong>, paste the code, and click the green <strong>Run</strong> button.<br />
                  4. Close this modal and click <strong>"Push Local Data to Supabase"</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
