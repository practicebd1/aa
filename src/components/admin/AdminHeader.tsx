import React from 'react';
import { 
  LayoutDashboard, BookOpen, Layers, Youtube, Shield, 
  ExternalLink, LogOut, Plus, Upload, Sliders, History 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab = 'overview' | 'courses' | 'builder' | 'playlists' | 'logs' | 'settings';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  onCreateCourseClick: () => void;
  onImportPlaylistClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  onNavigateHome,
  onCreateCourseClick,
  onImportPlaylistClick
}) => {
  const { user, logout } = useAuth();

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'builder', label: 'Curriculum Builder', icon: Layers },
    { id: 'playlists', label: 'Playlists & Sync', icon: Youtube },
    { id: 'logs', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-stone-800/80">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-lg text-white">
                SkillStream CMS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Admin Console
              </span>
            </div>
          </div>

          {/* Right Action Icons & User */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button
              onClick={onCreateCourseClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Course</span>
            </button>

            <button
              onClick={onImportPlaylistClick}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 font-heading font-semibold text-xs border border-stone-700 transition-all"
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>Import Playlist</span>
            </button>

            {/* Public Website Preview Link */}
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              title="Preview public student website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Website</span>
            </button>

            {/* User Details & Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-stone-800">
              <span className="text-xs text-stone-400 hidden lg:inline truncate max-w-[150px]">
                {user?.email || 'practicebd22@gmail.com'}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-900 transition-colors"
                title="Sign out of admin session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
