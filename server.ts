import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, extractYouTubeId } from './server/db';
import { fetchYouTubePlaylist } from './server/youtube';
import {
  checkSupabaseStatus,
  pushAllToSupabase,
  pullAllFromSupabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
} from './server/supabase';

const PORT = 3000;
const app = express();

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static directory for uploaded videos
const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads/videos', express.static(uploadsDir));

// Multer setup for direct video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    cb(null, `${cleanName}_${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (allowed.includes(file.mimetype) || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Only MP4, WebM, and MOV are supported.'));
    }
  }
});

// Simple Auth Token Store
const activeSessions = new Map<string, { email: string; role: string; expiresAt: number }>();

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid.' });
  }

  (req as any).user = session;
  next();
}

function getAdminEmail(req: Request): string {
  return (req as any).user?.email || 'admin@skillstream.io';
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Verify password strictly against database record
  if (user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  activeSessions.set(token, {
    email: user.email,
    role: user.role,
    expiresAt
  });

  db.log('Admin Logged In', 'auth', user.email, user.email);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const session = (req as any).user;
  const user = db.getUserByEmail(session.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/update-credentials', authenticate, (req, res) => {
  const { email, password, name } = req.body;
  const session = (req as any).user;
  const user = db.getUserByEmail(session.email);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const updated = db.updateUserCredentials(user.id, {
    email: email || undefined,
    passwordHash: password || undefined,
    name: name || undefined
  }, getAdminEmail(req));

  res.json({ success: true, user: { id: updated?.id, email: updated?.email, name: updated?.name } });
});

// Courses
app.get('/api/courses', (req, res) => {
  const includeDrafts = req.query.includeDrafts === 'true';
  const category = req.query.category as string | undefined;
  const level = req.query.level as string | undefined;
  const search = req.query.search as string | undefined;

  const courses = db.getCourses({ includeDrafts, category, level, search });
  res.json({ courses });
});

app.get('/api/courses/:slugOrId', (req, res) => {
  const includeDrafts = req.query.includeDrafts === 'true';
  const course = db.getCourseByIdOrSlug(req.params.slugOrId, includeDrafts);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  res.json({ course });
});

app.post('/api/courses', authenticate, (req, res) => {
  try {
    const course = db.createCourse(req.body, getAdminEmail(req));
    res.status(201).json({ course });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create course.' });
  }
});

app.put('/api/courses/:id', authenticate, (req, res) => {
  const course = db.updateCourse(req.params.id, req.body, getAdminEmail(req));
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  res.json({ course });
});

app.delete('/api/courses/:id', authenticate, (req, res) => {
  const ok = db.deleteCourse(req.params.id, getAdminEmail(req));
  if (!ok) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  res.json({ success: true, message: 'Course and associated content deleted.' });
});

app.post('/api/courses/:id/duplicate', authenticate, (req, res) => {
  const duplicated = db.duplicateCourse(req.params.id, getAdminEmail(req));
  if (!duplicated) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  res.status(201).json({ course: duplicated });
});

// Sections
app.get('/api/courses/:courseId/sections', (req, res) => {
  const sections = db.getSections(req.params.courseId);
  res.json({ sections });
});

app.post('/api/courses/:courseId/sections', authenticate, (req, res) => {
  try {
    const section = db.createSection(req.params.courseId, req.body, getAdminEmail(req));
    res.status(201).json({ section });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create section.' });
  }
});

app.put('/api/sections/:id', authenticate, (req, res) => {
  const section = db.updateSection(req.params.id, req.body, getAdminEmail(req));
  if (!section) return res.status(404).json({ error: 'Section not found.' });
  res.json({ section });
});

app.delete('/api/sections/:id', authenticate, (req, res) => {
  const ok = db.deleteSection(req.params.id, getAdminEmail(req));
  if (!ok) return res.status(404).json({ error: 'Section not found.' });
  res.json({ success: true, message: 'Section and contained lessons deleted.' });
});

app.post('/api/sections/reorder', authenticate, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array of section IDs.' });
  }
  db.reorderSections(orderedIds, getAdminEmail(req));
  res.json({ success: true });
});

