import React, { useState, useEffect } from 'react';
import { 
  DashboardStats, AuditLog, Course, PlaylistRecord, 
  PlatformSettings, Lesson 
} from '../types';
import { api } from '../services/api';
import { AdminHeader, AdminTab } from '../components/admin/AdminHeader';
import { DashboardOverviewTab } from '../components/admin/DashboardOverviewTab';
import { CourseListTab } from '../components/admin/CourseListTab';
import { ContentBuilderTab } from '../components/admin/ContentBuilderTab';
import { PlaylistsTab } from '../components/admin/PlaylistsTab';
import { AuditLogsTab } from '../components/admin/AuditLogsTab';
import { SettingsTab } from '../components/admin/SettingsTab';
import { CourseModal } from '../components/admin/CourseModal';
import { ImportPlaylistModal } from '../components/admin/ImportPlaylistModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface AdminDashboardViewProps {
  onNavigateHome: () => void;
  onOpenVideoPreview: (lesson: Lesson, allLessons: Lesson[], course: Course) => void;
  onViewPublicCourse: (slugOrId: string) => void;
  initialTab?: AdminTab;
  initialCourseId?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateHome,
  onOpenVideoPreview,
  onViewPublicCourse,
  initialTab = 'overview',
  initialCourseId
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Course for Content Builder
  const [builderCourseId, setBuilderCourseId] = useState<string>('');

  // Course Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Import Playlist Modal state
  const [importPlaylistModalOpen, setImportPlaylistModalOpen] = useState(false);

  // Delete Course Modal state
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const loadAllData = async () => {
    try {
      const [fetchedCourses, fetchedStats, fetchedPlaylists, fetchedLogs, fetchedSettings] = await Promise.all([
        api.getCourses({ includeDrafts: true }),
        api.getStats(),
        api.getPlaylists(),
        api.getAuditLogs(100),
        api.getSettings()
      ]);

      setCourses(fetchedCourses);
      setStats(fetchedStats);
      setPlaylists(fetchedPlaylists);
      setLogs(fetchedLogs);
      setSettings(fetchedSettings);

      if (!builderCourseId && fetchedCourses.length > 0) {
        setBuilderCourseId(initialCourseId || fetchedCourses[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (initialCourseId) {
      setBuilderCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  // Actions
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    if (editingCourse) {
      await api.updateCourse(editingCourse.id, courseData);
    } else {
      const created = await api.createCourse(courseData);
      setBuilderCourseId(created.id);
    }
    await loadAllData();
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      await api.duplicateCourse(courseId);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate course.');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const nextStatus = course.status === 'published' ? 'draft' : 'published';
      await api.updateCourse(course.id, { status: nextStatus });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeletingCourse(true);
    try {
      await api.deleteCourse(courseToDelete.id);
      setDeleteCourseModalOpen(false);
      setCourseToDelete(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course.');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleOpenContentBuilder = (courseId: string) => {
    setBuilderCourseId(courseId);
    setActiveTab('builder');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-24">
      {/* Admin Navigation Header */}
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigateHome={onNavigateHome}
        onCreateCourseClick={() => {
          setEditingCourse(null);
          setCourseModalOpen(true);
        }}
        onImportPlaylistClick={() => setImportPlaylistModalOpen(true)}
      />

      {/* Main Tab View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Initializing SkillStream CMS...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverviewTab
                stats={stats}
                logs={logs}
                courses={courses}
                onCreateCourse={() => {
                  setEditingCourse(null);
                  setCourseModalOpen(true);
                }}
                onImportPlaylist={() => setImportPlaylistModalOpen(true)}
                onNavigateTab={setActiveTab}
                onOpenCourseBuilder={handleOpenContentBuilder}
                onNavigateHome={onNavigateHome}
              />
            )}

            {activeTab === 'courses' && (
              <CourseListTab
                courses={courses}
                onCreateCourse={() => {
                  setEditingCourse(null);
                  setCourseModalOpen(true);
                }}
                onEditCourse={(course) => {
                  setEditingCourse(course);
                  setCourseModalOpen(true);
                }}
                onManageContent={handleOpenContentBuilder}
                onDuplicateCourse={handleDuplicateCourse}
                onTogglePublish={handleTogglePublish}
                onDeleteCourse={(course) => {
                  setCourseToDelete(course);
                  setDeleteCourseModalOpen(true);
                }}
                onViewPublic={onViewPublicCourse}
              />
            )}

            {activeTab === 'builder' && (
              <ContentBuilderTab
                courses={courses}
                selectedCourseId={builderCourseId || courses[0]?.id}
                onSelectCourseId={setBuilderCourseId}
                onRefreshData={loadAllData}
                onOpenVideoPreview={onOpenVideoPreview}
                onBackToCourses={() => setActiveTab('courses')}
                onEditCourseCategory={(courseToEdit) => {
                  setEditingCourse(courseToEdit);
                  setCourseModalOpen(true);
                }}
              />
            )}

            {activeTab === 'playlists' && (
              <PlaylistsTab
                playlists={playlists}
                courses={courses}
                onRefreshData={loadAllData}
                onOpenImportModal={() => setImportPlaylistModalOpen(true)}
              />
            )}

            {activeTab === 'logs' && (
              <AuditLogsTab logs={logs} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onRefreshSettings={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Course Modal */}
      <CourseModal
        isOpen={courseModalOpen}
        initialCourse={editingCourse}
        onClose={() => {
          setCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
      />

      {/* Import Playlist Modal */}
      <ImportPlaylistModal
        isOpen={importPlaylistModalOpen}
        courses={courses}
        onClose={() => setImportPlaylistModalOpen(false)}
        onSuccess={loadAllData}
      />

      {/* Delete Course Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCourseModalOpen}
        title="Delete Entire Course?"
        message={`Are you sure you want to delete "${courseToDelete?.title}"? This action will remove all sections, lessons, and associated video links from the database.`}
        confirmLabel="Delete Course"
        isLoading={isDeletingCourse}
        onConfirm={handleDeleteCourse}
        onCancel={() => {
          setDeleteCourseModalOpen(false);
          setCourseToDelete(null);
        }}
      />
    </div>
  );
};
