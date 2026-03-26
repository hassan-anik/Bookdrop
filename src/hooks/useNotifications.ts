import { useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, orderBy, limit, getDocs } from '../firebase';
import { UserProfile } from '../types';

export function useNotifications(userProfile: UserProfile | null) {
  const initialLoadChats = useRef(true);
  const initialLoadBooks = useRef(true);
  const processedMessageIds = useRef(new Set<string>());
  const processedBookIds = useRef(new Set<string>());

  useEffect(() => {
    if (!userProfile?.uid || !userProfile?.notificationSettings?.browserNotifications) {
      return;
    }

    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // 1. Listen for new messages in chats where user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userProfile.uid)
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      if (initialLoadChats.current) {
        initialLoadChats.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const chatData = change.doc.data();
          
          // Only notify if the last message was NOT sent by the current user
          // Since we don't have lastMessageSenderId directly on the chat doc, 
          // we can check if the last message text exists and we haven't notified for it recently.
          // A better way is to listen to the messages subcollection, but that requires a collection group query
          // or listening to each chat individually.
          // For now, we'll use a simple heuristic: if the chat updated, we check the latest message.
          
          const messagesQuery = query(
            collection(db, `chats/${change.doc.id}/messages`),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          getDocs(messagesQuery).then((msgSnapshot) => {
            if (!msgSnapshot.empty) {
              const msgDoc = msgSnapshot.docs[0];
              const msgData = msgDoc.data();
              
              if (
                msgData.senderId !== userProfile.uid && 
                !processedMessageIds.current.has(msgDoc.id)
              ) {
                processedMessageIds.current.add(msgDoc.id);
                
                if (Notification.permission === 'granted') {
                  const senderName = chatData.participantNames?.[msgData.senderId] || 'Someone';
                  new Notification(`New message from ${senderName}`, {
                    body: msgData.text,
                    icon: '/favicon.ico' // Assuming a default icon
                  });
                }
              }
            }
          });
        }
      });
    });

    // 2. Listen for new books
    const booksQuery = query(
      collection(db, 'books'),
      where('status', '==', 'Available')
    );

    const unsubscribeBooks = onSnapshot(booksQuery, (snapshot) => {
      if (initialLoadBooks.current) {
        initialLoadBooks.current = false;
        
        // Add existing books to processed set so we don't notify on them later
        snapshot.docs.forEach(doc => processedBookIds.current.add(doc.id));
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const bookData = change.doc.data();
          
          // Don't notify if the user listed it themselves
          if (bookData.ownerId === userProfile.uid) return;
          
          if (!processedBookIds.current.has(change.doc.id)) {
            processedBookIds.current.add(change.doc.id);
            
            if (Notification.permission === 'granted') {
              new Notification('New Book Listed Nearby!', {
                body: `"${bookData.title}" was just listed.`,
                icon: bookData.images?.[0] || '/favicon.ico'
              });
            }
          }
        }
      });
    });

    return () => {
      unsubscribeChats();
      unsubscribeBooks();
    };
  }, [userProfile]);
}
