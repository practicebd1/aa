import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, SlidersHorizontal, Check } from 'lucide-react';
import { Course, CourseLevel } from '../types';
import { CourseCard } from '../components/CourseCard';

interface CoursesViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ courses, onSelectCourse }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
  const [sortBy, setSortBy] = useState<'default' | 'recent' | 'lessons'>('default');

  // Categories extraction
  const categories = useMemo(() => {
    const list = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];
    return list;
  }, [courses]);

  const levels: ('All Levels' | CourseLevel)[] = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        // Show published courses
        if (c.status !== 'published') return false;

        // Search match
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDesc = c.shortDescription.toLowerCase().includes(q);
          const matchCat = c.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Level filter
        if (selectedLevel !== 'All Levels' && c.level !== selectedLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'lessons') {
          return (b.lessonsCount || 0) - (a.lessonsCount || 0);
        }
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [courses, search, selectedCategory, selectedLevel, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Curriculum Catalog
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight">
          Explore All Courses
        </h1>
        <p className="text-base text-stone-600 font-normal leading-relaxed">
          Comprehensive practical programs structured with modular sections, verified video lessons, and step-by-step demonstrations.
        </p>
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by keyword, topic, or skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="default">Sort: Default Order</option>
              <option value="recent">Sort: Recently Added</option>
              <option value="lessons">Sort: Most Lessons</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-950 text-amber-400 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-medium text-stone-500 px-1">
        <span>
          Showing <strong>{filteredCourses.length}</strong> available courses
        </span>
        {(search || selectedCategory !== 'All' || selectedLevel !== 'All Levels') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedLevel('All Levels');
            }}
            className="text-amber-600 hover:text-amber-700 font-bold"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-stone-800">
            No matching courses found
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting the category and level filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedLevel('All Levels');
            }}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
