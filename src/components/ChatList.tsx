import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, auth, orderBy, handleFirestoreError, OperationType, getDoc, doc } from '../firebase';
import { ChatSession } from '../types';
import { MessageCircle, BookOpen, Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  onSupport: () => void;
}

export default function ChatList({ onSelectChat, selectedChatId, onSupport }: ChatListProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setChats(chatData);
      setLoading(false);

      // Fetch names for other participants
      const newNames: Record<string, string> = { ...participantNames };
      let namesUpdated = false;

      for (const chat of chatData) {
        const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
        if (otherUserId && !newNames[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              newNames[otherUserId] = userDoc.data().displayName || 'Unknown User';
              namesUpdated = true;
            }
          } catch (error) {
            console.error("Error fetching user name:", error);
          }
        }
      }

      if (namesUpdated) {
        setParticipantNames(newNames);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chats');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mx-auto">
          <MessageCircle size={24} />
        </div>
        <p className="text-stone-400 text-sm italic">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-stone-100">
        <h2 className="text-xl font-serif italic text-stone-900">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => {
          const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
          const otherUserName = otherUserId ? participantNames[otherUserId] : 'Unknown User';

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-start gap-4 transition-colors border-b border-stone-50 ${selectedChatId === chat.id ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
            >
              <div className="w-12 h-12 bg-stone-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-stone-500">
                <BookOpen size={20} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-stone-900 truncate text-sm">{chat.bookTitle}</h3>
                  {chat.updatedAt && (
                    <span className="text-[10px] text-stone-400 whitespace-nowrap">
                      {formatDistanceToNow(chat.updatedAt.toDate(), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 mb-1">
                  <User size={10} className="text-stone-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
                    {otherUserName}
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Sidebar Support Section */}
      <div className="p-6 bg-stone-50 border-t border-stone-100">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-500">
            <Heart size={16} className="fill-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Keep us running</span>
          </div>
          <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
            BookDrop is free and ad-free. Your support helps cover server costs and keeps the community growing.
          </p>
          <button 
            onClick={onSupport}
            className="w-full py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            Support Project
          </button>
        </div>
      </div>
    </div>
  );
}
