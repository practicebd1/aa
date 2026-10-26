import React, { useState, useEffect, useRef } from 'react';
import { X, Youtube, Upload, Play, CheckCircle, AlertCircle, FileVideo, Clock } from 'lucide-react';
import { Lesson, VideoType } from '../../types';
import { api } from '../../services/api';

interface LessonModalProps {
  isOpen: boolean;
  sectionId: string;
  sections?: { id: string; title: string }[];
  initialLesson?: Lesson | null;
  defaultOrder?: number;
  onClose: () => void;
  onSave: (lessonData: Partial<Lesson>) => Promise<void>;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  sectionId,
  sections = [],
  initialLesson,
  defaultOrder = 1,
  onClose,
  onSave
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState(sectionId);
  const [title, setTitle] = useState('');
  const [lessonNumber, setLessonNumber] = useState(defaultOrder);
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState<VideoType>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [freePreview, setFreePreview] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedSectionId(initialLesson?.sectionId || sectionId);
    if (initialLesson) {
      setTitle(initialLesson.title || '');
      setLessonNumber(initialLesson.lessonNumber || defaultOrder);
      setDescription(initialLesson.description || '');
      setVideoType(initialLesson.videoType || 'youtube');
      setYoutubeUrl(initialLesson.youtubeUrl || '');
      setYoutubeVideoId(initialLesson.youtubeVideoId || '');
      setUploadedVideoUrl(initialLesson.uploadedVideoUrl || '');
      setDuration(initialLesson.duration || '');
      setFreePreview(!!initialLesson.freePreview);
      setUploadFileName(initialLesson.uploadedVideoUrl ? 'Existing uploaded video' : '');
    } else {
      setTitle('');
      setLessonNumber(defaultOrder);
      setDescription('');
      setVideoType('youtube');
      setYoutubeUrl('');
      setYoutubeVideoId('');
      setUploadedVideoUrl('');
      setDuration('');
      setFreePreview(false);
      setUploadFileName('');
    }
    setUploading(false);
    setUploadPercent(0);
    setUploadError(null);
    setError(null);
  }, [initialLesson, isOpen, defaultOrder, sectionId]);

  // Extract YouTube ID if URL changes
  const handleYoutubeUrlChange = (val: string) => {
    setYoutubeUrl(val);
    const match = val.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
      setYoutubeVideoId(match[1]);
    } else if (val.trim().length === 11) {
      setYoutubeVideoId(val.trim());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video type
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    setUploadError(null);
    setUploadFileName(file.name);

    try {
      const result = await api.uploadVideo(file, (percent) => {
        setUploadPercent(percent);
      });
      setUploadedVideoUrl(result.fileUrl);
      setVideoType('uploaded');
    } catch (err: any) {
      setUploadError(err.message || 'Video upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lesson title is required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await onSave({
        sectionId: selectedSectionId,
        title,
        lessonNumber: Number(lessonNumber) || 1,
        description,
        videoType,
        youtubeUrl: videoType === 'youtube' ? youtubeUrl : undefined,
        youtubeVideoId: videoType === 'youtube' ? (youtubeVideoId || undefined) : undefined,
        uploadedVideoUrl: videoType === 'uploaded' ? uploadedVideoUrl : undefined,
        duration: duration || undefined,
        freePreview
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              {initialLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>
            <p className="text-xs text-stone-400">
              Configure lesson content, video source (YouTube or native file upload), and preview status.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Section Selector if available */}
          {sections.length > 0 && (
            <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <label className="font-bold text-stone-700 uppercase text-xs flex items-center justify-between">
                <span>Course Section (সেকশন)</span>
                <span className="text-[10px] text-stone-400 font-normal">Change which section this video belongs to</span>
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-amber-400"
              >
                {sections.map((sec, idx) => (
                  <option key={sec.id} value={sec.id}>
                    Section {idx + 1}: {sec.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Lesson Number */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Lesson Title (ভিডিও শিরোনাম) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Setting Up Google Ads Conversion Tracking"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Order / No.
              </label>
              <input
                type="number"
                min="1"
                value={lessonNumber}
                onChange={(e) => setLessonNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Short Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of skills or tools demonstrated in this lesson..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
            />
          </div>

          {/* Video Source Tabs */}
          <div className="space-y-3 pt-2">
            <label className="font-bold text-stone-700 uppercase text-xs block">
              Video Source
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVideoType('youtube')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-colors ${
                  videoType === 'youtube'
                    ? 'bg-amber-400/20 border-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>YouTube Video</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoType('uploaded')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-colors ${
                  videoType === 'uploaded'
                    ? 'bg-amber-400/20 border-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Upload className="w-4 h-4 text-stone-800" />
                <span>Direct File Upload</span>
              </button>
            </div>

            {/* Option A: YouTube */}
            {videoType === 'youtube' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 text-xs">
                    YouTube URL or Video ID
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {youtubeVideoId && (
                  <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Valid YouTube ID: <strong className="font-mono">{youtubeVideoId}</strong></span>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Watch on YouTube</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={`https://i.ytimg.com/vi/${youtubeVideoId}/mqdefault.jpg`}
                        alt="Video Thumbnail Preview"
                        className="w-24 h-14 object-cover rounded-lg border border-stone-300 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="text-[11px] text-stone-500">
                        <p className="font-medium text-stone-700">Auto-detected Video Thumbnail</p>
                        <p>This thumbnail will be displayed in the course curriculum player.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Option B: Direct File Upload */}
            {videoType === 'uploaded' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer bg-white transition-colors space-y-2"
                  >
                    <FileVideo className="w-8 h-8 mx-auto text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        {uploadFileName || 'Click to select a video file'}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Supports MP4, WebM (up to 500MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>Uploading video file...</span>
                      <span>{uploadPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-150"
                        style={{ width: `${uploadPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadedVideoUrl && !uploading && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Attached URL: {uploadedVideoUrl}</span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration & Free Preview Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Estimated Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 15:30 or 25 min"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Free Preview Access
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="free-preview-toggle"
                  checked={freePreview}
                  onChange={(e) => setFreePreview(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-400"
                />
                <label htmlFor="free-preview-toggle" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Allow non-registered visitors to preview
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : initialLesson ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
