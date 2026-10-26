import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Copy, MoveUp, MoveDown, PlayCircle, 
  Youtube, Video, Clock, Layers, BookOpen, Search, ArrowLeft,
  ExternalLink, Tag, Check, Sparkles, Filter, List, Grid
} from 'lucide-react';
import { Course, Section, Lesson } from '../../types';
import { api } from '../../services/api';
import { SectionModal } from './SectionModal';
import { LessonModal } from './LessonModal';
import { ConfirmModal } from '../ConfirmModal';

interface ContentBuilderTabProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourseId: (id: string) => void;
  onRefreshData: () => Promise<void>;
  onOpenVideoPreview: (lesson: Lesson, allLessons: Lesson[], course: Course) => void;
  onBackToCourses?: () => void;
  onEditCourseCategory?: (course: Course) => void;
}

export const ContentBuilderTab: React.FC<ContentBuilderTabProps> = ({
  courses,
  selectedCourseId,
  onSelectCourseId,
  onRefreshData,
  onOpenVideoPreview,
  onBackToCourses,
  onEditCourseCategory
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'sections' | 'allVideos'>('sections');
  const [videoSearch, setVideoSearch] = useState('');

  // Quick Add Video bar state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [quickSectionId, setQuickSectionId] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Modals state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [targetSectionIdForLesson, setTargetSectionIdForLesson] = useState<string>('');

  // Delete confirm state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'lesson'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load course details
  const loadCourse = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const data = await api.getCourse(selectedCourseId, true);
      setCourse(data);
      if (data?.sections?.length && !quickSectionId) {
        setQuickSectionId(data.sections[0].id);
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [selectedCourseId]);

  const sections = course?.sections || [];
  const allLessons: Lesson[] = sections.flatMap(s => s.lessons || []);

  // Section handlers
  const handleSaveSection = async (data: Partial<Section>) => {
    if (!selectedCourseId) return;
    if (editingSection) {
      await api.updateSection(editingSection.id, data);
    } else {
      await api.createSection(selectedCourseId, data);
    }
    await loadCourse();
    await onRefreshData();
  };

  const handleReorderSections = async (index: number, direction: 'up' | 'down') => {
    if (!course) return;
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const orderedIds = newSections.map(s => s.id);
    await api.reorderSections(orderedIds);
    await loadCourse();
  };

  // Lesson handlers
  const handleSaveLesson = async (data: Partial<Lesson>) => {
    if (editingLesson) {
      await api.updateLesson(editingLesson.id, data);
    } else {
      const targetSec = data.sectionId || targetSectionIdForLesson || sections[0]?.id;
      if (!targetSec) {
        alert('Please create a section first before adding lessons.');
        return;
      }
      await api.createLesson(targetSec, data);
    }
    await loadCourse();
    await onRefreshData();
  };

  const handleDuplicateLesson = async (lessonId: string) => {
    await api.duplicateLesson(lessonId);
    await loadCourse();
    await onRefreshData();
  };

  const handleReorderLessons = async (section: Section, index: number, direction: 'up' | 'down') => {
    const secLessons = [...(section.lessons || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= secLessons.length) return;

    const temp = secLessons[index];
    secLessons[index] = secLessons[targetIndex];
    secLessons[targetIndex] = temp;

    const orderedIds = secLessons.map(l => l.id);
    await api.reorderLessons(orderedIds);
    await loadCourse();
  };

  // Move video to another section directly
  const handleMoveLessonToSection = async (lesson: Lesson, newSectionId: string) => {
    if (lesson.sectionId === newSectionId) return;
    try {
      await api.updateLesson(lesson.id, { sectionId: newSectionId });
      await loadCourse();
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to move lesson.');
    }
  };

  // Quick Add Video
  const handleQuickAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      setQuickError('Please enter a video title.');
      return;
    }
    const secId = quickSectionId || sections[0]?.id;
    if (!secId) {
      setQuickError('Please create a section first.');
      return;
    }

    setQuickAdding(true);
    setQuickError(null);
    try {
      await api.createLesson(secId, {
        title: quickTitle.trim(),
        videoType: 'youtube',
        youtubeUrl: quickUrl.trim() || undefined,
        status: 'published',
        lessonNumber: allLessons.length + 1
      });
      setQuickTitle('');
      setQuickUrl('');
      await loadCourse();
      await onRefreshData();
    } catch (err: any) {
      setQuickError(err.message || 'Failed to add video.');
    } finally {
      setQuickAdding(false);
    }
  };

  // Delete confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'section') {
        await api.deleteSection(deleteTarget.id);
      } else {
        await api.deleteLesson(deleteTarget.id);
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await loadCourse();
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lessons for all videos mode
  const filteredAllLessons = allLessons.filter(l => {
    if (!videoSearch.trim()) return true;
    const q = videoSearch.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      (l.youtubeVideoId && l.youtubeVideoId.toLowerCase().includes(q)) ||
      (l.description && l.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Course Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToCourses && (
            <button
              onClick={onBackToCourses}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="কোর্সের তালিকায় ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>কোর্সের তালিকা (Back)</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                ভিডিও ও কারিকুলাম এডিটর
              </span>
              {course && (
                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-semibold flex items-center gap-1 border border-stone-200">
                  <Tag className="w-3 h-3 text-stone-400" />
                  {course.category}
                </span>
              )}
            </div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-stone-900 truncate">
              {course ? course.title : 'Curriculum Builder'}
            </h2>
          </div>
        </div>

        {/* Target Course Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-stone-600 uppercase shrink-0">
            Switch Course:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => onSelectCourseId(e.target.value)}
            className="px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 w-full md:w-64"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.lessonsCount ?? 0} videos)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-stone-400">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs font-semibold">ভিডিও তালিকা লোড হচ্ছে...</span>
        </div>
      )}

      {course && !loading && (
        <div className="space-y-6">
          {/* Main Course Hero Banner */}
          <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700 shadow-xs">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950">
                      {course.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-300">
                      {course.level}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      course.status === 'published' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                    {course.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Video className="w-3.5 h-3.5" />
                      {allLessons.length} টি ভিডিও লেকচার (Total Videos)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-stone-400" />
                      {sections.length} টি সেকশন
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Category Edit & Add Content */}
              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                {onEditCourseCategory && (
                  <button
                    onClick={() => onEditCourseCategory(course)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
                    title="ক্যাটাগরি, শিরোনাম ও বিবরণ এডিট করুন"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>ক্যাটাগরি ও কোর্স এডিট</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingSection(null);
                    setSectionModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs border border-stone-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ নতুন সেকশন</span>
                </button>

                <button
                  onClick={() => {
                    setTargetSectionIdForLesson(sections[0]?.id || '');
                    setEditingLesson(null);
                    setLessonModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ ভিডিও যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Quick Add Video Bar */}
            <form onSubmit={handleQuickAddVideo} className="mt-5 pt-4 border-t border-stone-800/80 flex flex-col md:flex-row items-center gap-2.5 text-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                দ্রুত ভিডিও যুক্ত করুন:
              </span>
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="ভিডিওর শিরোনাম (Video Title)..."
                className="w-full md:flex-1 px-3 py-1.5 bg-stone-800/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-500 text-xs focus:outline-hidden focus:border-amber-400"
              />
              <input
                type="text"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="YouTube URL বা ID (ঐচ্ছিক)..."
                className="w-full md:w-56 px-3 py-1.5 bg-stone-800/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-500 text-xs focus:outline-hidden focus:border-amber-400"
              />
              {sections.length > 1 && (
                <select
                  value={quickSectionId}
                  onChange={(e) => setQuickSectionId(e.target.value)}
                  className="w-full md:w-44 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 text-xs font-medium"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              )}
              <button
                type="submit"
                disabled={quickAdding}
                className="w-full md:w-auto px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {quickAdding ? 'যোগ হচ্ছে...' : '+ যোগ করুন'}
              </button>
            </form>
            {quickError && (
              <p className="text-red-400 text-[11px] mt-1.5">{quickError}</p>
            )}
          </div>

          {/* View Toggle Bar (Sections vs All Videos List) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('sections')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'sections'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>সেকশন অনুযায়ী ভিডিও ({sections.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('allVideos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'allVideos'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>সকল ভিডিওর তালিকা ({allLessons.length})</span>
              </button>
            </div>

            {viewMode === 'allVideos' && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="ভিডিও শিরোনাম বা YouTube ID দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* VIEW MODE 1: Hierarchical Sections */}
          {viewMode === 'sections' && (
            sections.length > 0 ? (
              <div className="space-y-6">
                {sections.map((section, secIdx) => {
                  const secLessons = section.lessons || [];

                  return (
                    <div
                      key={section.id}
                      className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
                    >
                      {/* Section Bar */}
                      <div className="bg-stone-50 p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {secIdx + 1 < 10 ? `0${secIdx + 1}` : secIdx + 1}
                          </span>
                          <div className="truncate">
                            <h4 className="font-heading font-bold text-base text-stone-900 truncate">
                              {section.title}
                            </h4>
                            <p className="text-xs text-stone-500 truncate">
                              {secLessons.length} টি ভিডিও {section.description ? `• ${section.description}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Section Controls */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          {/* Move Up */}
                          <button
                            onClick={() => handleReorderSections(secIdx, 'up')}
                            disabled={secIdx === 0}
                            className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-200 cursor-pointer"
                            title="Move section up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => handleReorderSections(secIdx, 'down')}
                            disabled={secIdx === sections.length - 1}
                            className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-200 cursor-pointer"
                            title="Move section down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>

                          {/* Edit Section */}
                          <button
                            onClick={() => {
                              setEditingSection(section);
                              setSectionModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 cursor-pointer"
                            title="Edit section title"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Add Lesson to Section */}
                          <button
                            onClick={() => {
                              setTargetSectionIdForLesson(section.id);
                              setEditingLesson(null);
                              setLessonModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-lg font-heading font-bold text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ ভিডিও যুক্ত করুন</span>
                          </button>

                          {/* Delete Section */}
                          <button
                            onClick={() => {
                              setDeleteTarget({
                                type: 'section',
                                id: section.id,
                                name: section.title
                              });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons inside Section */}
                      {secLessons.length > 0 ? (
                        <div className="divide-y divide-stone-100">
                          {secLessons.map((lesson, lIdx) => {
                            const isYoutube = lesson.videoType === 'youtube';
                            const thumbUrl = lesson.thumbnail || (lesson.youtubeVideoId ? `https://i.ytimg.com/vi/${lesson.youtubeVideoId}/mqdefault.jpg` : null);

                            return (
                              <div
                                key={lesson.id}
                                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/20 transition-colors group"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  {/* Thumbnail with Play preview */}
                                  <div 
                                    onClick={() => onOpenVideoPreview(lesson, allLessons, course)}
                                    className="relative w-16 h-11 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-200 cursor-pointer group-hover:border-amber-400 transition-colors shadow-2xs"
                                    title="Click to preview video playback"
                                  >
                                    {thumbUrl ? (
                                      <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Youtube className="w-5 h-5 text-red-500" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 hover:bg-black/10 flex items-center justify-center transition-colors">
                                      <PlayCircle className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-mono font-bold text-stone-400">
                                        Video {lesson.lessonNumber || (lIdx + 1)}
                                      </span>
                                      {lesson.freePreview && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                                          Free Preview
                                        </span>
                                      )}
                                      {lesson.duration && (
                                        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                                          <Clock className="w-3 h-3" />
                                          {lesson.duration}
                                        </span>
                                      )}
                                    </div>

                                    {/* Clickable title to edit */}
                                    <h5 
                                      onClick={() => {
                                        setTargetSectionIdForLesson(section.id);
                                        setEditingLesson(lesson);
                                        setLessonModalOpen(true);
                                      }}
                                      className="font-heading font-semibold text-sm text-stone-900 leading-snug hover:text-amber-600 transition-colors cursor-pointer truncate"
                                      title="Click to edit video"
                                    >
                                      {lesson.title}
                                    </h5>

                                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono truncate pt-0.5">
                                      {isYoutube ? (
                                        <span className="flex items-center gap-1">
                                          <Youtube className="w-3 h-3 text-red-500" />
                                          ID: <strong className="text-stone-700">{lesson.youtubeVideoId || 'None'}</strong>
                                        </span>
                                      ) : (
                                        <span>Direct file: {lesson.uploadedVideoUrl || 'None'}</span>
                                      )}
                                      {lesson.youtubeVideoId && (
                                        <a
                                          href={`https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-stone-400 hover:text-red-600 hover:underline inline-flex items-center gap-0.5"
                                        >
                                          YouTube <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  {/* PRIMARY: Edit Video Button */}
                                  <button
                                    onClick={() => {
                                      setTargetSectionIdForLesson(section.id);
                                      setEditingLesson(lesson);
                                      setLessonModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                    title="ভিডিও এডিট করুন (Edit title, video ID/URL, description, section)"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-amber-700" />
                                    <span>ভিডিও এডিট</span>
                                  </button>

                                  {/* Test Play */}
                                  <button
                                    onClick={() => onOpenVideoPreview(lesson, allLessons, course)}
                                    className="p-1.5 text-stone-600 hover:text-amber-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                                    title="ভিডিও চালু করে দেখুন (Preview Playback)"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                  </button>

                                  {/* Move Up */}
                                  <button
                                    onClick={() => handleReorderLessons(section, lIdx, 'up')}
                                    disabled={lIdx === 0}
                                    className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100 cursor-pointer"
                                    title="উপরে নিন (Move up)"
                                  >
                                    <MoveUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    onClick={() => handleReorderLessons(section, lIdx, 'down')}
                                    disabled={lIdx === secLessons.length - 1}
                                    className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded-lg hover:bg-stone-100 cursor-pointer"
                                    title="নিচে নিন (Move down)"
                                  >
                                    <MoveDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Duplicate */}
                                  <button
                                    onClick={() => handleDuplicateLesson(lesson.id)}
                                    className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                                    title="ডুপ্লিকেট করুন (Duplicate)"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({
                                        type: 'lesson',
                                        id: lesson.id,
                                        name: lesson.title
                                      });
                                      setDeleteModalOpen(true);
                                    }}
                                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                                    title="ভিডিও মুছুন (Delete)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                          <p>এই সেকশনে এখনও কোনো ভিডিও যুক্ত করা হয়নি।</p>
                          <button
                            onClick={() => {
                              setTargetSectionIdForLesson(section.id);
                              setEditingLesson(null);
                              setLessonModalOpen(true);
                            }}
                            className="text-amber-600 font-bold hover:underline cursor-pointer"
                          >
                            + প্রথম ভিডিও যুক্ত করুন
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
                <Layers className="w-12 h-12 text-stone-300 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-stone-800">
                  এই কোর্সে এখনও কোনো কারিকুলাম সেকশন তৈরি হয়নি
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  ভিডিওগুলো সাজাতে সেকশন তৈরি করুন, অথবা ইউটিউব প্লেলিস্ট ইম্পোর্ট করুন।
                </p>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setSectionModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs shadow-sm cursor-pointer"
                >
                  + সেকশন ১ তৈরি করুন
                </button>
              </div>
            )
          )}

          {/* VIEW MODE 2: Unified All Videos List & Quick Manager */}
          {viewMode === 'allVideos' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              {filteredAllLessons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                      <tr>
                        <th className="py-3.5 px-4 w-12 text-center">#</th>
                        <th className="py-3.5 px-4">ভিডিও ও শিরোনাম</th>
                        <th className="py-3.5 px-4">সেকশন</th>
                        <th className="py-3.5 px-4">YouTube ID / Source</th>
                        <th className="py-3.5 px-4 text-center">Duration</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {filteredAllLessons.map((lesson, idx) => {
                        const sec = sections.find(s => s.id === lesson.sectionId);
                        const thumbUrl = lesson.thumbnail || (lesson.youtubeVideoId ? `https://i.ytimg.com/vi/${lesson.youtubeVideoId}/mqdefault.jpg` : null);

                        return (
                          <tr key={lesson.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-400">
                              {lesson.lessonNumber || (idx + 1)}
                            </td>

                            {/* Thumbnail & Title */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  onClick={() => onOpenVideoPreview(lesson, allLessons, course)}
                                  className="relative w-14 h-10 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-200 cursor-pointer shadow-2xs group"
                                  title="Play video preview"
                                >
                                  {thumbUrl ? (
                                    <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Youtube className="w-4 h-4 text-red-500" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 flex items-center justify-center">
                                    <PlayCircle className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                <div className="min-w-0 max-w-sm">
                                  <h5 
                                    onClick={() => {
                                      setTargetSectionIdForLesson(lesson.sectionId || '');
                                      setEditingLesson(lesson);
                                      setLessonModalOpen(true);
                                    }}
                                    className="font-heading font-semibold text-xs text-stone-900 hover:text-amber-600 transition-colors cursor-pointer truncate"
                                    title="Click to edit video"
                                  >
                                    {lesson.title}
                                  </h5>
                                  {lesson.freePreview && (
                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Section Reassignment Dropdown */}
                            <td className="py-3.5 px-4">
                              <select
                                value={lesson.sectionId}
                                onChange={(e) => handleMoveLessonToSection(lesson, e.target.value)}
                                className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:bg-white cursor-pointer max-w-[180px] truncate"
                              >
                                {sections.map((s, sIdx) => (
                                  <option key={s.id} value={s.id}>
                                    Sec {sIdx + 1}: {s.title}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* YouTube ID / Source */}
                            <td className="py-3.5 px-4 font-mono text-xs text-stone-600">
                              {lesson.youtubeVideoId ? (
                                <div className="flex items-center gap-1.5">
                                  <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                  <span className="font-bold text-stone-800">{lesson.youtubeVideoId}</span>
                                </div>
                              ) : (
                                <span className="text-stone-400">Uploaded video</span>
                              )}
                            </td>

                            {/* Duration */}
                            <td className="py-3.5 px-4 text-center font-mono text-xs text-stone-500">
                              {lesson.duration || '—'}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setTargetSectionIdForLesson(lesson.sectionId || '');
                                    setEditingLesson(lesson);
                                    setLessonModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  title="ভিডিও এডিট করুন"
                                >
                                  <Edit className="w-3.5 h-3.5 text-amber-700" />
                                  <span>এডিট</span>
                                </button>

                                <button
                                  onClick={() => onOpenVideoPreview(lesson, allLessons, course)}
                                  className="p-1.5 text-stone-600 hover:text-amber-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                                  title="প্লে করে দেখুন"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDuplicateLesson(lesson.id)}
                                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                                  title="Duplicate video"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteTarget({
                                      type: 'lesson',
                                      id: lesson.id,
                                      name: lesson.title
                                    });
                                    setDeleteModalOpen(true);
                                  }}
                                  className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                                  title="Delete video"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
                <div className="py-16 text-center text-stone-500 space-y-2">
                  <Video className="w-10 h-10 mx-auto text-stone-300" />
                  <p className="font-semibold text-stone-700">কোনো ভিডিও খুঁজে পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Modal */}
      <SectionModal
        isOpen={sectionModalOpen}
        initialSection={editingSection}
        defaultOrder={sections.length + 1}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
      />

      {/* Lesson Modal (with full sections list for section reassignment) */}
      <LessonModal
        isOpen={lessonModalOpen}
        sectionId={targetSectionIdForLesson}
        sections={sections.map(s => ({ id: s.id, title: s.title }))}
        initialLesson={editingLesson}
        defaultOrder={allLessons.length + 1}
        onClose={() => {
          setLessonModalOpen(false);
          setEditingLesson(null);
        }}
        onSave={handleSaveLesson}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete ${deleteTarget?.type === 'section' ? 'Curriculum Section' : 'Lesson'}?`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${
          deleteTarget?.type === 'section' ? 'All lessons inside this section will also be removed.' : ''
        }`}
        confirmLabel="Delete Item"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
