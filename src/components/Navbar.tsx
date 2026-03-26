import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, BookOpen, ShieldAlert, Star, Trophy, Plus, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: User | null;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onLogin: () => void;
  onAddBook: () => void;
  onSupport: () => void;
  onSettings: () => void;
}

export default function Navbar({ user, userProfile, onLogout, onLogin, onAddBook, onSupport, onSettings }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-stone-900/20">
          <BookOpen size={16} className="sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-serif italic text-xl sm:text-2xl tracking-tight text-stone-900">BookDrop</span>
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Neighborhood Exchange</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <button 
            onClick={() => {
              if (!user) onLogin();
              else onAddBook();
            }}
            className="hover:text-stone-900 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            List a Book
          </button>
          <button onClick={onSupport} className="hover:text-stone-900 transition-colors flex items-center gap-2 text-rose-500">
            <Heart size={14} className="fill-rose-500" />
            Support
          </button>
          <a href="#" className="hover:text-stone-900 transition-colors">The Mission</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Safety</a>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-stone-900">{user.displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  {userProfile?.rating ? userProfile.rating.toFixed(1) : 'New'}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                  <Trophy size={10} className="text-stone-400" />
                  {userProfile?.givenCount || 0} Given
                </div>
              </div>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              className="w-8 h-8 rounded-full border border-stone-200"
              alt="Profile"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={onSettings}
              className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
              title="Notification Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="pl-4 border-l border-stone-100">
            <button 
              onClick={onLogin}
              className="bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
