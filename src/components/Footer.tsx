import React from 'react';
import { BookOpen, Shield, Mail, Phone, ArrowUpRight, Youtube, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group inline-flex select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-white">
                SkillStream
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Professional multi-course learning platform empowering professionals with practical digital marketing, performance advertising, SEO analytics, and freelancing skills.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Practical Curriculum & Verified Masterclasses</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('courses')}
                  className="hover:text-amber-400 transition-colors"
                >
                  All Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About SkillStream
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Courses */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">
              Featured Courses
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('course', 'batch-19')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Batch 19 Course
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('course', 'batch-20')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Batch 20 Course
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('course', 'digital-marketing-freelancing')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  38-Class Freelancing Course
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('course', 'digital-marketing')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Digital Marketing
                </button>
              </li>
            </ul>
          </div>

          {/* Administrative */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">
              Administration
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Course management, playlist syncing, lesson ordering, and video upload portal.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-semibold tracking-wide border border-stone-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal Login</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} SkillStream Learning Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-300 cursor-pointer">Student Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
