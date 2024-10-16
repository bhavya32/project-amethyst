import type { Timestamp, FirestoreDataConverter, FieldValue } from 'firebase/firestore';

export type Chat = {
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: Timestamp;  // Firebase Timestamp
  isRead: boolean;
};

export type ChatOverview = {
  participants: [string, string];
  lastMessage: string;
  lastMessageTimestamp: Timestamp | FieldValue;
  lastSender: string;
  unreadMessages: { [key: string]: number };  // Keeps track of unread counts per user
};

// Converter for the Chat Messages
export const chatConverter: FirestoreDataConverter<Chat> = {
  toFirestore(chat) {
    return { ...chat };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as Chat;
  }
};

// Converter for the Chat Overview (Main Chat Document)
export const chatOverviewConverter: FirestoreDataConverter<ChatOverview> = {
  toFirestore(chatOverview) {
    return { ...chatOverview };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as ChatOverview;
  }
};
