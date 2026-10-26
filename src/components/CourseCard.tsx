import React from 'react';
import { BookOpen, Layers, ArrowRight, Clock, Award, PlayCircle } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  showStatus?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, showStatus }) => {
  const isDraft = course.status === 'draft';

  return (
    <div
      id={`course-card-${course.id}`}
      onClick={() => onSelect(course)}
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-950">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-3.5 left-3.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-amber-300 border border-stone-700/60 shadow-sm">
            {course.category}
          </span>
        </div>

        {/* Status Badge (Admin or Draft) */}
        {showStatus && (
          <div className="absolute top-3.5 right-3.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                isDraft
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {course.status}
            </span>
          </div>
        )}

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <PlayCircle className="w-7 h-7 fill-stone-950 text-amber-400" />
          </div>
        </div>

        {/* Level Tag on Bottom Image */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-xs font-medium text-stone-200">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{course.level}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-stone-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {course.shortDescription}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-medium text-stone-700">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{course.lessonsCount ?? 0} Lessons</span>
            </div>
            {course.sectionsCount !== undefined && course.sectionsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-stone-600" />
                <span>{course.sectionsCount} Sections</span>
              </div>
            )}
          </div>

          {/* View Course Action */}
          <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
            <span>View Course</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};
