import React from 'react';
import { ShieldAlert, X, MapPin, MessageCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SafetyModalProps {
  onClose: () => void;
}

export default function SafetyModal({ onClose }: SafetyModalProps) {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-stone-900">Trust & Safety</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Community Guidelines</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-8">
          <div className="space-y-4">
            <p className="text-stone-600 leading-relaxed">
              BookDrop is built on trust and community. To ensure a safe and positive experience for everyone, please follow these core safety guidelines when exchanging books.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-stone-50 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-900 border border-stone-100">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-stone-900">Meet in Public</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Always arrange to meet in well-lit, public locations during daylight hours. Coffee shops, libraries, or shopping centers are ideal. Never go to someone's private residence or invite them to yours.
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-900 border border-stone-100">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-stone-900">Strictly Free</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                BookDrop is a 100% free exchange platform. Selling, renting, or asking for money is strictly prohibited. If someone asks you for payment, please report them immediately.
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-900 border border-stone-100">
                <MessageCircle size={20} />
              </div>
              <h3 className="font-bold text-stone-900">Keep it on Platform</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Use our built-in chat system for all communication. Avoid sharing personal phone numbers, email addresses, or social media accounts until you feel completely comfortable.
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-900 border border-stone-100">
                <UserCheck size={20} />
              </div>
              <h3 className="font-bold text-stone-900">Check Profiles</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Review a user's profile, ratings, and history before agreeing to meet. Trust your instincts—if a situation feels uncomfortable, you are never obligated to complete an exchange.
              </p>
            </div>
          </div>

          <div className="bg-stone-900 text-white p-6 rounded-3xl flex items-start gap-4">
            <ShieldAlert size={24} className="text-stone-400 shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Reporting Issues</h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                If you encounter inappropriate behavior, spam, or someone violating our "strictly free" policy, use the report button (triangle icon) located in the top right corner of any chat window. Our team reviews all reports promptly.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
