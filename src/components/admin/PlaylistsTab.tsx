import React, { useState } from 'react';
import { 
  Youtube, RefreshCw, Plus, ExternalLink, Trash2, 
  CheckCircle2, AlertCircle, Clock, Check, ArrowRight, Layers 
} from 'lucide-react';
import { PlaylistRecord, Course } from '../../types';
import { api } from '../../services/api';
import { ConfirmModal } from '../ConfirmModal';

interface PlaylistsTabProps {
  playlists: PlaylistRecord[];
  courses: Course[];
  onRefreshData: () => Promise<void>;
  onOpenImportModal: () => void;
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({
  playlists,
  courses,
  onRefreshData,
  onOpenImportModal
}) => {
  // Sync state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncDiffModal, setSyncDiffModal] = useState<any | null>(null);
  const [applyingSync, setApplyingSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<PlaylistRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleStartSync = async (record: PlaylistRecord) => {
    setSyncingId(record.id);
    setSyncMessage(null);
    try {
      // dry-run check diff first
      const result = await api.syncPlaylist(record.id, false);
      setSyncDiffModal({
        record,
        diff: result.diff,
        message: result.message
      });
    } catch (err: any) {
      alert(err.message || 'Failed to check playlist updates.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleApplySync = async () => {
    if (!syncDiffModal) return;
    setApplyingSync(true);
    try {
      const result = await api.syncPlaylist(syncDiffModal.record.id, true);
      setSyncMessage(result.message);
      setSyncDiffModal(null);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to apply playlist synchronization.');
    } finally {
      setApplyingSync(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    setDeleting(true);
    try {
      await api.deletePlaylist(playlistToDelete.id);
      setDeleteModalOpen(false);
      setPlaylistToDelete(null);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove playlist record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-stone-900">
            YouTube Playlists & Automatic Sync ({playlists.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Synchronize external batch playlists with structured curriculum lessons and preview updates before applying.
          </p>
        </div>

        <button
          onClick={onOpenImportModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs tracking-wider shadow-sm transition-all"
        >
          <Youtube className="w-4 h-4" />
          <span>+ Import New Playlist</span>
        </button>
      </div>

      {syncMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-700 font-bold">Dismiss</button>
        </div>
      )}

      {/* Playlists Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {playlists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Playlist Title</th>
                  <th className="py-3.5 px-4">Target Course</th>
                  <th className="py-3.5 px-4 text-center">Video Count</th>
                  <th className="py-3.5 px-4">Last Synced</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {playlists.map((record) => {
                  const targetCourse = courses.find(c => c.id === record.courseId);
                  const isSyncing = syncingId === record.id;

                  return (
                    <tr key={record.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <h4 className="font-heading font-bold text-sm text-stone-900">
                            {record.title}
                          </h4>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
                            <span>ID: {record.playlistId}</span>
                            <a
                              href={`https://www.youtube.com/playlist?list=${record.playlistId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-500 hover:text-red-700 inline-flex items-center gap-0.5"
                            >
                              <span>YouTube</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-800">
                          {targetCourse ? targetCourse.title : 'Unlinked Course'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-stone-900 font-mono text-sm">
                          {record.videoCount}
                        </span>
                        <span className="text-stone-400 block text-[10px]">videos imported</span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-500">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{new Date(record.lastSyncedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartSync(record)}
                            disabled={isSyncing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'Checking...' : 'Check & Sync'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setPlaylistToDelete(record);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Delete playlist link record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <Youtube className="w-12 h-12 mx-auto text-stone-300" />
            <h4 className="font-heading font-bold text-base text-stone-800">
              No YouTube Playlists Linked Yet
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              Import YouTube playlists to automatically populate course sections and keep lessons synchronized.
            </p>
          </div>
        )}
      </div>

      {/* Sync Diff Preview Modal */}
      {syncDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Playlist Sync Preview
                </h3>
                <p className="text-xs text-stone-400">
                  {syncDiffModal.record.title} (ID: {syncDiffModal.record.playlistId})
                </p>
              </div>
              <button
                onClick={() => setSyncDiffModal(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="font-semibold text-stone-800">
                  Status: {syncDiffModal.message}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div>New Videos Detected: <strong>{syncDiffModal.diff.newVideos.length}</strong></div>
                  <div>Missing / Removed: <strong>{syncDiffModal.diff.removedVideos.length}</strong></div>
                </div>
              </div>

              {syncDiffModal.diff.newVideos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-800 uppercase text-xs">
                    New Videos to Add:
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                    {syncDiffModal.diff.newVideos.map((v: any) => (
                      <div key={v.id} className="text-xs text-stone-800 truncate">
                        • {v.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {syncDiffModal.diff.newVideos.length === 0 && (
                <p className="text-xs text-stone-500 italic">
                  Curriculum is already up to date with the latest YouTube playlist videos.
                </p>
              )}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSyncDiffModal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySync}
                  disabled={applyingSync || syncDiffModal.diff.newVideos.length === 0}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm disabled:opacity-50"
                >
                  {applyingSync ? 'Applying Updates...' : 'Apply Synchronization'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Unlink Playlist Record?"
        message={`Are you sure you want to delete the sync record for "${playlistToDelete?.title}"? (Existing imported lessons in your course will not be deleted).`}
        confirmLabel="Unlink Playlist"
        isLoading={deleting}
        onConfirm={handleDeletePlaylist}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPlaylistToDelete(null);
        }}
      />
    </div>
  );
};
