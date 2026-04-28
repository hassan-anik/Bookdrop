import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, Book as BookIcon, ShieldAlert, Star, Trophy, Plus, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: User | null;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onLogin: () => void;
  onAddBook: () => void;
  onSupport: () => void;
  onSettings: () => void;
  onSafety: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onMoreApps: () => void;
  onMission: () => void;
  onHome: () => void;
  onProfileClick?: () => void;
}

export default function Navbar({ user, userProfile, onLogout, onLogin, onAddBook, onSupport, onSettings, onSafety, onPrivacy, onTerms, onMoreApps, onMission, onHome, onProfileClick }: NavbarProps) {
  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-stone-100 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-[3000] shadow-[0_1px_4px_rgb(0,0,0,0.02)]">
      <div 
        className="flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
        onClick={onHome}
      >
        <div className="w-10 h-10 bg-stone-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-900/10">
          <BookIcon size={20} />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-serif italic text-2xl tracking-tight text-stone-950">BookDrop</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-300">Neighborhood</span>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-10">
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          <button onClick={onMission} className="hover:text-stone-900 transition-colors">Mission</button>
          <button 
            onClick={() => {
              if (!user) onLogin();
              else onAddBook();
            }}
            className="text-stone-900 border-x border-stone-100 px-8 hover:text-stone-600 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Drop a Book
          </button>
          <button onClick={onSupport} className="hover:text-rose-500 transition-colors flex items-center gap-2">
            <Heart size={14} />
            Support
          </button>
          <button onClick={onMoreApps} className="hover:text-indigo-500 transition-colors flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
            </div>
            More
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onSafety} className="p-2.5 bg-stone-50 rounded-xl text-stone-400 hover:text-stone-900 transition-colors">
            <ShieldAlert size={20} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-stone-100">
              <div 
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                onClick={onProfileClick}
              >
                <p className="text-sm font-bold text-stone-900 leading-none">{user.displayName}</p>
                <div className="flex items-center justify-end gap-3 mt-1.5 opacity-60">
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-stone-500">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    {userProfile?.rating ? userProfile.rating.toFixed(1) : 'New'}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-stone-500">
                    <Trophy size={10} />
                    {userProfile?.givenCount || 0}
                  </div>
                </div>
              </div>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-10 h-10 rounded-[14px] border-2 border-white shadow-xl cursor-pointer hover:scale-105 transition-transform"
                alt="Profile"
                referrerPolicy="no-referrer"
                onClick={onProfileClick}
              />
              <button 
                onClick={onLogout}
                className="p-2.5 text-stone-300 hover:text-rose-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="pl-6 border-l border-stone-100">
              <button 
                onClick={onLogin}
                className="bg-stone-950 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95"
              >
                Enter Library
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
