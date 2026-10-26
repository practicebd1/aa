import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle, Award, Users, TrendingUp, Sparkles, ShieldCheck, PlayCircle, Star } from 'lucide-react';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';

interface HomeViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ courses, onSelectCourse, onNavigate }) => {
  const publishedCourses = courses.filter(c => c.status === 'published');
  const featuredCourses = publishedCourses.filter(c => c.featured);

  const categories = [
    { title: 'Digital Marketing', desc: 'Holistic strategy, funnel building & customer conversion', count: '3 Courses', icon: TrendingUp },
    { title: 'Google Ads & PPC', desc: 'Search auctions, Performance Max, Display & remarketing', count: '4 Courses', icon: Award },
    { title: 'SEO & Analytics', desc: 'Keyword strategy, site audits, GTM & GA4 reporting', count: '2 Courses', icon: BookOpen },
    { title: 'Freelance & Career', desc: 'Fiverr & Upwork client acquisition & proposal mastery', count: '2 Courses', icon: Users },
  ];

  const highlights = [
    {
      title: 'Real-World Case Studies',
      desc: 'All lessons feature real, live campaign setups, client account structures, and verifiable analytics data.'
    },
    {
      title: 'YouTube Playlist Sync',
      desc: 'Seamlessly linked to verified batch recordings with structured modules and uninterrupted high-definition video.'
    },
    {
      title: 'Complete Career Roadmaps',
      desc: 'From initial foundation tools to high-ticket client hunting outside traditional marketplaces.'
    },
    {
      title: 'Direct Video Management',
      desc: 'Modern platform supporting native uploads, cloud streaming, and continuous curriculum expansions.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stone-200/70 bg-gradient-to-b from-stone-50 via-white to-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-stone-900 border border-amber-400/40 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>PRACTICAL INDUSTRY-TESTED EDUCATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-stone-950 tracking-tight leading-[1.15]">
              Learn Digital Skills. <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10">Build Your Future.</span>
                <span className="absolute left-0 bottom-2 w-full h-3 bg-amber-300/60 -rotate-1 rounded-sm -z-0"></span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-body text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Explore practical courses in digital marketing, advertising, analytics, SEO, social media and freelancing.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-explore-courses-btn"
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-sm tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>EXPLORE COURSES</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                id="hero-start-learning-btn"
                onClick={() => {
                  const first = publishedCourses[0];
                  if (first) onSelectCourse(first);
                  else onNavigate('courses');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-white font-heading font-bold text-sm tracking-wider shadow-sm transition-all duration-200"
              >
                <PlayCircle className="w-4 h-4 text-amber-400" />
                <span>START LEARNING</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-stone-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Curriculum</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Unlimited Lifetime Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Self-Paced HD Video Lessons</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Curated Masterclasses
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-stone-950 mt-1">
              Featured Courses
            </h2>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-900 hover:text-amber-600 transition-colors"
          >
            <span>View all courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(featuredCourses.length > 0 ? featuredCourses : publishedCourses).slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>
      </section>

      {/* Learning Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Core Disciplines
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mt-1">
              Learning Categories
            </h2>
            <p className="text-sm text-stone-400 mt-2">
              Select your focus area and dive into specialized modules crafted by seasoned digital practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate('courses')}
                  className="p-6 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 hover:border-amber-400/60 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-stone-100 group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-stone-400 group-hover:text-stone-200 border-t border-stone-700/60">
                    <span>{cat.count}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Courses Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Complete Catalog
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-950 mt-1">
              All Courses
            </h2>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950"
          >
            Explore All Catalog →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedCourses.map((course) => (
            <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>
      </section>

      {/* Why Learn With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Proven Standard
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-stone-950 mt-1">
            Why Learn With Us
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Engineered specifically to bridge the gap between abstract marketing theory and enterprise execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-start space-y-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold text-sm flex items-center justify-center">
                0{i + 1}
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                {h.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-amber-400 text-stone-950 p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              Ready to Accelerate Your Digital Career?
            </h2>
            <p className="text-stone-900 font-medium text-base sm:text-lg max-w-xl mx-auto">
              Start learning today with comprehensive, self-paced video masterclasses. Add new skills to your portfolio immediately.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('courses')}
              className="px-8 py-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-white font-heading font-bold text-sm tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              START LEARNING NOW
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-xl bg-white/80 hover:bg-white text-stone-950 font-heading font-bold text-sm tracking-wider transition-all"
            >
              TALK TO AN ADVISOR
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
