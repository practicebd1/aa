import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Layers, Play, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Course, Lesson } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (slugOrId: string) => void;
  onSelectLesson: (courseSlug: string, lesson: Lesson) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCourse,
  onSelectLesson
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ courses: Course[]; sections: any[]; lessons: any[] }>({
    courses: [],
    sections: [],
    lessons: []
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ courses: [], sections: [], lessons: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], sections: [], lessons: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits = results.courses.length + results.sections.length + results.lessons.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50">
          <Search className="w-5 h-5 text-stone-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course title, section, lesson, or skill..."
            className="flex-1 bg-transparent border-0 text-base text-stone-900 placeholder-stone-600 focus:outline-hidden font-medium"
          />
          {loading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />}
          {query && !loading && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-600 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 divide-y divide-stone-100 flex-1 space-y-4">
          {!query.trim() && (
            <div className="py-12 text-center text-stone-600 space-y-2">
              <Search className="w-8 h-8 mx-auto text-stone-500" />
              <p className="text-sm font-medium">Type any keyword to search courses and lessons.</p>
              <p className="text-xs text-stone-600">Try searching for "Google Ads", "Keyword Research", "Canva", or "Conversion Tracking"</p>
            </div>
          )}

          {query.trim() && !loading && totalHits === 0 && (
            <div className="py-12 text-center text-stone-600 space-y-1">
              <p className="text-sm font-semibold text-stone-700">No matching courses or lessons found</p>
              <p className="text-xs">Try adjusting your search terms or browsing the full catalog.</p>
            </div>
          )}

          {/* Courses Section */}
          {results.courses.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-700 px-2">
                Courses ({results.courses.length})
              </h4>
              <div className="space-y-1">
                {results.courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      onClose();
                      onSelectCourse(course.slug || course.id);
                    }}
                    className="p-3 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-900 shrink-0">
                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <h5 className="font-heading font-bold text-sm text-stone-900 truncate group-hover:text-amber-700">
                          {course.title}
                        </h5>
                        <p className="text-xs text-stone-700 truncate">
                          {course.category} • {course.level} • {course.lessonsCount ?? 0} lessons
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-600 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Section */}
          {results.lessons.length > 0 && (
            <div className="space-y-2 pt-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-700 px-2">
                Lessons ({results.lessons.length})
              </h4>
              <div className="space-y-1">
                {results.lessons.map((les) => (
                  <div
                    key={les.id}
                    onClick={() => {
                      onClose();
                      onSelectLesson(les.courseSlug, les);
                    }}
                    className="p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-stone-900 truncate group-hover:text-amber-700">
                          {les.title}
                        </p>
                        <p className="text-[11px] text-stone-700 truncate">
                          Course: {les.courseTitle} {les.sectionTitle ? `• ${les.sectionTitle}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 shrink-0 ml-2">
                      Watch
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
