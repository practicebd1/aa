import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Course, Lesson } from './types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';

import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { CourseDetailView } from './views/CourseDetailView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'courses' | 'course' | 'about' | 'contact' | 'login' | 'admin'>('home');
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>('');
  const [adminBuilderCourseId, setAdminBuilderCourseId] = useState<string | undefined>(undefined);

  // Global Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  // Video Player state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLessonList, setActiveLessonList] = useState<Lesson[]>([]);

  // Search Modal state
  const [searchOpen, setSearchOpen] = useState(false);

  // Load public courses
  const loadCourses = async () => {
    try {
      const data = await api.getCourses({ includeDrafts: isAuthenticated });
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [isAuthenticated]);

  // Handle URL hash / path navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin/login')) {
        setCurrentView('login');
      } else if (path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (path.startsWith('/courses/')) {
        const slug = path.replace('/courses/', '');
        setSelectedCourseSlug(slug);
        setCurrentView('course');
      } else if (path === '/courses') {
        setCurrentView('courses');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else {
        setCurrentView('home');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'course' && param) {
      setSelectedCourseSlug(param);
      setCurrentView('course');
      window.history.pushState({}, '', `/courses/${param}`);
    } else if (view === 'courses') {
      setCurrentView('courses');
      window.history.pushState({}, '', '/courses');
    } else if (view === 'about') {
      setCurrentView('about');
      window.history.pushState({}, '', '/about');
    } else if (view === 'contact') {
      setCurrentView('contact');
      window.history.pushState({}, '', '/contact');
    } else if (view === 'login') {
      setCurrentView('login');
      window.history.pushState({}, '', '/admin/login');
    } else if (view === 'admin') {
      if (!isAuthenticated) {
        setCurrentView('login');
        window.history.pushState({}, '', '/admin/login');
      } else {
        setCurrentView('admin');
        window.history.pushState({}, '', '/admin');
      }
    } else {
      setCurrentView('home');
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectCourse = (course: Course) => {
    navigateTo('course', course.slug || course.id);
  };

  const handleOpenLesson = (lesson: Lesson, allLessons: Lesson[], course: Course) => {
    setActiveLesson(lesson);
    setActiveLessonList(allLessons);
    setActiveCourse(course);
  };

  const handleSearchSelectLesson = async (courseSlug: string, lesson: Lesson) => {
    try {
      const fullCourse = await api.getCourse(courseSlug, true);
      const allL = (fullCourse.sections || []).flatMap(s => s.lessons || []);
      setActiveLesson(lesson);
      setActiveLessonList(allL);
      setActiveCourse(fullCourse);
      navigateTo('course', courseSlug);
    } catch {
      navigateTo('course', courseSlug);
    }
  };

  // Admin View
  if (currentView === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex flex-col bg-stone-50">
          <Navbar currentView="login" onNavigate={navigateTo} onOpenSearch={() => setSearchOpen(true)} />
          <div className="flex-1">
            <AdminLoginView
              onLoginSuccess={() => {
                loadCourses();
                setCurrentView('admin');
              }}
              onNavigateHome={() => navigateTo('home')}
            />
          </div>
          <Footer onNavigate={navigateTo} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-stone-100">
        <AdminDashboardView
          onNavigateHome={() => navigateTo('home')}
          onOpenVideoPreview={(lesson, allL, course) => handleOpenLesson(lesson, allL, course)}
          onViewPublicCourse={(slug) => navigateTo('course', slug)}
          initialCourseId={adminBuilderCourseId}
        />

        {/* Video Player Modal (for testing in Admin) */}
        {activeLesson && (
          <VideoPlayerModal
            lesson={activeLesson}
            course={activeCourse}
            allLessons={activeLessonList}
            onClose={() => setActiveLesson(null)}
            onSelectLesson={(les) => setActiveLesson(les)}
          />
        )}
      </div>
    );
  }

  // Public Views
  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-amber-400 selection:text-stone-950 font-body">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'courses' && (
          <CoursesView
            courses={courses}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentView === 'course' && (
          <CourseDetailView
            courseSlugOrId={selectedCourseSlug}
            onOpenLesson={handleOpenLesson}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'about' && (
          <AboutView onNavigate={navigateTo} />
        )}

        {currentView === 'contact' && (
          <ContactView />
        )}

        {currentView === 'login' && (
          <AdminLoginView
            onLoginSuccess={() => {
              loadCourses();
              setCurrentView('admin');
            }}
            onNavigateHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* Public Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Video Player Modal */}
      {activeLesson && (
        <VideoPlayerModal
          lesson={activeLesson}
          course={activeCourse}
          allLessons={activeLessonList}
          onClose={() => setActiveLesson(null)}
          onSelectLesson={(les) => setActiveLesson(les)}
        />
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectCourse={(slug) => navigateTo('course', slug)}
        onSelectLesson={handleSearchSelectLesson}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
