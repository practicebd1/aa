import { Course, Section, Lesson, PlaylistRecord, AuditLog, PlatformSettings, DashboardStats, AdminUser, SupabaseStatus } from '../types';
import { fallbackCourses, fallbackSections, fallbackLessons, fallbackSettings, getFallbackCourseWithContent } from '../data/fallbackData';

const API_BASE = '/api';

function getHeaders(extraHeaders: Record<string, string> = {}) {
  const token = localStorage.getItem('skillstream_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');
    localStorage.setItem('skillstream_admin_token', data.token);
    return data;
  },

  async getMe(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication error.');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } finally {
      localStorage.removeItem('skillstream_admin_token');
    }
  },

  async updateCredentials(updates: { email?: string; password?: string; name?: string }) {
    const res = await fetch(`${API_BASE}/auth/update-credentials`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update credentials.');
    return data;
  },

  // Courses
  async getCourses(params?: { includeDrafts?: boolean; category?: string; level?: string; search?: string }): Promise<Course[]> {
    try {
      const query = new URLSearchParams();
      if (params?.includeDrafts) query.append('includeDrafts', 'true');
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.level && params.level !== 'All Levels') query.append('level', params.level);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/courses?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.courses)) {
          return data.courses;
        }
      }
    } catch {
      // Server not reachable (e.g. GitHub Pages static deployment)
    }

    // Static fallback for GitHub Pages
    let results = [...fallbackCourses];
    if (!params?.includeDrafts) {
      results = results.filter((c) => c.status === 'published');
    }
    if (params?.category && params.category !== 'All') {
      results = results.filter((c) => c.category === params.category);
    }
    if (params?.level && params.level !== 'All Levels') {
      results = results.filter((c) => c.level === params.level);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q)
      );
    }
    return results;
  },

  async getCourse(slugOrId: string, includeDrafts: boolean = false): Promise<Course> {
    try {
      const res = await fetch(`${API_BASE}/courses/${slugOrId}${includeDrafts ? '?includeDrafts=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.course) return data.course;
      }
    } catch {
      // Server not reachable
    }

    const fallback = getFallbackCourseWithContent(slugOrId);
    if (fallback) return fallback;
    throw new Error('Course not found.');
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create course.');
    return data.course;
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update course.');
    return data.course;
  },

  async deleteCourse(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete course.');
  },

  async duplicateCourse(id: string): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate course.');
    return data.course;
  },

  // Sections
  async getSections(courseId: string): Promise<Section[]> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/sections`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch sections.');
    return data.sections;
  },

  async createSection(courseId: string, sectionData: Partial<Section>): Promise<Section> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sectionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create section.');
    return data.section;
  },

  async updateSection(id: string, updates: Partial<Section>): Promise<Section> {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update section.');
    return data.section;
  },

  async deleteSection(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete section.');
  },

  async reorderSections(orderedIds: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/sections/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderedIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reorder sections.');
  },

  // Lessons
  async createLesson(sectionId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    const res = await fetch(`${API_BASE}/sections/${sectionId}/lessons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lessonData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create lesson.');
    return data.lesson;
  },

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
    const res = await fetch(`${API_BASE}/lessons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update lesson.');
    return data.lesson;
  },

  async deleteLesson(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/lessons/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete lesson.');
  },

  async duplicateLesson(id: string): Promise<Lesson> {
    const res = await fetch(`${API_BASE}/lessons/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate lesson.');
    return data.lesson;
  },

  async reorderLessons(orderedIds: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/lessons/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderedIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reorder lessons.');
  },

  // YouTube Playlist Import
  async importPlaylist(payload: {
    urlOrId: string;
    courseId: string;
    sectionTitle?: string;
    targetSectionId?: string;
    createNewSection?: boolean;
  }): Promise<{ success: boolean; playlistTitle: string; importedCount: number; sectionId: string; source: string }> {
    const res = await fetch(`${API_BASE}/youtube/import-playlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to import playlist.');
    return data;
  },

  async syncPlaylist(recordId: string, applySync: boolean = false): Promise<any> {
    const res = await fetch(`${API_BASE}/youtube/sync-playlist/${recordId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ applySync })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sync failed.');
    return data;
  },

  async getPlaylists(): Promise<PlaylistRecord[]> {
    const res = await fetch(`${API_BASE}/playlists`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch playlists.');
    return data.playlists;
  },

  async deletePlaylist(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete playlist.');
  },

  // Direct Video Upload with Progress
  uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<{ fileUrl: string; originalName: string; sizeFormatted: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('video', file);

      xhr.open('POST', `${API_BASE}/upload/video`);
      const token = localStorage.getItem('skillstream_admin_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const parsed = JSON.parse(xhr.responseText);
            resolve(parsed);
          } catch {
            reject(new Error('Invalid response from server.'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Video upload failed.'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during video upload. Please check your connection.'));
      };

      xhr.send(formData);
    });
  },

  // Stats & Logs & Settings
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load stats.');
    return data.stats;
  },

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load audit logs.');
    return data.logs;
  },

  async getSettings(): Promise<PlatformSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.settings) return data.settings;
      }
    } catch {
      // Fallback
    }
    return fallbackSettings;
  },

  async updateSettings(updates: Partial<PlatformSettings & { youtubeApiKey?: string }>): Promise<PlatformSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings.');
    return data.settings;
  },

  async search(query: string): Promise<{ courses: Course[]; sections: any[]; lessons: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.courses) return data;
      }
    } catch {
      // Fallback
    }

    const q = query.toLowerCase().trim();
    if (!q) return { courses: [], sections: [], lessons: [] };
    const matchedCourses = fallbackCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.shortDescription?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
    const matchedLessons = fallbackLessons.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
    );
    return { courses: matchedCourses, sections: [], lessons: matchedLessons };
  },

  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.categories)) return data.categories;
      }
    } catch {
      // Fallback
    }
    const categoriesSet = new Set<string>();
    fallbackCourses.forEach((c) => {
      if (c.category) categoriesSet.add(c.category);
    });
    return ['All', ...Array.from(categoriesSet)];
  },

  // Supabase Backend Integration
  async getSupabaseStatus(): Promise<{ status: SupabaseStatus }> {
    const res = await fetch(`${API_BASE}/admin/supabase/status`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check Supabase status.');
    return data;
  },

  async pushToSupabase(): Promise<{ success: boolean; pushed: { courses: number; sections: number; lessons: number; playlists: number; auditLogs: number }; errors: string[] }> {
    const res = await fetch(`${API_BASE}/admin/supabase/push`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to push data to Supabase.');
    return data;
  },

  async pullFromSupabase(): Promise<{ success: boolean; counts?: { courses: number; sections: number; lessons: number; playlists: number }; error?: string }> {
    const res = await fetch(`${API_BASE}/admin/supabase/pull`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to pull data from Supabase.');
    return data;
  },

  async getSupabaseSchema(): Promise<{ sql: string; projectId: string; projectUrl: string }> {
    const res = await fetch(`${API_BASE}/admin/supabase/schema-sql`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load Supabase schema.');
    return data;
  },
};
