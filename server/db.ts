import fs from 'fs';
import path from 'path';
import { Course, Section, Lesson, PlaylistRecord, AuditLog, AdminUser, PlatformSettings, DashboardStats } from '../src/types';
import { generateSeedData, INITIAL_ADMIN, INITIAL_SETTINGS } from './initialData';
import {
  backgroundSyncCourse,
  backgroundDeleteCourse,
  backgroundSyncSection,
  backgroundDeleteSection,
  backgroundSyncLesson,
  backgroundDeleteLesson,
  backgroundSyncPlaylist,
  backgroundDeletePlaylist,
} from './supabase';

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

export interface DatabaseSchema {
  courses: Course[];
  sections: Section[];
  lessons: Lesson[];
  playlists: PlaylistRecord[];
  auditLogs: AuditLog[];
  users: (AdminUser & { passwordHash: string })[];
  settings: PlatformSettings;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all keys exist
        if (parsed.courses && parsed.sections && parsed.lessons) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database, generating initial data:', err);
    }

    // Seed database
    const seed = generateSeedData();
    const initial: DatabaseSchema = {
      courses: seed.courses,
      sections: seed.sections,
      lessons: seed.lessons,
      playlists: seed.playlists,
      auditLogs: [
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          adminEmail: INITIAL_ADMIN.email,
          action: 'System Initialized',
          targetType: 'course',
          targetTitle: 'SkillStream Learning Platform',
          details: 'Initialized with 9 standard courses and verified YouTube playlists.'
        }
      ],
      users: [INITIAL_ADMIN],
      settings: INITIAL_SETTINGS
    };

    this.save(initial);
    return initial;
  }

  public save(dataToSave?: DatabaseSchema) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public replaceData(newData: Partial<DatabaseSchema>) {
    if (newData.courses) this.data.courses = newData.courses;
    if (newData.sections) this.data.sections = newData.sections;
    if (newData.lessons) this.data.lessons = newData.lessons;
    if (newData.playlists) this.data.playlists = newData.playlists;
    if (newData.settings) this.data.settings = { ...this.data.settings, ...newData.settings };
    this.save();
  }

  // Audit Log helper
  public log(action: string, targetType: AuditLog['targetType'], targetTitle: string, adminEmail: string = 'admin', details?: string) {
    const logItem: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action,
      targetType,
      targetTitle,
      details
    };
    this.data.auditLogs.unshift(logItem);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // Settings
  public getSettings(): PlatformSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<PlatformSettings>, adminEmail: string): PlatformSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.log('Updated Platform Settings', 'settings', 'Platform Settings', adminEmail);
    this.save();
    return this.data.settings;
  }

  // Users & Auth
  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUserCredentials(userId: string, updates: { email?: string; passwordHash?: string; name?: string }, adminEmail: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    if (updates.email) user.email = updates.email;
    if (updates.passwordHash) user.passwordHash = updates.passwordHash;
    if (updates.name) user.name = updates.name;
    this.log('Updated Admin Credentials', 'auth', user.email, adminEmail);
    this.save();
    return user;
  }

  // Courses
  public getCourses(options?: { includeDrafts?: boolean; search?: string; category?: string; level?: string }): Course[] {
    let result = [...this.data.courses];

    if (!options?.includeDrafts) {
      result = result.filter(c => c.status === 'published');
    }

    if (options?.category && options.category !== 'All') {
      result = result.filter(c => c.category.toLowerCase() === options.category!.toLowerCase());
    }

    if (options?.level && options.level !== 'All Levels') {
      result = result.filter(c => c.level === options.level);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    // Attach counts
    return result.map(course => {
      const courseSections = this.data.sections.filter(s => s.courseId === course.id);
      const courseLessons = this.data.lessons.filter(l => l.courseId === course.id);
      return {
        ...course,
        sectionsCount: courseSections.length,
        lessonsCount: courseLessons.length
      };
    }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public getCourseByIdOrSlug(idOrSlug: string, includeDrafts: boolean = false): Course | null {
    const course = this.data.courses.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (!course) return null;
    if (!includeDrafts && course.status !== 'published') return null;

    const courseSections = this.data.sections
      .filter(s => s.courseId === course.id && (includeDrafts || s.status === 'published'))
      .sort((a, b) => a.order - b.order)
      .map(sec => {
        const secLessons = this.data.lessons
          .filter(l => l.sectionId === sec.id && (includeDrafts || l.status === 'published'))
          .sort((a, b) => a.order - b.order);
        return {
          ...sec,
          lessons: secLessons
        };
      });

    const totalLessons = courseSections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

    return {
      ...course,
      sectionsCount: courseSections.length,
      lessonsCount: totalLessons,
      sections: courseSections
    };
  }

  public createCourse(courseData: Partial<Course>, adminEmail: string): Course {
    const id = `course_${Date.now()}`;
    const slug = courseData.slug || (courseData.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const newCourse: Course = {
      id,
      slug,
      title: courseData.title || 'Untitled Course',
      shortDescription: courseData.shortDescription || '',
      fullDescription: courseData.fullDescription || '',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      category: courseData.category || 'General',
      level: courseData.level || 'All Levels',
      status: courseData.status || 'draft',
      instructorName: courseData.instructorName || 'Platform Instructor',
      instructorImage: courseData.instructorImage || '',
      courseIntroduction: courseData.courseIntroduction || '',
      learningOutcomes: courseData.learningOutcomes || [],
      featured: Boolean(courseData.featured),
      displayOrder: courseData.displayOrder || this.data.courses.length + 1,
      createdAt: now,
      updatedAt: now
    };

    this.data.courses.push(newCourse);
    this.log('Created Course', 'course', newCourse.title, adminEmail, `Course ID: ${id}, Status: ${newCourse.status}`);
    this.save();
    backgroundSyncCourse(newCourse);
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>, adminEmail: string): Course | null {
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const old = this.data.courses[idx];
    const updated: Course = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.courses[idx] = updated;
    this.log('Updated Course', 'course', updated.title, adminEmail, `Status: ${updated.status}`);
    this.save();
    backgroundSyncCourse(updated);
    return updated;
  }

  public deleteCourse(id: string, adminEmail: string): boolean {
    const course = this.data.courses.find(c => c.id === id);
    if (!course) return false;

    // Cascade delete sections and lessons
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    this.data.sections = this.data.sections.filter(s => s.courseId !== id);
    this.data.lessons = this.data.lessons.filter(l => l.courseId !== id);
    this.data.playlists = this.data.playlists.filter(p => p.courseId !== id);

    this.log('Deleted Course', 'course', course.title, adminEmail, `Course ID: ${id}`);
    this.save();
    backgroundDeleteCourse(id);
    return true;
  }

  public duplicateCourse(id: string, adminEmail: string): Course | null {
    const original = this.data.courses.find(c => c.id === id);
    if (!original) return null;

    const newId = `course_${Date.now()}`;
    const newSlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const duplicated: Course = {
      ...original,
      id: newId,
      slug: newSlug,
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };
    this.data.courses.push(duplicated);

    // Duplicate sections and lessons
    const origSections = this.data.sections.filter(s => s.courseId === id);
    for (const sec of origSections) {
      const newSecId = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newSec: Section = {
        ...sec,
        id: newSecId,
        courseId: newId,
        createdAt: now,
        updatedAt: now
      };
      this.data.sections.push(newSec);

      const origLessons = this.data.lessons.filter(l => l.sectionId === sec.id);
      for (const les of origLessons) {
        const newLesId = `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        this.data.lessons.push({
          ...les,
          id: newLesId,
          sectionId: newSecId,
          courseId: newId,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    this.log('Duplicated Course', 'course', duplicated.title, adminEmail, `Duplicated from ID: ${id}`);
    this.save();
    return duplicated;
  }

  // Sections
  public getSections(courseId: string): Section[] {
    return this.data.sections
      .filter(s => s.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map(sec => ({
        ...sec,
        lessons: this.data.lessons.filter(l => l.sectionId === sec.id).sort((a, b) => a.order - b.order)
      }));
  }

  public createSection(courseId: string, sectionData: Partial<Section>, adminEmail: string): Section {
    const id = `sec_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.data.sections.filter(s => s.courseId === courseId);
    const newSec: Section = {
      id,
      courseId,
      title: sectionData.title || `Section ${existing.length + 1}`,
      description: sectionData.description || '',
      order: sectionData.order ?? existing.length + 1,
      status: sectionData.status || 'published',
      createdAt: now,
      updatedAt: now
    };
    this.data.sections.push(newSec);
    this.log('Created Section', 'section', newSec.title, adminEmail, `Course ID: ${courseId}`);
    this.save();
    backgroundSyncSection(newSec);
    return newSec;
  }

  public updateSection(id: string, updates: Partial<Section>, adminEmail: string): Section | null {
    const idx = this.data.sections.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const old = this.data.sections[idx];
    const updated: Section = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.sections[idx] = updated;
    this.log('Updated Section', 'section', updated.title, adminEmail);
    this.save();
    backgroundSyncSection(updated);
    return updated;
  }

  public deleteSection(id: string, adminEmail: string): boolean {
    const sec = this.data.sections.find(s => s.id === id);
    if (!sec) return false;
    this.data.sections = this.data.sections.filter(s => s.id !== id);
    this.data.lessons = this.data.lessons.filter(l => l.sectionId !== id);
    this.log('Deleted Section', 'section', sec.title, adminEmail, `ID: ${id}`);
    this.save();
    backgroundDeleteSection(id);
    return true;
  }

  public reorderSections(orderedIds: string[], adminEmail: string): boolean {
    orderedIds.forEach((id, index) => {
      const sec = this.data.sections.find(s => s.id === id);
      if (sec) sec.order = index + 1;
    });
    this.log('Reordered Sections', 'section', 'Sections Order', adminEmail);
    this.save();
    return true;
  }

  // Lessons
  public createLesson(sectionId: string, lessonData: Partial<Lesson>, adminEmail: string): Lesson {
    const section = this.data.sections.find(s => s.id === sectionId);
    const courseId = section ? section.courseId : (lessonData.courseId || '');
    const id = `les_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.data.lessons.filter(l => l.sectionId === sectionId);

    const videoId = lessonData.youtubeVideoId || (lessonData.youtubeUrl ? extractYouTubeId(lessonData.youtubeUrl) : undefined);

    const newLesson: Lesson = {
      id,
      sectionId,
      courseId,
      title: lessonData.title || `Lesson ${existing.length + 1}`,
      description: lessonData.description || '',
      videoType: lessonData.videoType || (videoId ? 'youtube' : 'none'),
      youtubeUrl: lessonData.youtubeUrl,
      youtubeVideoId: videoId || undefined,
      uploadedVideoUrl: lessonData.uploadedVideoUrl,
      thumbnail: lessonData.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined),
      duration: lessonData.duration || '15 mins',
      lessonNumber: lessonData.lessonNumber ?? (existing.length + 1),
      order: lessonData.order ?? (existing.length + 1),
      freePreview: Boolean(lessonData.freePreview),
      status: lessonData.status || 'published',
      createdAt: now,
      updatedAt: now
    };

    this.data.lessons.push(newLesson);
    this.log('Created Lesson', 'lesson', newLesson.title, adminEmail, `Section: ${section?.title || sectionId}`);
    this.save();
    backgroundSyncLesson(newLesson);
    return newLesson;
  }

  public updateLesson(id: string, updates: Partial<Lesson>, adminEmail: string): Lesson | null {
    const idx = this.data.lessons.findIndex(l => l.id === id);
    if (idx === -1) return null;
    const old = this.data.lessons[idx];

    let youtubeVideoId = updates.youtubeVideoId ?? old.youtubeVideoId;
    if (updates.youtubeUrl && updates.youtubeUrl !== old.youtubeUrl) {
      youtubeVideoId = extractYouTubeId(updates.youtubeUrl) || youtubeVideoId;
    }

    let thumbnail = updates.thumbnail ?? old.thumbnail;
    if (youtubeVideoId && !thumbnail) {
      thumbnail = `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    }

    const updated: Lesson = {
      ...old,
      ...updates,
      youtubeVideoId,
      thumbnail,
      updatedAt: new Date().toISOString()
    };

    this.data.lessons[idx] = updated;
    this.log('Updated Lesson', 'lesson', updated.title, adminEmail, `Video Type: ${updated.videoType}`);
    this.save();
    backgroundSyncLesson(updated);
    return updated;
  }

  public deleteLesson(id: string, adminEmail: string): boolean {
    const les = this.data.lessons.find(l => l.id === id);
    if (!les) return false;
    this.data.lessons = this.data.lessons.filter(l => l.id !== id);
    this.log('Deleted Lesson', 'lesson', les.title, adminEmail, `ID: ${id}`);
    this.save();
    backgroundDeleteLesson(id);
    return true;
  }

  public duplicateLesson(id: string, adminEmail: string): Lesson | null {
    const original = this.data.lessons.find(l => l.id === id);
    if (!original) return null;
    const newId = `les_${Date.now()}`;
    const now = new Date().toISOString();
    const existing = this.data.lessons.filter(l => l.sectionId === original.sectionId);

    const duplicated: Lesson = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      order: existing.length + 1,
      lessonNumber: existing.length + 1,
      createdAt: now,
      updatedAt: now
    };
    this.data.lessons.push(duplicated);
    this.log('Duplicated Lesson', 'lesson', duplicated.title, adminEmail);
    this.save();
    return duplicated;
  }

  public reorderLessons(orderedIds: string[], adminEmail: string): boolean {
    orderedIds.forEach((id, index) => {
      const les = this.data.lessons.find(l => l.id === id);
      if (les) les.order = index + 1;
    });
    this.log('Reordered Lessons', 'lesson', 'Lessons Order', adminEmail);
    this.save();
    return true;
  }

  // Playlists
  public getPlaylists(): PlaylistRecord[] {
    return [...this.data.playlists];
  }

  public addPlaylistRecord(rec: PlaylistRecord, adminEmail: string) {
    const existingIdx = this.data.playlists.findIndex(p => p.playlistId === rec.playlistId && p.courseId === rec.courseId);
    if (existingIdx !== -1) {
      this.data.playlists[existingIdx] = rec;
    } else {
      this.data.playlists.unshift(rec);
    }
    this.log('Imported YouTube Playlist', 'playlist', rec.title, adminEmail, `Playlist ID: ${rec.playlistId}`);
    this.save();
    backgroundSyncPlaylist(rec);
  }

  public deletePlaylistRecord(id: string, adminEmail: string): boolean {
    const pl = this.data.playlists.find(p => p.id === id);
    if (!pl) return false;
    this.data.playlists = this.data.playlists.filter(p => p.id !== id);
    this.log('Deleted Playlist Record', 'playlist', pl.title, adminEmail);
    this.save();
    backgroundDeletePlaylist(id);
    return true;
  }

  // Audit Logs
  public getAuditLogs(limit: number = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // Dashboard Stats
  public getStats(): DashboardStats {
    const courses = this.data.courses;
    const published = courses.filter(c => c.status === 'published').length;
    const draft = courses.filter(c => c.status === 'draft').length;
    const sections = this.data.sections.length;
    const lessons = this.data.lessons.length;
    const videos = this.data.lessons.filter(l => l.videoType !== 'none').length;
    const playlists = this.data.playlists.length;

    const recentlyAdded = [...courses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentlyUpdated = [...courses]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return {
      totalCourses: courses.length,
      publishedCourses: published,
      draftCourses: draft,
      totalSections: sections,
      totalLessons: lessons,
      totalVideos: videos,
      totalPlaylists: playlists,
      recentlyAdded,
      recentlyUpdated
    };
  }
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = clean.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/[?&]list=([^#&?]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(clean)) return clean;
  return null;
}

export const db = new Database();
