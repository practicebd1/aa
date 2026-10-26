import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, CheckCircle, Video, List, ExternalLink, Clock } from 'lucide-react';
import { Lesson, Section, Course } from '../types';

interface VideoPlayerModalProps {
  lesson: Lesson | null;
  course: Course | null;
  allLessons: Lesson[];
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  lesson,
  course,
  allLessons,
  onClose,
  onSelectLesson
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && nextLesson) onSelectLesson(nextLesson);
      if (e.key === 'ArrowLeft' && prevLesson) onSelectLesson(prevLesson);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lesson, allLessons]);

  if (!lesson) return null;

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isYouTube = lesson.videoType === 'youtube' && lesson.youtubeVideoId;
  const isUploaded = lesson.videoType === 'uploaded' && lesson.uploadedVideoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl max-h-[96vh] flex flex-col bg-stone-950 rounded-2xl border border-stone-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-stone-900/90 border-b border-stone-800 text-white select-none">
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-stone-950">
              Lesson {lesson.lessonNumber || (currentIndex + 1)}
            </span>
            <div className="truncate">
              <h3 className="font-heading font-semibold text-sm sm:text-base text-stone-100 truncate">
                {lesson.title}
              </h3>
              {course && (
                <p className="text-xs text-stone-400 truncate">
                  {course.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle Curriculum Drawer */}
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                showDrawer ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Toggle curriculum list"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Curriculum ({allLessons.length})</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Player + Drawer) */}
        <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden bg-black">
          {/* Main Video Viewport */}
          <div className="flex-1 flex flex-col justify-center items-center bg-black min-h-[300px] sm:min-h-[420px] lg:min-h-[520px]">
            {isYouTube ? (
              <div className="w-full h-full aspect-video flex items-center justify-center">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : isUploaded ? (
              <div className="w-full h-full aspect-video flex items-center justify-center bg-black">
                <video
                  src={lesson.uploadedVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[70vh] object-contain"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 space-y-3">
                <Video className="w-12 h-12 mx-auto text-stone-600" />
                <h4 className="text-base font-semibold text-stone-200">No Video Stream Attached</h4>
                <p className="text-sm max-w-sm">
                  This lesson has not been assigned a YouTube video or uploaded file yet. The administrator can link media in the Admin Panel.
                </p>
                {lesson.youtubeUrl && (
                  <a
                    href={lesson.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                  >
                    <span>Open external YouTube link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Side Curriculum Drawer */}
          {showDrawer && (
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900/95 flex flex-col max-h-60 lg:max-h-none overflow-y-auto">
              <div className="p-3 border-b border-stone-800 bg-stone-900/80 sticky top-0 z-10 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Course Lessons
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  {currentIndex + 1} / {allLessons.length}
                </span>
              </div>
              <div className="divide-y divide-stone-800/60 p-1">
                {allLessons.map((item, idx) => {
                  const isCurrent = item.id === lesson.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectLesson(item)}
                      className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors ${
                        isCurrent
                          ? 'bg-amber-400/20 text-white border-l-4 border-amber-400'
                          : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded-full ${isCurrent ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono text-stone-400">
                            Lesson {item.lessonNumber || (idx + 1)}
                          </span>
                          {item.duration && (
                            <span className="text-[10px] text-stone-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {item.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium leading-snug line-clamp-2 mt-0.5">
                          {item.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar (Prev / Current / Next) */}
        <div className="px-4 sm:px-6 py-3.5 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-2">
          {/* Previous Lesson */}
          <button
            onClick={() => prevLesson && onSelectLesson(prevLesson)}
            disabled={!prevLesson}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              prevLesson
                ? 'bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white'
                : 'text-stone-600 bg-stone-900/40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Lesson</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Current Lesson Counter */}
          <div className="text-center px-2">
            <span className="text-xs font-medium text-stone-400">
              Lesson <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{allLessons.length}</strong>
            </span>
          </div>

          {/* Next Lesson */}
          <button
            onClick={() => nextLesson && onSelectLesson(nextLesson)}
            disabled={!nextLesson}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              nextLesson
                ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-sm'
                : 'text-stone-600 bg-stone-900/40 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Next Lesson</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
