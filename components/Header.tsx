import React from 'react';
import { Activity, Zap } from 'lucide-react';

export const Header: React.FC = () => {
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
        
        <div className="hidden md:flex items-center space-x-4">
           <div className="px-3 py-1 rounded-full bg-med-950/50 border border-med-800/50 flex items-center space-x-2">
             <Zap className="w-3 h-3 text-yellow-400" />
             <span className="text-xs text-med-200 font-mono">Gemini 2.5 Flash</span>
           </div>
        </div>
      </div>
    </header>
  );
};