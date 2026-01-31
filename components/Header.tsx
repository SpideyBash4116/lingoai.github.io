
import React from 'react';
import { AppLanguage, UserLevel, User } from '../types';

interface HeaderProps {
  language: AppLanguage;
  level: UserLevel;
  experience: number;
  streak: number;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, level, experience, streak, user, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">LingoAI</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{language} • {level}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">{experience} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-orange-500">{streak}</span>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Guest'}</p>
              <button onClick={onLogout} className="text-[10px] text-slate-400 font-bold hover:text-indigo-600 uppercase tracking-tighter">Sign Out</button>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-500/20 overflow-hidden shadow-sm">
              <img src={user?.picture || "https://picsum.photos/seed/guest/100/100"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
