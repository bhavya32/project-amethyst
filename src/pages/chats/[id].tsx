import { doc, query, where } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@lib/context/user-context';
import { useCollection } from '@lib/hooks/useCollection';
import { useDocument } from '@lib/hooks/useDocument';
import { tweetsCollection } from '@lib/firebase/collections';
import { mergeData } from '@lib/merge';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { Loading } from '@components/ui/loading';
import { Tweet } from '@components/tweet/tweet';
import type { ReactElement, ReactNode } from 'react';
import { ChatHomeLayout } from '@components/layout/chat-home-layout';

export default function UserChats(): JSX.Element {
  const { user } = useUser();
  //console.log('user', user);
  const { id, username, pinnedTweet } = user ?? {};

  const chatLoading=false
  return (
    <div>
        <h3>hi</h3>
        <div className='mt-4'> {/* Add margin-top to ensure spacing */}
        <input
          className='peer flex-1 bg-transparent outline-none 
                     placeholder:text-light-secondary dark:placeholder:text-dark-secondary 
                     border border-gray-300 p-2 rounded-md'
          type='text'
          placeholder='Enter Message'
        />
      </div>
      {chatLoading ? (
        <Loading className='mt-5' />
      ) : (<></>)}
      
    </div>
  );
}

UserChats.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
        <ChatHomeLayout>{page}</ChatHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
