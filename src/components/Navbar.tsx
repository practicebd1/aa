import React, { useState } from 'react';
import { BookOpen, Search, Menu, X, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenSearch }) => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'courses', label: 'COURSES' },
    { id: 'about', label: 'ABOUT' },
    { id: 'contact', label: 'CONTACT' }
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            id="nav-brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-950 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-2xl tracking-tight text-stone-950">
                  SkillStream
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
              </div>
              <span className="text-[11px] font-medium tracking-wider text-stone-700 uppercase">
                Learning Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'text-stone-950 bg-stone-100/90 shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Search Trigger */}
            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors border border-stone-200/60"
              title="Search courses and lessons"
            >
              <Search className="w-4 h-4 text-stone-700" />
              <span>Search courses...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-stone-300 rounded font-mono text-stone-600">
                ⌘K
              </kbd>
            </button>

            {/* Admin Login / Panel Button */}
            {isAuthenticated ? (
              <button
                id="nav-admin-dashboard-btn"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-semibold text-xs tracking-wider transition-all duration-200 ${
                  currentView.startsWith('admin')
                    ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>ADMIN PANEL</span>
              </button>
            ) : (
              <button
                id="nav-admin-login-btn"
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-heading font-semibold text-xs tracking-wider border border-stone-300 text-stone-800 hover:bg-stone-100 hover:text-stone-950 transition-all duration-150"
              >
                <Shield className="w-3.5 h-3.5 text-stone-600" />
                <span>ADMIN LOGIN</span>
              </button>
            )}

            {/* Start Learning Callout */}
            <button
              id="nav-explore-btn"
              onClick={() => handleNavClick('courses')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm hover:shadow transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>EXPLORE</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-search-btn"
              onClick={onOpenSearch}
              className="p-2.5 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-stone-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-stone-800 hover:text-stone-950 rounded-lg hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  currentView === item.id
                    ? 'bg-amber-400/20 text-stone-950 font-bold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2">
            {isAuthenticated ? (
              <button
                id="mobile-admin-panel-btn"
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-950 text-white font-heading font-semibold text-sm shadow"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>ADMIN PANEL</span>
              </button>
            ) : (
              <button
                id="mobile-admin-login-btn"
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-300 text-stone-900 font-heading font-semibold text-sm hover:bg-stone-50"
              >
                <Shield className="w-4 h-4 text-stone-500" />
                <span>ADMIN LOGIN</span>
              </button>
            )}

            <button
              id="mobile-start-learning-btn"
              onClick={() => handleNavClick('courses')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 text-stone-950 font-heading font-bold text-sm shadow-sm"
            >
              <span>BROWSE ALL COURSES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