// Lessons
app.post('/api/sections/:sectionId/lessons', authenticate, (req, res) => {
  try {
    const lesson = db.createLesson(req.params.sectionId, req.body, getAdminEmail(req));
    res.status(201).json({ lesson });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create lesson.' });
  }
});

app.put('/api/lessons/:id', authenticate, (req, res) => {
  const lesson = db.updateLesson(req.params.id, req.body, getAdminEmail(req));
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  res.json({ lesson });
});

app.delete('/api/lessons/:id', authenticate, (req, res) => {
  const ok = db.deleteLesson(req.params.id, getAdminEmail(req));
  if (!ok) return res.status(404).json({ error: 'Lesson not found.' });
  res.json({ success: true, message: 'Lesson deleted.' });
});

app.post('/api/lessons/:id/duplicate', authenticate, (req, res) => {
  const duplicated = db.duplicateLesson(req.params.id, getAdminEmail(req));
  if (!duplicated) return res.status(404).json({ error: 'Lesson not found.' });
  res.status(201).json({ lesson: duplicated });
});

app.post('/api/lessons/reorder', authenticate, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array of lesson IDs.' });
  }
  db.reorderLessons(orderedIds, getAdminEmail(req));
  res.json({ success: true });
});

// Direct Video Upload
app.post('/api/upload/video', authenticate, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided.' });
  }

  const fileUrl = `/uploads/videos/${req.file.filename}`;
  db.log('Uploaded Video File', 'video', req.file.originalname, getAdminEmail(req), `File size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);

  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    sizeBytes: req.file.size,
    sizeFormatted: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
    mimetype: req.file.mimetype
  });
});

// YouTube Playlist Import
app.post('/api/youtube/import-playlist', authenticate, async (req, res) => {
  const { urlOrId, courseId, sectionTitle, targetSectionId, createNewSection = true } = req.body;
  if (!urlOrId || !courseId) {
    return res.status(400).json({ error: 'Playlist URL or ID and Course ID are required.' });
  }

  const course = db.getCourseByIdOrSlug(courseId, true);
  if (!course) {
    return res.status(404).json({ error: 'Target course not found.' });
  }

  try {
    const playlist = await fetchYouTubePlaylist(urlOrId);

    // Determine section to place videos in
    let sectionId = targetSectionId;
    let secTitle = sectionTitle || playlist.title;

    if (!sectionId && createNewSection) {
      const newSec = db.createSection(course.id, {
        title: secTitle,
        description: `Imported from YouTube Playlist: ${playlist.title}`,
        status: 'published'
      }, getAdminEmail(req));
      sectionId = newSec.id;
    } else if (!sectionId) {
      const existingSections = db.getSections(course.id);
      if (existingSections.length > 0) {
        sectionId = existingSections[0].id;
      } else {
        const newSec = db.createSection(course.id, {
          title: secTitle,
          description: `Imported from YouTube Playlist`,
          status: 'published'
        }, getAdminEmail(req));
        sectionId = newSec.id;
      }
    }

    // Create individual lessons preserving exact YouTube order
    const createdLessons = [];
    for (let i = 0; i < playlist.items.length; i++) {
      const item = playlist.items[i];
      const lesson = db.createLesson(sectionId, {
        courseId: course.id,
        title: item.title,
        description: item.description || `Session ${i + 1} of ${playlist.title}.`,
        videoType: 'youtube',
        youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
        youtubeVideoId: item.videoId,
        thumbnail: item.thumbnail,
        duration: item.duration || '45-60 mins',
        lessonNumber: i + 1,
        order: i + 1,
        freePreview: i === 0,
        status: 'published'
      }, getAdminEmail(req));
      createdLessons.push(lesson);
    }

    // Record playlist mapping
    db.addPlaylistRecord({
      id: `pl_${Date.now()}`,
      playlistId: playlist.playlistId,
      title: playlist.title,
      courseId: course.id,
      courseTitle: course.title,
      sectionId,
      sectionTitle: secTitle,
      videoCount: playlist.items.length,
      importedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      status: 'active',
      youtubeUrl: urlOrId.startsWith('http') ? urlOrId : `https://youtube.com/playlist?list=${playlist.playlistId}`
    }, getAdminEmail(req));

    res.json({
      success: true,
      playlistTitle: playlist.title,
      importedCount: createdLessons.length,
      sectionId,
      source: playlist.source
    });
  } catch (err: any) {
    console.error('Playlist import failed:', err);
    res.status(500).json({ error: err.message || 'Failed to import YouTube playlist.' });
  }
});

