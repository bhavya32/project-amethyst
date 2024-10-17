import { useWindow } from '@lib/context/window-context';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { chatOverviewCollection, tweetsCollection } from '@lib/firebase/collections';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { Input } from '@components/input/input';
import { UpdateUsername } from '@components/home/update-username';
import { MainHeader } from '@components/home/main-header';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { Aside } from '@components/aside/aside';
import { Suggestions } from '@components/aside/suggestions';
import { format } from 'date-fns';

import { usersCollection } from '@lib/firebase/collections';
import { useCollection } from '@lib/hooks/useCollection';
import {
  doc,
  limit,
  query,
  where,
  orderBy,
  documentId,
  collection,
  getDocs,
  getDoc,
  Timestamp,
  FieldValue,
  onSnapshot
} from 'firebase/firestore';
import { UserCards } from '@components/user/user-cards';
import cn from 'clsx';

import { AnimatePresence, motion } from 'framer-motion';
import { StatsEmpty } from '@components/tweet/stats-empty';

import { variants } from '@components/user/user-header';
import { UserCard } from '@components/user/user-card';
import type { User } from '@lib/types/user';
import type { StatsType } from '@components/view/view-tweet-stats';
import type { StatsEmptyProps } from '@components/tweet/stats-empty';
import Link from 'next/link';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserUsername } from '@components/user/user-username';
import { UserName } from '@components/user/user-name';
import { UserAvatar } from '@components/user/user-avatar';
import { useUser } from '@lib/context/user-context';
import { useAuth } from '@lib/context/auth-context';
import { db } from '@lib/firebase/app';
import { ChatOverview } from '@lib/types/chat';

type FollowType = 'following' | 'followers';

type CombinedTypes = StatsType | FollowType;
type ChatWithUserDetails = ChatOverview & { otherUser: User | null };
const formatTimestamp = (timestamp: Timestamp | FieldValue) => {
  let d = (timestamp as Timestamp).toDate()
  if (format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
    return format(d, 'HH:mm');
  } else {
    return format(d, 'MMM dd, yyyy');
  }
  //return format(d, 'HH:mm');
};

export default function Chats(): JSX.Element {
  const { isMobile } = useWindow();
  const {user} = useAuth()
  const [loadingChats, setLoading] = useState(true);
  const [chatList, setChatList] = useState([] as ChatWithUserDetails[]);

  //console.log(user)
  useEffect(() => {
    if (!user) return;
  
    const fetchChats = () => {
      setLoading(true);
      const q = query(
        chatOverviewCollection,
        where('participants', 'array-contains', user.id),
        orderBy('lastMessageTimestamp', 'desc')
      );
  
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const chats = snapshot.docs.map((doc) => doc.data() as ChatOverview);
  
        const chatsWithUserDetails = await Promise.all(
          chats.map(async (chat) => {
            const otherUserId = chat.participants.find((id) => id !== user.id);
            const userDoc = await getDoc(doc(usersCollection, otherUserId));
            const otherUser = userDoc.exists() ? (userDoc.data() as User) : null;
            return { ...chat, otherUser };
          })
        );
  
        setChatList(chatsWithUserDetails);
        setLoading(false);
      });
  
      return unsubscribe;
    };
  
    const unsubscribe = fetchChats();
  
    return () => {
      unsubscribe();
    };
  }, [user]);

  //console.log(chatList)
  const noStatsData = {
    title: 'No Chats Found',
    imageData: { src: '/assets/no-followers.png', alt: 'No chats' },
    description:
      'You can initiate chats by going to user profiles and clicking on the chat button.'
  };
  return (
    <MainContainer>
      <SEO title='Amethyst | Chats' />
      <MainHeader
        useMobileSidebar
        title='Chats'
        className='flex items-center justify-between'
      >
        
      </MainHeader>
      
      <section
      className={cn(
        loadingChats && 'flex items-center justify-center'
      )}
    >
      {loadingChats ? (
        <Loading className={'mt-5'} />
      ) : (
        <AnimatePresence mode='popLayout'>
          {chatList?.length ? (
            chatList?.map((chat) => {
              //const user = chat.participants.find((participant:User) => participant.id !== user!.id)
              //let userData = user

              return(
              
              <motion.div layout='position' key={chat.otherUser?.id} {...variants}>
                {/* <UserCard {...userData} follow={follow} modal={modal} /> */}
                <Link href={`/chats/${chat.otherUser?.username}`}>
                    <a
                      className='items-center accent-tab hover-animation gap-3 px-4
                                py-3 hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 flex flex-row'
                    >
                      
                        <div className="w-full accent-tab hover-animation grid grid-cols-[auto,1fr] gap-3 hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 flex flex-row">
                     <UserTooltip avatar {...chat.otherUser!} modal={false}>
                      <UserAvatar src={chat.otherUser!.photoURL} alt={chat.otherUser!.name} username={chat.otherUser!.username} />
                    </UserTooltip> 
                      <div className='flex flex-col gap-1 truncate xs:overflow-visible'>
                        <div className='flex items-center justify-between gap-2 truncate xs:overflow-visible'>
                          <div className='flex flex-col justify-center truncate xs:overflow-visible xs:whitespace-normal'>
                          <div className='flex flex-row'>
                            <UserName
                              disableLink={true}
                              className='-mb-1'
                              name={chat.otherUser!.name}
                              username={chat.otherUser!.username}
                              verified={chat.otherUser!.verified}
                            />
                            <div className='truncate text-light-secondary dark:text-dark-secondary -mb-1 ml-2'
                              tabIndex={-1}>@{chat.otherUser?.username} · {formatTimestamp(chat.lastMessageTimestamp)}</div>
                            
                          </div>
                            <div className='flex items-center gap-1 text-light-secondary dark:text-dark-secondary'>
                              
                            
                              
                              <div className='truncate text-light-secondary dark:text-dark-secondary'
                              tabIndex={-1}>{chat.lastSender == user!.id ? "You: ":""}{chat.lastMessage}</div>
                            
                            
                            </div>
                          </div>
                          
                        </div>
                        
                      </div>
                      </div>
                      {chat.unreadMessages[user!.id] ? (
                      <div className="w-2.5 h-2.5 bg-main-accent rounded-full inline-block">
                      </div>):(<></>)}
                      
                    </a>
                  </Link>
              </motion.div>
            )})
          ) : (
            <StatsEmpty {...noStatsData} modal={false} />
          )}
        </AnimatePresence>
      )}
      </section>
      {/*
      <section className='mt-0.5 xs:mt-0'>
        {loading ? (
          <Loading className='mt-5' />
        ) : !data ? (
          <Error message='Something went wrong' />
        ) : (
          <>
            <AnimatePresence mode='popLayout'>
              {data.map((tweet) => (
                <Tweet {...tweet} key={tweet.id} />
              ))}
            </AnimatePresence>
            <LoadMore />
          </>
        )}
      </section>*/}
    </MainContainer>
  );
}

Chats.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      {page}
      <Aside>
        <Suggestions />
      </Aside>
      
    </MainLayout>
  </ProtectedLayout>
);
