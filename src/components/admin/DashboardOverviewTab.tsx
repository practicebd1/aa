import React from 'react';
import { 
  BookOpen, CheckCircle, FileText, Layers, PlayCircle, 
  Video, Youtube, Plus, Upload, ExternalLink, ArrowRight, Clock, History 
} from 'lucide-react';
import { DashboardStats, AuditLog, Course } from '../../types';

interface DashboardOverviewTabProps {
  stats: DashboardStats | null;
  logs: AuditLog[];
  courses: Course[];
  onCreateCourse: () => void;
  onImportPlaylist: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenCourseBuilder: (courseId: string) => void;
  onNavigateHome: () => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  stats,
  logs,
  courses,
  onCreateCourse,
  onImportPlaylist,
  onNavigateTab,
  onOpenCourseBuilder,
  onNavigateHome
}) => {
  const statCards = [
    {
      label: 'Total Courses',
      value: stats?.totalCourses ?? courses.length,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Published Courses',
      value: stats?.publishedCourses ?? courses.filter(c => c.status === 'published').length,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Draft Courses',
      value: stats?.draftCourses ?? courses.filter(c => c.status === 'draft').length,
      icon: FileText,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      label: 'Total Sections',
      value: stats?.totalSections ?? 0,
      icon: Layers,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      label: 'Total Lessons',
      value: stats?.totalLessons ?? 0,
      icon: PlayCircle,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      label: 'Total Videos',
      value: stats?.totalVideos ?? 0,
      icon: Video,
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      label: 'YouTube Playlists',
      value: stats?.totalPlaylists ?? 0,
      icon: Youtube,
      color: 'bg-red-50 text-red-700 border-red-200'
    },
  ];

  return (
    <div className="space-y-10">
      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-stone-900">
              Quick Actions
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Rapidly deploy new educational assets or synchronize YouTube playlists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-create-course-btn"
              onClick={onCreateCourse}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create New Course</span>
            </button>

            <button
              id="dash-import-playlist-btn"
              onClick={onImportPlaylist}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-heading font-semibold text-xs tracking-wider transition-all"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Import YouTube Playlist</span>
            </button>

            <button
              onClick={() => onNavigateTab('builder')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-heading font-semibold text-xs tracking-wider transition-all"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Upload Video / Curriculum</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div>
        <h3 className="font-heading font-bold text-base text-stone-900 uppercase tracking-wider mb-4">
          System Overview Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {c.label}
                  </span>
                  <p className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                    {c.value}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${c.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Quick Course Builder Jump + Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Courses Quick Jump */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Manage Course Curriculums
              </h3>
              <p className="text-xs text-stone-500">Jump directly into content builder to edit lessons</p>
            </div>
            <button
              onClick={() => onNavigateTab('courses')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              View All ({courses.length}) →
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-8 rounded-lg overflow-hidden bg-stone-900 shrink-0">
                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-heading font-semibold text-sm text-stone-900 truncate">
                      {course.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">
                      {course.category} • {course.lessonsCount ?? 0} lessons • {course.status}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCourseBuilder(course.id)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-400 hover:text-stone-950 text-stone-700 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Build Curriculum</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Audit Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Recent Activity
              </h3>
              <p className="text-xs text-stone-500">Administrative audit trail</p>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="font-mono font-bold text-stone-800 uppercase text-[10px] px-1.5 py-0.5 rounded bg-stone-200/80">
                    {log.action}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="font-medium text-stone-800 leading-snug">
                  {log.details}
                </p>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                No activity records logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
