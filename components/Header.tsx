import React from 'react';
import { Activity, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-med-500/20 text-med-400 border-med-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-med-900/50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-med-950 border border-med-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <Activity className="w-6 h-6 text-med-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-med-400 opacity-20 animate-ping"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white font-sans">
              MED<span className="text-med-400">NEXUS</span>
            </h1>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-med-200/70 font-mono tracking-widest uppercase">System Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-4">
            <div className="px-3 py-1 rounded-full bg-med-950/50 border border-med-800/50 flex items-center space-x-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-med-200 font-mono">Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-dark-800/50 border border-med-900/50">
                <div className="w-6 h-6 rounded-full bg-med-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-medium text-white">{user.name}</div>
                  <div className={`text-[10px] px-1.5 py-0.5 rounded ${getRoleBadgeColor(user.role)} border`}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};