// YouTube Playlist Sync / Preview
app.post('/api/youtube/sync-playlist/:playlistRecordId', authenticate, async (req, res) => {
  const playlists = db.getPlaylists();
  const record = playlists.find(p => p.id === req.params.playlistRecordId);
  if (!record) {
    return res.status(404).json({ error: 'Playlist record not found.' });
  }

  try {
    const livePlaylist = await fetchYouTubePlaylist(record.playlistId);
    const existingLessons = db.getSections(record.courseId)
      .flatMap(s => s.lessons || [])
      .filter(l => l.sectionId === record.sectionId);

    const existingVideoIds = new Set(existingLessons.map(l => l.youtubeVideoId));
    const liveVideoIds = new Set(livePlaylist.items.map(i => i.videoId));

    const newVideos = livePlaylist.items.filter(i => !existingVideoIds.has(i.videoId));
    const removedLessons = existingLessons.filter(l => l.youtubeVideoId && !liveVideoIds.has(l.youtubeVideoId));

    if (req.body.applySync === true) {
      // Add new videos
      let nextOrder = existingLessons.length + 1;
      for (const item of newVideos) {
        db.createLesson(record.sectionId!, {
          courseId: record.courseId,
          title: item.title,
          description: item.description || `Imported during sync.`,
          videoType: 'youtube',
          youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          youtubeVideoId: item.videoId,
          thumbnail: item.thumbnail,
          lessonNumber: nextOrder,
          order: nextOrder,
          status: 'published'
        }, getAdminEmail(req));
        nextOrder++;
      }

      // Update record sync time
      db.addPlaylistRecord({
        ...record,
        lastSyncedAt: new Date().toISOString(),
        videoCount: existingLessons.length + newVideos.length
      }, getAdminEmail(req));

      return res.json({
        applied: true,
        addedCount: newVideos.length,
        removedCount: removedLessons.length
      });
    }

    res.json({
      applied: false,
      playlistTitle: livePlaylist.title,
      totalLiveVideos: livePlaylist.items.length,
      currentLessonCount: existingLessons.length,
      newVideosCount: newVideos.length,
      removedVideosCount: removedLessons.length,
      newVideos: newVideos.map(v => ({ videoId: v.videoId, title: v.title })),
      removedLessons: removedLessons.map(l => ({ id: l.id, title: l.title, videoId: l.youtubeVideoId }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync operation failed.' });
  }
});

app.get('/api/playlists', authenticate, (req, res) => {
  res.json({ playlists: db.getPlaylists() });
});

app.delete('/api/playlists/:id', authenticate, (req, res) => {
  const ok = db.deletePlaylistRecord(req.params.id, getAdminEmail(req));
  if (!ok) return res.status(404).json({ error: 'Playlist record not found.' });
  res.json({ success: true });
});

// Settings
app.get('/api/settings', (req, res) => {
  const s = db.getSettings();
  res.json({
    settings: {
      ...s,
      youtubeApiKeyMasked: process.env.YOUTUBE_API_KEY ? '••••••••••••' + process.env.YOUTUBE_API_KEY.slice(-4) : undefined
    }
  });
});

app.post('/api/settings', authenticate, (req, res) => {
  const { siteName, tagline, contactEmail, contactPhone, youtubeApiKey } = req.body;
  const updates: any = {};
  if (siteName) updates.siteName = siteName;
  if (tagline) updates.tagline = tagline;
  if (contactEmail) updates.contactEmail = contactEmail;
  if (contactPhone) updates.contactPhone = contactPhone;
  if (youtubeApiKey !== undefined) {
    if (youtubeApiKey) {
      process.env.YOUTUBE_API_KEY = youtubeApiKey;
      updates.youtubeApiKeyConfigured = true;
    } else {
      process.env.YOUTUBE_API_KEY = '';
      updates.youtubeApiKeyConfigured = false;
    }
  }

  const updated = db.updateSettings(updates, getAdminEmail(req));
  res.json({ settings: updated });
});

// Audit Logs
app.get('/api/audit-logs', authenticate, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ logs: db.getAuditLogs(limit) });
});

// Stats
app.get('/api/admin/stats', authenticate, (req, res) => {
  res.json({ stats: db.getStats() });
});

// -------------------------------------------------------------
// SUPABASE BACKEND INTEGRATION ENDPOINTS
// -------------------------------------------------------------

// Check live connection & tables status
app.get('/api/admin/supabase/status', authenticate, async (req, res) => {
  try {
    const status = await checkSupabaseStatus();
    res.json({ status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check Supabase status' });
  }
});

// Push all local data (courses, sections, lessons, playlists, settings) to Supabase
app.post('/api/admin/supabase/push', authenticate, async (req, res) => {
  try {
    const raw = db.getRawData();
    const result = await pushAllToSupabase({
      courses: raw.courses,
      sections: raw.sections,
      lessons: raw.lessons,
      playlists: raw.playlists,
      auditLogs: raw.auditLogs,
      settings: raw.settings,
    });

    if (result.pushed.courses > 0) {
      db.updateSettings({ storageProvider: 'supabase' }, getAdminEmail(req));
    }

    db.log(
      'Synchronized to Supabase',
      'settings',
      'Supabase Database',
      getAdminEmail(req),
      `Pushed ${result.pushed.courses} courses, ${result.pushed.sections} sections, ${result.pushed.lessons} lessons to Supabase.`
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Push to Supabase failed' });
  }
});

// Pull all courses, sections, lessons, playlists from Supabase into active memory & local backup
app.post('/api/admin/supabase/pull', authenticate, async (req, res) => {
  try {
    const result = await pullAllFromSupabase();
    if (result.success && result.data) {
      db.replaceData(result.data);
      db.log(
        'Pulled from Supabase',
        'settings',
        'Supabase Database',
        getAdminEmail(req),
        `Restored ${result.data.courses?.length || 0} courses, ${result.data.lessons?.length || 0} lessons from Supabase.`
      );
      res.json({
        success: true,
        counts: {
          courses: result.data.courses?.length || 0,
          sections: result.data.sections?.length || 0,
          lessons: result.data.lessons?.length || 0,
          playlists: result.data.playlists?.length || 0,
        },
      });
    } else {
      res.status(400).json({ success: false, error: result.error || 'Failed to pull from Supabase' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Pull from Supabase failed' });
  }
});

// Get Supabase SQL Schema for manual run or review
app.get('/api/admin/supabase/schema-sql', authenticate, (req, res) => {
  const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    res.json({
      sql,
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
    });
  } else {
    res.status(404).json({ error: 'Schema file not found' });
  }
});

// Global Search
app.get('/api/search', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    return res.json({ courses: [], sections: [], lessons: [] });
  }

  const courses = db.getCourses({ includeDrafts: false, search: q });
  // Also search lessons and sections
  const matchedSections: any[] = [];
  const matchedLessons: any[] = [];

  for (const c of db.getCourses({ includeDrafts: false })) {
    const full = db.getCourseByIdOrSlug(c.id, false);
    if (!full?.sections) continue;
    for (const s of full.sections) {
      if (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) {
        matchedSections.push({ ...s, courseTitle: c.title, courseSlug: c.slug });
      }
      for (const l of (s.lessons || [])) {
        if (l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) {
          matchedLessons.push({ ...l, courseTitle: c.title, courseSlug: c.slug, sectionTitle: s.title });
        }
      }
    }
  }

  res.json({
    courses,
    sections: matchedSections.slice(0, 10),
    lessons: matchedLessons.slice(0, 20)
  });
});

// Categories list
app.get('/api/categories', (req, res) => {
  const courses = db.getCourses({ includeDrafts: false });
  const cats = Array.from(new Set(courses.map(c => c.category))).filter(Boolean);
  res.json({ categories: ['All', ...cats] });
});

// -------------------------------------------------------------
// VITE OR STATIC ASSETS
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
