import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, auth, doc, updateDoc, getDoc, handleFirestoreError, OperationType, runTransaction } from '../firebase';
import { ChatMessage, BookStatus } from '../types';
import { Send, ChevronLeft, ShieldAlert, AlertTriangle, CheckCircle2, Book as BookIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
  onReviewUser?: (userId: string, userName: string, bookId: string) => void;
  onUserClick?: (userId: string) => void;
}

const FORBIDDEN_KEYWORDS = ['price', 'sell', 'tk', 'money', 'cash', 'pay', 'cost', 'buy'];

export default function ChatWindow({ chatId, onBack, onReviewUser, onUserClick }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatRef = doc(db, 'chats', chatId);
    const unsubscribeChat = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setChatInfo(data);
        
        // Fetch book info
        getDoc(doc(db, 'books', data.bookId)).then(bookSnap => {
          if (bookSnap.exists()) {
            setBookInfo({ id: bookSnap.id, ...bookSnap.data() });
          }
        }).catch(err => handleFirestoreError(err, OperationType.GET, `books/${data.bookId}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${chatId}`);
    });

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(messageData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${chatId}/messages`);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const text = newMessage.trim();
    const isFlagged = FORBIDDEN_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword));

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        chatId,
        senderId: auth.currentUser.uid,
        text,
        createdAt: serverTimestamp(),
        flagged: isFlagged
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsGivenAway = async () => {
    if (!bookInfo || !auth.currentUser || bookInfo.ownerId !== auth.currentUser.uid || !chatInfo) return;

    const otherUserId = chatInfo.participants.find((id: string) => id !== auth.currentUser?.uid);
    if (!otherUserId) return;

    try {
      // Update book status
      await updateDoc(doc(db, 'books', bookInfo.id), {
        status: 'Given Away'
      });

      // Increment owner's givenCount and recipient's receivedCount using transaction
      const ownerRef = doc(db, 'users', auth.currentUser.uid);
      const recipientRef = doc(db, 'users', otherUserId);
      
      await runTransaction(db, async (transaction) => {
        const ownerDoc = await transaction.get(ownerRef);
        const recipientDoc = await transaction.get(recipientRef);
        
        if (ownerDoc.exists()) {
          transaction.update(ownerRef, {
            givenCount: (ownerDoc.data().givenCount || 0) + 1
          });
        }
        
        if (recipientDoc.exists()) {
          transaction.update(recipientRef, {
            receivedCount: (recipientDoc.data().receivedCount || 0) + 1
          });
        }
      });

      alert("Book marked as Given Away. Thank you for sharing!");
    } catch (error) {
      console.error("Error updating book status:", error);
    }
  };

  const handleReport = async (reason: string) => {
    if (!auth.currentUser || !chatInfo) return;
    
    const otherUserId = chatInfo.participants.find((id: string) => id !== auth.currentUser?.uid);
    
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: auth.currentUser.uid,
        reportedUserId: otherUserId,
        reason,
        createdAt: serverTimestamp()
      });
      alert("Report submitted. We will review it shortly.");
      setShowReportModal(false);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 text-stone-400 hover:text-stone-900">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 
              className={`font-serif italic text-lg text-stone-900 leading-tight ${onUserClick ? 'cursor-pointer hover:text-stone-700 transition-colors' : ''}`}
              onClick={() => {
                if (onUserClick && chatInfo) {
                  const otherUserId = chatInfo.participants.find((id: string) => id !== auth.currentUser?.uid);
                  if (otherUserId) onUserClick(otherUserId);
                }
              }}
            >
              {bookInfo?.title || 'Loading...'}
            </h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              {bookInfo?.status === 'Given Away' ? 'Given Away' : 'Active Conversation'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {bookInfo?.ownerId === auth.currentUser?.uid && bookInfo?.status !== 'Given Away' && (
            <button 
              onClick={markAsGivenAway}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-green-100 hover:bg-green-100 transition-colors"
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">Mark Given Away</span>
              <span className="sm:hidden">Given</span>
            </button>
          )}
          {bookInfo?.status === 'Given Away' && onReviewUser && (
            <button 
              onClick={() => {
                const otherUserId = chatInfo.participants.find((id: string) => id !== auth.currentUser?.uid);
                const otherUserName = chatInfo.participantNames?.[otherUserId] || 'User';
                onReviewUser(otherUserId, otherUserName, bookInfo.id);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
            >
              Rate User
            </button>
          )}
          <button 
            onClick={() => setShowReportModal(true)}
            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
            title="Report User"
          >
            <AlertTriangle size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="px-4 py-2 bg-stone-100 rounded-full text-[10px] text-stone-500 font-bold uppercase tracking-widest border border-stone-200">
            Safety Tip: Meet in a public place
          </div>
          <div className="max-w-xs text-center text-[10px] text-stone-400 uppercase tracking-widest font-bold leading-relaxed px-8">
            This platform is strictly for free exchanges. Selling is prohibited.
          </div>
          
          {bookInfo?.ownerId === auth.currentUser?.uid && bookInfo?.status !== 'Given Away' && (
            <button 
              onClick={markAsGivenAway}
              className="mt-2 flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 hover:bg-green-100 transition-all shadow-sm"
            >
              <CheckCircle2 size={18} />
              Mark Book as Given Away
            </button>
          )}
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-1`}>
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  isMe ? 'bg-stone-900 text-white rounded-tr-none' : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
                } ${msg.flagged ? 'border-red-200 bg-red-50 text-red-900' : ''}`}>
                  {msg.text}
                  {msg.flagged && (
                    <div className="mt-1 pt-1 border-t border-red-100 flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter text-red-500">
                      <ShieldAlert size={10} />
                      Flagged for commerce policy
                    </div>
                  )}
                </div>
                <p className={`text-[9px] text-stone-400 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-serif italic text-stone-900">Report User</h3>
                <p className="text-stone-500 text-xs">Why are you reporting this user?</p>
              </div>

              <div className="space-y-2">
                {['Attempting to sell', 'Inappropriate behavior', 'Spam', 'Other'].map(reason => (
                  <button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="w-full text-left px-4 py-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowReportModal(false)}
                className="w-full py-3 text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
