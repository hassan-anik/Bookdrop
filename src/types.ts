export type BookCondition = 'New' | 'Good' | 'Used';
export type BookStatus = 'Available' | 'Requested' | 'Given Away';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  givenCount?: number;
  receivedCount?: number;
  rating?: number;
  ratingCount?: number;
  location?: {
    lat: number;
    lng: number;
  };
  notificationSettings?: {
    browserNotifications: boolean;
    emailAlerts: boolean;
  };
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName?: string;
  revieweeId: string;
  bookId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

export interface BookListing {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description: string;
  category: string;
  condition: BookCondition;
  imageUrl?: string;
  location: {
    lat: number;
    lng: number;
  };
  status: BookStatus;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  bookId: string;
  bookTitle: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
  unreadCount?: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  flagged?: boolean;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: any;
}
