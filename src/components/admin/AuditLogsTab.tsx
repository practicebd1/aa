import React, { useState } from 'react';
import { History, Clock, Filter, Shield } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState('All');

  const actions = ['All', ...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    if (filterAction !== 'All' && l.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-stone-900">
            Administrative Audit Trail ({logs.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Chronological ledger recording all course creations, edits, deletions, video uploads, and playlist sync operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800"
          >
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {filtered.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50 transition-colors text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-stone-900 text-amber-400">
                      {log.action}
                    </span>
                    {log.targetType && (
                      <span className="text-[11px] font-semibold text-stone-500">
                        Target: {log.targetType}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-stone-800 text-xs sm:text-sm">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-stone-400 text-xs shrink-0 sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs font-semibold">No audit logs recorded for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
