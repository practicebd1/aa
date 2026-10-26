import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Course, Section, Lesson, PlaylistRecord, AuditLog, PlatformSettings, SupabaseStatus } from '../src/types';

// Default configuration provided by user
const DEFAULT_SUPABASE_URL = 'https://cksbfdfteqqsngdbfvte.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc2JmZGZ0ZXFxc25nZGJmdnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzExNzEsImV4cCI6MjEwNTE0NzE3MX0.kdCJHZu2YXJx5GcuJ45wvGn9jRmliM5JvtW73FTUbnE';

export const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Priority: Service Role Key (if available) allows administrative writes bypassing RLS, otherwise Anon key
const activeKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const SUPABASE_PROJECT_ID = 'cksbfdfteqqsngdbfvte';

// Mask key for safety in UI
export function getMaskedKey(key: string): string {
  if (!key) return '';
  if (key.length <= 16) return '••••••••';
  return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
}

// -------------------------------------------------------------
// DATA CONVERTERS (TypeScript camelCase <-> Postgres snake_case)
// -------------------------------------------------------------
export function courseToRow(c: Course) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.shortDescription || '',
    full_description: c.fullDescription || '',
    thumbnail: c.thumbnail || '',
    category: c.category || 'General',
    level: c.level || 'All Levels',
    status: c.status || 'published',
    instructor_name: c.instructorName || '',
    instructor_image: c.instructorImage || '',
    course_introduction: c.courseIntroduction || '',
    learning_outcomes: c.learningOutcomes || [],
    featured: Boolean(c.featured),
    display_order: c.displayOrder || 0,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
  };
}

