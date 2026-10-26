import React, { useState } from 'react';
import { X, Youtube, CheckCircle2, AlertCircle, Layers, BookOpen } from 'lucide-react';
import { Course } from '../../types';
import { api } from '../../services/api';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({
  isOpen,
  courses,
  onClose,
  onSuccess
}) => {
  const [urlOrId, setUrlOrId] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?.id || '');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillBatch19 = () => {
    setUrlOrId('PLNgtm77fkk0wewVZUM-4l5jSlYx9ZENzX');
    setSectionTitle('Batch 19 Complete Masterclass');
  };

  const handleFillBatch20 = () => {
    setUrlOrId('PLCpvPpk0dyXs');
    setSectionTitle('Batch 20 Complete Masterclass');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrId.trim()) {
      setError('Please provide a valid YouTube playlist URL or 34-character playlist ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      let finalCourseId = targetCourseId;

      // If user chose to create a new course first:
      if (mode === 'new') {
        const createdCourse = await api.createCourse({
          title: newCourseTitle.trim() || 'New YouTube Masterclass',
          shortDescription: 'Comprehensive course imported directly from YouTube playlist.',
          category: 'Digital Marketing',
          level: 'All Levels',
          status: 'published'
        });
        finalCourseId = createdCourse.id;
      }

      const res = await api.importPlaylist({
        urlOrId: urlOrId.trim(),
        courseId: finalCourseId,
        sectionTitle: sectionTitle.trim() || undefined,
        createNewSection: true
      });

      setResultMessage(`Successfully imported "${res.playlistTitle}" with ${res.importedCount} lessons!`);
      await onSuccess();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to extract or import YouTube playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <h3 className="font-heading font-bold text-base text-white">
              Import YouTube Playlist
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Shortcuts Helper */}
        <div className="bg-stone-50 px-6 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-stone-500 font-semibold">Test Batch Shortcuts:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillBatch19}
              className="px-2 py-0.5 rounded bg-white border border-stone-300 hover:bg-stone-100 font-mono text-[11px] text-stone-800"
            >
              Batch 19 Playlist
            </button>
            <button
              type="button"
              onClick={handleFillBatch20}
              className="px-2 py-0.5 rounded bg-white border border-stone-300 hover:bg-stone-100 font-mono text-[11px] text-stone-800"
            >
              Batch 20 Playlist
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-700 text-xs font-medium border-b border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resultMessage && (
          <div className="px-6 py-3 bg-emerald-50 text-emerald-800 text-xs font-medium border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Playlist URL / ID */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              YouTube Playlist URL or Playlist ID *
            </label>
            <input
              type="text"
              required
              value={urlOrId}
              onChange={(e) => setUrlOrId(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=PLNgtm77... or ID"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-400 font-mono text-xs"
            />
          </div>

          {/* Import Destination Options */}
          <div className="space-y-2 pt-2">
            <label className="font-bold text-stone-700 uppercase text-xs block">
              Import Destination
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                  mode === 'existing'
                    ? 'bg-amber-400/20 border-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4 mt-0.5 text-stone-800 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Existing Course</div>
                  <div className="text-[10px] text-stone-500 font-normal">Add as a new section</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('new')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                  mode === 'new'
                    ? 'bg-amber-400/20 border-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <BookOpen className="w-4 h-4 mt-0.5 text-stone-800 shrink-0" />
                <div>
                  <div className="text-xs font-bold">New Course</div>
                  <div className="text-[10px] text-stone-500 font-normal">Create standalone course</div>
                </div>
              </button>
            </div>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Select Destination Course
              </label>
              <select
                value={targetCourseId}
                onChange={(e) => setTargetCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                New Course Title
              </label>
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Leave blank to use YouTube Playlist Title automatically"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              />
            </div>
          )}

          {/* Section Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Section Title (Optional)
            </label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Leave blank to adopt YouTube Playlist Title"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs tracking-wider shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Extracting & Importing...</span>
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4" />
                  <span>Start Import</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
