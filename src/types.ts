export type CourseStatus = 'published' | 'draft' | 'archived';
export type CourseLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
export type VideoType = 'youtube' | 'uploaded' | 'none';

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  instructorName: string;
  instructorImage?: string;
  courseIntroduction?: string;
  learningOutcomes: string[];
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  sectionsCount?: number;
  lessonsCount?: number;
  totalDuration?: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description: string;
  videoType: VideoType;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  uploadedVideoUrl?: string;
  thumbnail?: string;
  duration?: string;
  lessonNumber: number;
  order: number;
  freePreview: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistRecord {
  id: string;
  playlistId: string;
  title: string;
  courseId: string;
  courseTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  videoCount: number;
  importedAt: string;
  lastSyncedAt?: string;
  status: 'active' | 'syncing' | 'error';
  youtubeUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetType: 'course' | 'section' | 'lesson' | 'playlist' | 'video' | 'settings' | 'auth';
  targetTitle: string;
  details?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  youtubeApiKeyConfigured: boolean;
  youtubeApiKeyMasked?: string;
  allowPublicRegistration: boolean;
  storageProvider: 'local' | 'firebase' | 'supabase';
  supabaseConfigured?: boolean;
}

export interface SupabaseStatus {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  anonKeyMasked: string;
  hasServiceRoleKey: boolean;
  tablesExist: boolean;
  tables: {
    courses: boolean;
    sections: boolean;
    lessons: boolean;
    playlists: boolean;
    audit_logs: boolean;
    app_users: boolean;
    platform_settings: boolean;
  };
  counts?: {
    courses: number;
    sections: number;
    lessons: number;
    playlists: number;
  };
  message: string;
}

export interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalSections: number;
  totalLessons: number;
  totalVideos: number;
  totalPlaylists: number;
  recentlyAdded: Course[];
  recentlyUpdated: Course[];
}