export function rowToCourse(r: any): Course {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description || '',
    fullDescription: r.full_description || '',
    thumbnail: r.thumbnail || '',
    category: r.category || 'General',
    level: r.level || 'All Levels',
    status: r.status || 'published',
    instructorName: r.instructor_name || '',
    instructorImage: r.instructor_image || '',
    courseIntroduction: r.course_introduction || '',
    learningOutcomes: Array.isArray(r.learning_outcomes) ? r.learning_outcomes : [],
    featured: Boolean(r.featured),
    displayOrder: r.display_order || 0,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

export function sectionToRow(s: Section) {
  return {
    id: s.id,
    course_id: s.courseId,
    title: s.title,
    description: s.description || '',
    display_order: s.order || 0,
    status: s.status || 'published',
    created_at: s.createdAt || new Date().toISOString(),
    updated_at: s.updatedAt || new Date().toISOString(),
  };
}

export function rowToSection(r: any): Section {
  return {
    id: r.id,
    courseId: r.course_id,
    title: r.title,
    description: r.description || '',
    order: r.display_order || 0,
    status: r.status || 'published',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

export function lessonToRow(l: Lesson) {
  return {
    id: l.id,
    section_id: l.sectionId,
    course_id: l.courseId,
    title: l.title,
    description: l.description || '',
    video_type: l.videoType || 'youtube',
    youtube_url: l.youtubeUrl || '',
    youtube_video_id: l.youtubeVideoId || '',
    uploaded_video_url: l.uploadedVideoUrl || '',
    thumbnail: l.thumbnail || '',
    duration: l.duration || '',
    lesson_number: l.lessonNumber || 1,
    display_order: l.order || 0,
    free_preview: Boolean(l.freePreview),
    status: l.status || 'published',
    created_at: l.createdAt || new Date().toISOString(),
    updated_at: l.updatedAt || new Date().toISOString(),
  };
}

export function rowToLesson(r: any): Lesson {
  return {
    id: r.id,
    sectionId: r.section_id,
    courseId: r.course_id,
    title: r.title,
    description: r.description || '',
    videoType: r.video_type || 'youtube',
    youtubeUrl: r.youtube_url || '',
    youtubeVideoId: r.youtube_video_id || '',
    uploadedVideoUrl: r.uploaded_video_url || '',
    thumbnail: r.thumbnail || '',
    duration: r.duration || '',
    lessonNumber: r.lesson_number || 1,
    order: r.display_order || 0,
    freePreview: Boolean(r.free_preview),
    status: r.status || 'published',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

export function playlistToRow(p: PlaylistRecord) {
  return {
    id: p.id,
    playlist_id: p.playlistId,
    title: p.title,
    course_id: p.courseId || '',
    course_title: p.courseTitle || '',
    section_id: p.sectionId || '',
    section_title: p.sectionTitle || '',
    video_count: p.videoCount || 0,
    imported_at: p.importedAt || new Date().toISOString(),
    last_synced_at: p.lastSyncedAt || null,
    status: p.status || 'active',
    youtube_url: p.youtubeUrl || '',
  };
}

export function rowToPlaylist(r: any): PlaylistRecord {
  return {
    id: r.id,
    playlistId: r.playlist_id,
    title: r.title,
    courseId: r.course_id || '',
    courseTitle: r.course_title || '',
    sectionId: r.section_id || '',
    sectionTitle: r.section_title || '',
    videoCount: r.video_count || 0,
    importedAt: r.imported_at || new Date().toISOString(),
    lastSyncedAt: r.last_synced_at || undefined,
    status: r.status || 'active',
    youtubeUrl: r.youtube_url || '',
  };
}

export function auditLogToRow(a: AuditLog) {
  return {
    id: a.id,
    timestamp: a.timestamp || new Date().toISOString(),
    admin_email: a.adminEmail || 'admin',
    action: a.action,
    target_type: a.targetType,
    target_title: a.targetTitle,
    details: a.details || '',
  };
}

// -------------------------------------------------------------
// STATUS & HEALTH CHECK
// -------------------------------------------------------------
export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  const status: SupabaseStatus = {
    connected: false,
    projectUrl: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    anonKeyMasked: getMaskedKey(SUPABASE_ANON_KEY),
    hasServiceRoleKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    tablesExist: false,
    tables: {
      courses: false,
      sections: false,
      lessons: false,
      playlists: false,
      audit_logs: false,
      app_users: false,
      platform_settings: false,
    },
    counts: {
      courses: 0,
      sections: 0,
      lessons: 0,
      playlists: 0,
    },
    message: '',
  };

  try {
    // Check tables in parallel
    const [coursesRes, sectionsRes, lessonsRes, playlistsRes, logsRes, usersRes, settingsRes] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact' }).limit(1),
      supabase.from('sections').select('id', { count: 'exact' }).limit(1),
      supabase.from('lessons').select('id', { count: 'exact' }).limit(1),
      supabase.from('playlists').select('id', { count: 'exact' }).limit(1),
      supabase.from('audit_logs').select('id', { count: 'exact' }).limit(1),
      supabase.from('app_users').select('id', { count: 'exact' }).limit(1),
      supabase.from('platform_settings').select('id', { count: 'exact' }).limit(1),
    ]);

    status.tables.courses = !coursesRes.error;
    status.tables.sections = !sectionsRes.error;
    status.tables.lessons = !lessonsRes.error;
    status.tables.playlists = !playlistsRes.error;
    status.tables.audit_logs = !logsRes.error;
    status.tables.app_users = !usersRes.error;
    status.tables.platform_settings = !settingsRes.error;

    if (status.tables.courses) status.counts!.courses = coursesRes.count || 0;
    if (status.tables.sections) status.counts!.sections = sectionsRes.count || 0;
    if (status.tables.lessons) status.counts!.lessons = lessonsRes.count || 0;
    if (status.tables.playlists) status.counts!.playlists = playlistsRes.count || 0;

    // Server is reachable if at least response returns standard PostgREST response
    status.connected = true;

    if (status.tables.courses && status.tables.sections && status.tables.lessons) {
      status.tablesExist = true;
      status.message = 'Supabase connected! Tables are active and ready for data synchronization.';
    } else {
      status.tablesExist = false;
      status.message =
        'Connected to Supabase project cksbfdfteqqsngdbfvte. Database tables need to be created in your Supabase SQL Editor using the 1-click schema script below.';
    }
  } catch (err: any) {
    status.connected = false;
    status.message = `Failed to connect to Supabase: ${err.message || err}`;
  }

  return status;
}

// -------------------------------------------------------------
// PUSH ALL LOCAL DATA TO SUPABASE
// -------------------------------------------------------------
export async function pushAllToSupabase(data: {
  courses: Course[];
  sections: Section[];
  lessons: Lesson[];
  playlists: PlaylistRecord[];
  auditLogs?: AuditLog[];
  settings?: PlatformSettings;
}) {
  const results = {
    success: true,
    pushed: {
      courses: 0,
      sections: 0,
      lessons: 0,
      playlists: 0,
      auditLogs: 0,
    },
    errors: [] as string[],
  };

  try {
    // 1. Courses
    if (data.courses && data.courses.length > 0) {
      const courseRows = data.courses.map(courseToRow);
      const { error, data: inserted } = await supabase.from('courses').upsert(courseRows, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Courses push error: ${error.message}`);
        results.success = false;
      } else {
        results.pushed.courses = courseRows.length;
      }
    }

    // 2. Sections
    if (data.sections && data.sections.length > 0) {
      const sectionRows = data.sections.map(sectionToRow);
      const { error } = await supabase.from('sections').upsert(sectionRows, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Sections push error: ${error.message}`);
        results.success = false;
      } else {
        results.pushed.sections = sectionRows.length;
      }
    }

    // 3. Lessons
    if (data.lessons && data.lessons.length > 0) {
      const lessonRows = data.lessons.map(lessonToRow);
      // Batch lessons in chunks of 50 to avoid request size limits
      for (let i = 0; i < lessonRows.length; i += 50) {
        const chunk = lessonRows.slice(i, i + 50);
        const { error } = await supabase.from('lessons').upsert(chunk, { onConflict: 'id' });
        if (error) {
          results.errors.push(`Lessons chunk push error: ${error.message}`);
          results.success = false;
          break;
        } else {
          results.pushed.lessons += chunk.length;
        }
      }
    }

    // 4. Playlists
    if (data.playlists && data.playlists.length > 0) {
      const playlistRows = data.playlists.map(playlistToRow);
      const { error } = await supabase.from('playlists').upsert(playlistRows, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Playlists push error: ${error.message}`);
      } else {
        results.pushed.playlists = playlistRows.length;
      }
    }

    // 5. Audit Logs
    if (data.auditLogs && data.auditLogs.length > 0) {
      const logRows = data.auditLogs.slice(0, 50).map(auditLogToRow);
      const { error } = await supabase.from('audit_logs').upsert(logRows, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Audit logs push error: ${error.message}`);
      } else {
        results.pushed.auditLogs = logRows.length;
      }
    }

    // 6. Platform Settings
    if (data.settings) {
      await supabase.from('platform_settings').upsert(
        {
          id: 'default',
          data: data.settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch (err: any) {
    results.success = false;
    results.errors.push(`Critical push exception: ${err.message || err}`);
  }

  return results;
}

// -------------------------------------------------------------
// PULL ALL DATA FROM SUPABASE
// -------------------------------------------------------------
export async function pullAllFromSupabase() {
  try {
    const [coursesRes, sectionsRes, lessonsRes, playlistsRes, settingsRes] = await Promise.all([
      supabase.from('courses').select('*').order('display_order', { ascending: true }),
      supabase.from('sections').select('*').order('display_order', { ascending: true }),
      supabase.from('lessons').select('*').order('display_order', { ascending: true }),
      supabase.from('playlists').select('*').order('imported_at', { ascending: false }),
      supabase.from('platform_settings').select('*').eq('id', 'default').maybeSingle(),
    ]);

    if (coursesRes.error) throw new Error(`Courses pull error: ${coursesRes.error.message}`);
    if (sectionsRes.error) throw new Error(`Sections pull error: ${sectionsRes.error.message}`);
    if (lessonsRes.error) throw new Error(`Lessons pull error: ${lessonsRes.error.message}`);

    const courses: Course[] = (coursesRes.data || []).map(rowToCourse);
    const sections: Section[] = (sectionsRes.data || []).map(rowToSection);
    const lessons: Lesson[] = (lessonsRes.data || []).map(rowToLesson);
    const playlists: PlaylistRecord[] = (playlistsRes.data || []).map(rowToPlaylist);
    const settings: PlatformSettings | undefined = settingsRes.data?.data;

    return {
      success: true,
      data: {
        courses,
        sections,
        lessons,
        playlists,
        settings,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

// -------------------------------------------------------------
// ASYNCHRONOUS BACKGROUND SYNC FOR ACTIVE WRITES
// -------------------------------------------------------------
export async function backgroundSyncCourse(course: Course) {
  try {
    const { error } = await supabase.from('courses').upsert(courseToRow(course), { onConflict: 'id' });
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to sync course:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception syncing course:', err);
  }
}

export async function backgroundDeleteCourse(id: string) {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to delete course:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception deleting course:', err);
  }
}

export async function backgroundSyncSection(section: Section) {
  try {
    const { error } = await supabase.from('sections').upsert(sectionToRow(section), { onConflict: 'id' });
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to sync section:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception syncing section:', err);
  }
}

export async function backgroundDeleteSection(id: string) {
  try {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to delete section:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception deleting section:', err);
  }
}

export async function backgroundSyncLesson(lesson: Lesson) {
  try {
    const { error } = await supabase.from('lessons').upsert(lessonToRow(lesson), { onConflict: 'id' });
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to sync lesson:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception syncing lesson:', err);
  }
}

export async function backgroundDeleteLesson(id: string) {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to delete lesson:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception deleting lesson:', err);
  }
}

export async function backgroundSyncPlaylist(playlist: PlaylistRecord) {
  try {
    const { error } = await supabase.from('playlists').upsert(playlistToRow(playlist), { onConflict: 'id' });
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to sync playlist:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception syncing playlist:', err);
  }
}

export async function backgroundDeletePlaylist(id: string) {
  try {
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error && error.code !== 'PGRST205') {
      console.error('[Supabase Sync] Failed to delete playlist:', error.message);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception deleting playlist:', err);
  }
}
