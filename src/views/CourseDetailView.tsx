import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, BookOpen, Layers, Award, Clock, ChevronDown, ChevronUp, 
  CheckCircle2, ArrowRight, User, ShieldCheck, Share2, Sparkles, HelpCircle 
} from 'lucide-react';
import { Course, Section, Lesson } from '../types';
import { api } from '../services/api';

interface CourseDetailViewProps {
  courseSlugOrId: string;
  onOpenLesson: (lesson: Lesson, allLessons: Lesson[], course: Course) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseSlugOrId,
  onOpenLesson,
  onNavigate
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCourse(courseSlugOrId, true);
        if (mounted) {
          setCourse(data);
          // Expand first 2 sections by default
          const initialExpanded: Record<string, boolean> = {};
          (data.sections || []).forEach((sec, idx) => {
            initialExpanded[sec.id] = idx < 2;
          });
          setExpandedSections(initialExpanded);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Course not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseSlugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-stone-500">Loading course curriculum...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-stone-900">Course Not Found</h2>
        <p className="text-sm text-stone-600">{error || 'The requested course could not be located.'}</p>
        <button
          onClick={() => onNavigate('courses')}
          className="px-6 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold"
        >
          Return to All Courses
        </button>
      </div>
    );
  }

  const sections = course.sections || [];
  const allLessons: Lesson[] = sections.flatMap(s => s.lessons || []);
  const firstLesson = allLessons[0];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    sections.forEach(s => { next[s.id] = true; });
    setExpandedSections(next);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  return (
    <div className="space-y-16 pb-24">
      {/* COURSE HERO */}
      <section className="bg-stone-950 text-white pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-stone-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                  {course.level}
                </span>
                {course.status === 'draft' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-900/80 text-amber-200 border border-amber-700">
                    Draft Preview
                  </span>
                )}
              </div>

              {/* Title & Short Description */}
              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.15]">
                {course.title}
              </h1>
              <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed">
                {course.shortDescription}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-stone-300 pt-2 border-t border-stone-800/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span><strong>{course.lessonsCount ?? allLessons.length}</strong> Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span><strong>{course.sectionsCount ?? sections.length}</strong> Sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{course.instructorName}</span>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  id="course-start-learning-btn"
                  onClick={() => {
                    if (firstLesson) onOpenLesson(firstLesson, allLessons, course);
                  }}
                  disabled={!firstLesson}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-sm tracking-wider shadow-lg hover:shadow-xl transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  <PlayCircle className="w-5 h-5 fill-stone-950 text-amber-400" />
                  <span>START LEARNING</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Course link copied to clipboard!');
                  }}
                  className="flex items-center gap-2 px-5 py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Course</span>
                </button>
              </div>
            </div>

            {/* Right Video / Thumbnail Preview Column */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => firstLesson && onOpenLesson(firstLesson, allLessons, course)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-800 shadow-2xl group cursor-pointer"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 fill-stone-950 text-amber-400" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-stone-950/80 backdrop-blur-md rounded-xl p-3 flex items-center justify-between text-xs text-stone-200">
                  <span className="font-semibold text-amber-400">Preview Available</span>
                  <span>{allLessons.length} Total Videos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION: Details & Curriculum */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* ABOUT THIS COURSE */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-4">
              <h2 className="font-heading font-bold text-2xl text-stone-950">
                About This Course
              </h2>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal whitespace-pre-line">
                {course.fullDescription || course.shortDescription}
              </p>
              {course.courseIntroduction && (
                <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-stone-600 italic">
                  "{course.courseIntroduction}"
                </div>
              )}
            </div>

            {/* WHAT YOU WILL LEARN */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
                <h2 className="font-heading font-bold text-2xl text-stone-950">
                  What You Will Learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-stone-800 font-medium leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COURSE CURRICULUM ACCORDION */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-stone-950">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {sections.length} Sections • {allLessons.length} Total Lessons
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
                  <button onClick={expandAll} className="hover:text-stone-950">
                    Expand All
                  </button>
                  <span>•</span>
                  <button onClick={collapseAll} className="hover:text-stone-950">
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Sections List */}
              {sections.length > 0 ? (
                <div className="space-y-4">
                  {sections.map((sec, secIdx) => {
                    const isExpanded = !!expandedSections[sec.id];
                    const secLessons = sec.lessons || [];

                    return (
                      <div
                        key={sec.id}
                        className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50/50"
                      >
                        {/* Section Header Accordion Trigger */}
                        <div
                          onClick={() => toggleSection(sec.id)}
                          className="p-4 sm:p-5 bg-stone-100 hover:bg-stone-200/80 transition-colors flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                            <span className="shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                              {secIdx + 1 < 10 ? `0${secIdx + 1}` : secIdx + 1}
                            </span>
                            <div className="truncate">
                              <h3 className="font-heading font-bold text-sm sm:text-base text-stone-900 truncate">
                                {sec.title}
                              </h3>
                              <p className="text-xs text-stone-500 truncate">
                                {secLessons.length} Lessons {sec.description ? `• ${sec.description}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-stone-500">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Section Lessons Body */}
                        {isExpanded && (
                          <div className="divide-y divide-stone-200/80 bg-white">
                            {secLessons.length > 0 ? (
                              secLessons.map((les, lIdx) => (
                                <div
                                  key={les.id}
                                  className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                                >
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-stone-100 text-stone-500 shrink-0 mt-0.5">
                                      <PlayCircle className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-stone-400">
                                          Lesson {les.lessonNumber || (lIdx + 1)}
                                        </span>
                                        {les.freePreview && (
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                            Free Preview
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-heading font-semibold text-sm text-stone-900 leading-snug mt-0.5">
                                        {les.title}
                                      </h4>
                                      {les.description && (
                                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-normal">
                                          {les.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {les.duration && (
                                      <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                                        <Clock className="w-3.5 h-3.5" />
                                        {les.duration}
                                      </span>
                                    )}
                                    <button
                                      id={`watch-lesson-btn-${les.id}`}
                                      onClick={() => onOpenLesson(les, allLessons, course)}
                                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-xs hover:shadow transition-all flex items-center gap-1"
                                    >
                                      <span>▶ Watch</span>
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-xs text-stone-400 italic">
                                No lessons added to this section yet.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-stone-300" />
                  <p className="text-sm font-medium">Curriculum sections are being scheduled by the instructor.</p>
                </div>
              )}
            </div>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5">
              <h2 className="font-heading font-bold text-2xl text-stone-950">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <h4 className="font-heading font-semibold text-sm text-stone-900">
                    Are the video lessons self-paced?
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Yes. All videos are pre-recorded and organized sequentially. You can watch anytime, pause, repeat, and review as needed.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <h4 className="font-heading font-semibold text-sm text-stone-900">
                    Will new videos and updates be added?
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Yes. The platform administrator regularly synchronizes official playlists and uploads updated campaign demonstrations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Sticky Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-heading font-bold text-xl text-stone-950">
                  Course Overview
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Immediate, full-access curriculum enrollment.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-stone-700">
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Instructor</span>
                  <span className="font-bold text-stone-900">{course.instructorName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Category</span>
                  <span className="font-bold text-stone-900">{course.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Skill Level</span>
                  <span className="font-bold text-stone-900">{course.level}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Total Lessons</span>
                  <span className="font-bold text-stone-900">{allLessons.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Format</span>
                  <span className="font-bold text-stone-900">HD Streaming Video</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (firstLesson) onOpenLesson(firstLesson, allLessons, course);
                }}
                disabled={!firstLesson}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-md hover:shadow transition-all text-center block"
              >
                START LEARNING NOW
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
