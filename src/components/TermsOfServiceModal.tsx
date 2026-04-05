import React from 'react';
import { X, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export default function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-stone-900">Terms of Service</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Last Updated: April 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">1. Acceptance of Terms</h3>
            <p>
              By accessing or using BookDrop, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">2. Strictly Non-Commercial</h3>
            <p>
              BookDrop is a free community exchange platform. <strong>Selling, renting, or asking for money in exchange for books is strictly prohibited.</strong> Violation of this rule will result in an immediate and permanent ban from the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">3. User Conduct</h3>
            <p>
              You agree to treat all community members with respect. Harassment, hate speech, spam, or any form of abusive behavior will not be tolerated. You are solely responsible for your interactions with other users.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">4. Content Ownership</h3>
            <p>
              You retain ownership of the content you post on BookDrop (e.g., book listings, reviews). However, by posting content, you grant us a non-exclusive license to use, display, and distribute that content within the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">5. Disclaimer of Warranties</h3>
            <p>
              BookDrop is provided "as is" without any warranties. We do not guarantee the accuracy, safety, or quality of the books listed or the users on the platform. Use BookDrop at your own risk.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
