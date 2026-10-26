import React from 'react';
import { Award, BookOpen, CheckCircle, Target, Users, Shield, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Our Educational Mission
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight leading-tight">
          Practical Digital Skills for Modern Growth & Careers
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
          SkillStream is built to deliver real, unfiltered digital expertise. We eliminate abstract jargon in favor of step-by-step masterclasses, live client account walkthroughs, and battle-tested campaign architectures.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-stone-900">
            Outcomes-Focused
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            Every lecture solves an actual client objective: setting up Performance Max, tracking e-commerce conversions, or generating high-ticket B2B leads.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-stone-900">
            Verified Curriculum
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            From the 38-class flagship freelancing program to real batch playlists, the courses reflect live classroom training refined across hundreds of students.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-stone-900">
            Freelance & Career Ready
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            We don't just teach technical mechanics; we guide you through profile optimization, proposal strategies, and client negotiations on Fiverr, Upwork, and beyond.
          </p>
        </div>
      </div>

      {/* Instructor Credibility Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white space-y-6">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Curriculum Quality
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Built by Practitioners, Not Academics
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
            The courses featured on SkillStream are designed and led by senior marketing professionals managing six-figure advertising budgets and thriving international client rosters.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => onNavigate('courses')}
            className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>EXPLORE OUR CURRICULUM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
