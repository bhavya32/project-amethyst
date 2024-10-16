import { useWindow } from '@lib/context/window-context';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import { tweetsCollection } from '@lib/firebase/collections';
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
import type { ReactElement, ReactNode } from 'react';
import { Aside } from '@components/aside/aside';
import { Suggestions } from '@components/aside/suggestions';

import { usersCollection } from '@lib/firebase/collections';
import { useCollection } from '@lib/hooks/useCollection';
import {
  doc,
  limit,
  query,
  where,
  orderBy,
  documentId
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

type FollowType = 'following' | 'followers';

type CombinedTypes = StatsType | FollowType;


export default function Home(): JSX.Element {
  const { isMobile } = useWindow();

  const { data, loading, LoadMore } = useInfiniteScroll(
    tweetsCollection,
    [where('parent', '==', null), orderBy('createdAt', 'desc')],
    { includeUser: true, allowNull: true, preserve: true }
  );
  const { data: chatList, loading: chatsLoading } = useCollection(
    query(
      usersCollection,
      orderBy(documentId()),
    ),
    { allowNull: true }
  );
  const noStatsData = {
    title: 'Looking for followers?',
    imageData: { src: '/assets/no-followers.png', alt: 'No followers' },
    description:
      'When someone follows this account, they’ll show up here. Tweeting and interacting with others helps boost followers.'
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
        loading && 'flex items-center justify-center'
      )}
    >
      {loading ? (
        <Loading className={'mt-5'} />
      ) : (
        <AnimatePresence mode='popLayout'>
          {data?.length ? (
            data.map((userData) => (
              <motion.div layout='position' key={userData.id} {...variants}>
                {/* <UserCard {...userData} follow={follow} modal={modal} /> */}
                <Link href={`/chats/${userData.user.username}`}>
                    <a
                      className='accent-tab hover-animation grid grid-cols-[auto,1fr] gap-3 px-4
                                py-3 hover:bg-light-primary/5 dark:hover:bg-dark-primary/5'
                    >
                     <UserTooltip avatar {...userData.user} modal={false}>
                      <UserAvatar src={userData.user.photoURL} alt={userData.user.name} username={userData.user.username} />
                    </UserTooltip> 
                      <div className='flex flex-col gap-1 truncate xs:overflow-visible'>
                        <div className='flex items-center justify-between gap-2 truncate xs:overflow-visible'>
                          <div className='flex flex-col justify-center truncate xs:overflow-visible xs:whitespace-normal'>
                          <UserTooltip {...userData.user} modal={false}>
                            <UserName
                              className='-mb-1'
                              name={userData.user.name}
                              username={userData.user.username}
                              verified={userData.user.verified}
                            />
                          </UserTooltip>
                            <div className='flex items-center gap-1 text-light-secondary dark:text-dark-secondary'>
                              
                            <UserTooltip {...userData.user} modal={false}>
                              <UserUsername username={userData.user.username} />
                            </UserTooltip>
                            
                            </div>
                          </div>
                          
                        </div>
                        
                      </div>
                    </a>
                  </Link>
              </motion.div>
            ))
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

Home.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      {page}
      <Aside>
        <Suggestions />
      </Aside>
      
    </MainLayout>
  </ProtectedLayout>
);
