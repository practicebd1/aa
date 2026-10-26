import { Course, Section, Lesson, PlatformSettings } from '../types';
import seedRaw from '../../data/database.json';

// Static seed data fallback for GitHub Pages and environments without Node.js backend
export const fallbackCourses: Course[] = seedRaw.courses as unknown as Course[];
export const fallbackSections: Section[] = seedRaw.sections as unknown as Section[];
export const fallbackLessons: Lesson[] = seedRaw.lessons as unknown as Lesson[];
export const fallbackSettings: PlatformSettings = seedRaw.settings as unknown as PlatformSettings;

export function getFallbackCourseWithContent(slugOrId: string): Course | null {
  const course = fallbackCourses.find(
    (c) => c.slug === slugOrId || c.id === slugOrId
  );
  if (!course) return null;

  const sections = fallbackSections
    .filter((s) => s.courseId === course.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((sec) => {
      const lessons = fallbackLessons
        .filter((l) => l.sectionId === sec.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return {
        ...sec,
        lessons,
      };
    });

  return {
    ...course,
    sections,
  };
}
