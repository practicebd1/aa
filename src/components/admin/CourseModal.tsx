import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image, Sparkles } from 'lucide-react';
import { Course, CourseLevel, CourseStatus } from '../../types';

interface CourseModalProps {
  isOpen: boolean;
  initialCourse?: Course | null;
  onClose: () => void;
  onSave: (courseData: Partial<Course>) => Promise<void>;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  initialCourse,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [courseIntroduction, setCourseIntroduction] = useState('');
  const [category, setCategory] = useState('Digital Marketing');
  const [level, setLevel] = useState<CourseLevel>('All Levels');
  const [instructorName, setInstructorName] = useState('SkillStream Lead Practitioner');
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState<CourseStatus>('published');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourse) {
      setTitle(initialCourse.title || '');
      setSlug(initialCourse.slug || '');
      setAutoSlug(false);
      setShortDescription(initialCourse.shortDescription || '');
      setFullDescription(initialCourse.fullDescription || '');
      setCourseIntroduction(initialCourse.courseIntroduction || '');
      setCategory(initialCourse.category || 'Digital Marketing');
      setLevel(initialCourse.level || 'All Levels');
      setInstructorName(initialCourse.instructorName || 'SkillStream Lead Practitioner');
      setThumbnail(initialCourse.thumbnail || '');
      setStatus(initialCourse.status || 'published');
      setLearningOutcomes(initialCourse.learningOutcomes?.length ? initialCourse.learningOutcomes : ['']);
    } else {
      setTitle('');
      setSlug('');
      setAutoSlug(true);
      setShortDescription('');
      setFullDescription('');
      setCourseIntroduction('');
      setCategory('Digital Marketing');
      setLevel('All Levels');
      setInstructorName('SkillStream Lead Practitioner');
      setThumbnail('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80');
      setStatus('published');
      setLearningOutcomes(['Master practical campaign execution', 'Apply industry standard marketing frameworks']);
    }
    setError(null);
  }, [initialCourse, isOpen]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleAddOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const handleOutcomeChange = (index: number, val: string) => {
    const updated = [...learningOutcomes];
    updated[index] = val;
    setLearningOutcomes(updated);
  };

  const handleRemoveOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const cleanedOutcomes = learningOutcomes.map(o => o.trim()).filter(Boolean);
      await onSave({
        title,
        slug: slug.trim() || undefined,
        shortDescription,
        fullDescription,
        courseIntroduction,
        category,
        level,
        instructorName,
        thumbnail,
        status,
        learningOutcomes: cleanedOutcomes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              {initialCourse ? 'Edit Course Details' : 'Create New Course'}
            </h3>
            <p className="text-xs text-stone-400">
              Configure high-level metadata, learning outcomes, and publication status.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Advanced Google Ads Mastery"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700 uppercase text-xs">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-amber-600 font-semibold"
                >
                  {autoSlug ? 'Manual Edit' : 'Auto-Sync'}
                </button>
              </div>
              <input
                type="text"
                value={slug}
                readOnly={autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="advanced-google-ads"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-stone-900 font-mono text-xs ${
                  autoSlug ? 'bg-stone-100 border-stone-200 text-stone-500' : 'bg-stone-50 border-stone-300 focus:bg-white focus:ring-2 focus:ring-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Short & Full Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Short Description (Card Summary)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Concise 1-2 sentence overview for course cards"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Full Description
            </label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed syllabus overview, methodology, and requirements..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Course Introduction Note
            </label>
            <input
              type="text"
              value={courseIntroduction}
              onChange={(e) => setCourseIntroduction(e.target.value)}
              placeholder="Welcome note or introductory greeting from the instructor"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Category, Level, Status, Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs flex items-center justify-between">
                <span>Category (ক্যাটাগরি) *</span>
              </label>
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  list="category-options"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Google Ads, Web Development"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-400"
                />
                <datalist id="category-options">
                  <option value="Google Ads" />
                  <option value="Digital Marketing" />
                  <option value="SEO & Web Analytics" />
                  <option value="Neuro-Marketing" />
                  <option value="Data Analytics" />
                  <option value="Freelancing & Career" />
                  <option value="Web Development" />
                  <option value="Graphic Design" />
                </datalist>
                <div className="flex flex-wrap gap-1 text-[10px] text-stone-500 pt-0.5">
                  <span className="text-stone-400">Presets:</span>
                  {['Google Ads', 'Digital Marketing', 'SEO', 'Freelancing'].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setCategory(preset)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        category === preset 
                          ? 'bg-amber-100 text-amber-900 font-bold' 
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-semibold"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 uppercase text-xs">
                Instructor Name
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Thumbnail Image URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
              />
              {thumbnail && (
                <div className="w-12 h-10 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-300">
                  <img src={thumbnail} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* What You Will Learn (Multi-bullet) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 uppercase text-xs">
                What You Will Learn (Bullet Points)
              </label>
              <button
                type="button"
                onClick={handleAddOutcome}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Outcome</span>
              </button>
            </div>

            <div className="space-y-2">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    placeholder={`Outcome #${idx + 1}`}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 focus:bg-white"
                  />
                  {learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
