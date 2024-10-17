import React, { useEffect, useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useUser } from '@lib/context/user-context';
import { addDoc, collection,query, where, onSnapshot, orderBy, doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { privateChatsCollection } from '@lib/firebase/collections';
import { Chat, chatConverter, ChatOverview, chatOverviewConverter } from '@lib/types/chat';
import { db } from '@lib/firebase/app';
import { HeroIcon } from '@components/ui/hero-icon';
import { useWindow } from '@lib/context/window-context';

function getChatId(user1Id:string, user2Id:string): string {
    return user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
  }
  
export function ViewChat(): JSX.Element {
  const { isMobile } = useWindow();
  const { user } = useAuth();
  const { user: target } = useUser();
  const [msgs, setMsgs] = useState([] as any[]);
  const [newMessage, setNewMessage] = useState('');
  const chatId = getChatId(user!.id, target!.id);
  useEffect(() => {
    const checkChatExists = async () => {
        const chatRef = doc(db, 'chats', chatId).withConverter(chatOverviewConverter);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            const data = chatDoc.data()!;
            await setDoc(chatRef, {
                unreadMessages: {
                    ...data.unreadMessages,
                    [user!.id]: 0
                }
            }, { merge: true });
        }
    };

    checkChatExists();
    const messagesRef = collection(db, `chats/${chatId}/messages`).withConverter(chatConverter);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: any[] = [];
      snapshot.forEach(doc => {
        fetchedMessages.push(doc.data());
      });
      setMsgs(fetchedMessages);
    });

    return () => unsubscribe();  // Cleanup the listener on component unmount
  }, [chatId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    const newMsg = {
      senderId: user!.id,
      recipientId: target!.id,
      message: newMessage,
      timestamp: new Date(),
      isRead: false,
    };
    setMsgs([...msgs, newMsg]);
    setNewMessage('');
    //addDoc(privateChatsCollection, newMsg);
    const chatRef = doc(db, 'chats', chatId).withConverter(chatOverviewConverter);
    const chatSnapshot = await getDoc(chatRef);
  
  if (!chatSnapshot.exists()) {
    // Create the chat if it does not exist
    const chatOverview: ChatOverview = {
      participants: [user!.id, target!.id],
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
      lastSender: user!.id,
      unreadMessages: { [user!.id]: 0, [target!.id]: 1 }  // Assuming user2 is the receiver
    };
    
    await setDoc(chatRef, chatOverview);
  } else {
    // Update the existing chat
    const data = chatSnapshot.data()!;
    await setDoc(chatRef, {
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
      lastSender: user!.id,
      unreadMessages: {
        ...data.unreadMessages,
        [target!.id]: data.unreadMessages[target!.id] + 1
      }
    }, { merge: true });
  }
  
  // Add the message to the subcollection
  const messagesRef = collection(db, `chats/${chatId}/messages`).withConverter(chatConverter);
  const addMessage: Chat = {
    senderId: user!.id,
    recipientId: target!.id,
    message: newMessage,
    timestamp: serverTimestamp() as Timestamp,  // Use Firestore's server timestamp
    isRead: false
  };
  
  await addDoc(messagesRef, addMessage);

    
  };
  
return (
    <div className={`chat-window ${isMobile ? 'mobile' : ''}`}>
        <div className="messages">
            {msgs.map((msg, index) => (
                <div
                    key={index}
                    className={`message ${msg.senderId === user!.id ? 'sent bg-main-accent' : 'received'}`}
                >
                    {msg.message}
                </div>
            ))}
        </div>
        <div className="input-bar">
            <input
                className="peer flex-1 bg-transparent outline-none 
                                     placeholder:text-light-secondary dark:placeholder:text-dark-secondary"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage();
                    }
                }}
                placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>
                <HeroIcon iconName="PaperAirplaneIcon" className="h-6 w-6 hover:brightness-90 " />
            </button>
        </div>
        <style jsx>{`
            .chat-window {
                display: flex;
                flex-direction: column;
                height: calc(100dvh - 54px);
            }
                .chat-window.mobile {
                    height: calc(100dvh - 104px);
                }
            .messages {
                
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }
            .message {
                width:fit-content;
                padding: 10px 15px;
                margin: 5px 0;
                border-radius: 10px;
                max-width: 70%;
                min-width: 10%;
                text-align: center!important;
                
            }
            .sent {
                margin-left: auto;
                
                align-self: flex-end;
                text-align: right;
                border-radius:27px 24px 4px 24px;
            }
            .received {
                background-color: rgb(47, 51, 54);
                align-self: flex-start;
                text-align: left;
                border-radius:24px 27px 24px 4px;
            }
            .input-bar {
                display: flex;
                padding: 10px;
                border-top: 1px solid #ccc;
            }
            .input-bar button {
                padding: 10px 20px;
                color: rgb(var(--main-accent) / var(--tw-bg-opacity));
            }
        `}</style>
    </div>
);
}
