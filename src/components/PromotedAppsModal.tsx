import React from 'react';
import { X, Youtube, Gamepad2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const PROMOTED_APPS = [
  {
    id: 'yt-rankings',
    name: 'Most Popular Youtube Channel',
    link: 'https://mostpopularyoutubechannel.com/',
    description: 'Global YouTube Channel Rankings. Track, analyze, and predict the most subscribed YouTube channels across 197 countries in real-time.',
    icon: <Youtube size={24} className="text-red-500" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100'
  },
  {
    id: '100-card-game',
    name: '100 Card Game Online PvP',
    link: 'https://play.google.com/store/apps/details?id=app.emergent.pointchase03e0c36e&pcampaignid=web_share',
    description: '🔥 100 Card Game – Fast Multiplayer Fun! Play a fast-paced online card game where strategy and quick thinking decide the winner. Join exciting 4-player matches, play smart, and win rounds in real time.',
    icon: <Gamepad2 size={24} className="text-blue-500" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  }
];

interface PromotedAppsModalProps {
  onClose: () => void;
}

export default function PromotedAppsModal({ onClose }: PromotedAppsModalProps) {
  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-serif italic text-stone-900">Our Network</h2>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Discover More Apps</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {PROMOTED_APPS.map((app) => (
            <a 
              key={app.id}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-5 rounded-2xl border transition-all hover:shadow-md group ${app.bgColor} ${app.borderColor}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  {app.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 group-hover:text-stone-700 transition-colors">{app.name}</h3>
                    <ExternalLink size={14} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
