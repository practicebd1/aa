import React, { useState } from 'react';
import { 
  Plus, Edit, Video, Copy, Trash2, Globe, EyeOff, 
  Search, BookOpen, ExternalLink, ArrowRight, Tag
} from 'lucide-react';
import { Course } from '../../types';

interface CourseListTabProps {
  courses: Course[];
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onManageContent: (courseId: string) => void;
  onDuplicateCourse: (courseId: string) => void;
  onTogglePublish: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onViewPublic: (slugOrId: string) => void;
}

export const CourseListTab: React.FC<CourseListTabProps> = ({
  courses,
  onCreateCourse,
  onEditCourse,
  onManageContent,
  onDuplicateCourse,
  onTogglePublish,
  onDeleteCourse,
  onViewPublic
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

  const filteredCourses = courses.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-heading font-bold text-xl text-stone-900">
            Course & Video Management ({courses.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage course categories, titles, and drill down inside each course to edit all video lessons.
          </p>
        </div>

        <button
          onClick={onCreateCourse}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create New Course</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Courses Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Structure & Videos</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {filteredCourses.map((course) => {
                  const isPublished = course.status === 'published';
                  return (
                    <tr key={course.id} className="hover:bg-amber-50/20 transition-colors group">
                      {/* Thumbnail & Title - clickable to enter videos */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => onManageContent(course.id)}
                          className="flex items-center gap-3 cursor-pointer group-hover:opacity-95"
                          title="Click to view and edit course videos"
                        >
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-200 shadow-2xs group-hover:border-amber-400 transition-colors">
                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <h4 className="font-heading font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors truncate">
                              {course.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 truncate font-mono">
                              /{course.slug || course.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onEditCourse(course)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-colors cursor-pointer"
                          title="Click to change category"
                        >
                          <Tag className="w-3 h-3 text-stone-500" />
                          <span>{course.category}</span>
                        </button>
                      </td>

                      {/* Sections & Lessons count - clickable */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onManageContent(course.id)}
                          className="text-stone-900 hover:text-amber-600 font-semibold text-xs inline-flex flex-col items-center cursor-pointer"
                          title="Click to enter and edit video lessons"
                        >
                          <span className="font-bold text-stone-950 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-red-500" />
                            {course.lessonsCount ?? 0} Videos
                          </span>
                          <span className="text-stone-400 text-[10px] flex items-center gap-0.5">
                            ({course.sectionsCount ?? 0} sections) • Edit videos <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onTogglePublish(course)}
                          title={`Click to ${isPublished ? 'unpublish' : 'publish'}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                        >
                          {isPublished ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{course.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* PRIMARY: Edit Videos (Takes user inside the course to edit videos) */}
                          <button
                            id={`edit-videos-${course.id}`}
                            onClick={() => onManageContent(course.id)}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-400 text-white hover:text-stone-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            title="কোর্সের ভেতর নিয়ে যাবে এবং সমস্ত ভিডিও এডিট করার সিস্টেম থাকবে (Enter to edit all videos)"
                          >
                            <Video className="w-3.5 h-3.5 text-amber-400 group-hover:text-stone-950" />
                            <span>ভিডিও এডিট</span>
                          </button>

                          {/* SECONDARY: Edit Category / Course Metadata */}
                          <button
                            id={`edit-category-${course.id}`}
                            onClick={() => onEditCourse(course)}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-semibold text-xs transition-colors flex items-center gap-1 border border-stone-200 cursor-pointer"
                            title="ক্যাটাগরি এবং কোর্সের তথ্য এডিট করুন (Edit category, title, description)"
                          >
                            <Edit className="w-3.5 h-3.5 text-stone-500" />
                            <span>ক্যাটাগরি</span>
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => onDuplicateCourse(course.id)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="Duplicate course"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Public View */}
                          <button
                            onClick={() => onViewPublic(course.slug || course.id)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="View public page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`delete-course-${course.id}`}
                            onClick={() => onDeleteCourse(course)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete course"
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
            <BookOpen className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-semibold text-stone-700">No courses match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
