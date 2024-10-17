import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useUser } from '@lib/context/user-context';
import { SEO } from '@components/common/seo';
import { UserHomeCover } from '@components/user/user-home-cover';
import { UserHomeAvatar } from '@components/user/user-home-avatar';
import { UserDetails } from '@components/user/user-details';
import { UserNav } from '@components/user/user-nav';
import { Button } from '@components/ui/button';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { FollowButton } from '@components/ui/follow-button';
import { variants } from '@components/user/user-header';
import { UserEditProfile } from '@components/user/user-edit-profile';
import { UserShare } from '@components/user/user-share';
import type { LayoutProps } from './common-layout';
import { ViewChat } from '@components/view/view-chat';

export function ChatHomeLayout({ children }: LayoutProps): JSX.Element {
    const { user, isAdmin } = useAuth();
    const { user: userData, loading } = useUser();
  
    const { query: { id } } = useRouter();
  
    const coverData = userData?.coverPhotoURL
      ? { src: userData.coverPhotoURL, alt: userData.name }
      : null;
  
    const profileData = userData
      ? { src: userData.photoURL, alt: userData.name }
      : null;
  
    const { id: userId } = user ?? {};
  
    const isOwner = userData && userData.id === userId;
  
    if (loading || !userData) {
      // Render loading or fallback UI until `userData` is available
      return <Loading className='mt-5' />;
    }
  
    return (
      <>
        <SEO
          title={`${`${userData.name} (@${userData.username})`}`}
        />
        <motion.section {...variants} exit={undefined}>
          {!userData ? (
            <div className='flex flex-col gap-8'>
              <div className='relative flex flex-col gap-3 px-4 py-3'>
                <UserHomeAvatar />
                <p className='text-xl font-bold'>@{id}</p>
              </div>
              <div className='p-8 text-center'>
                <p className='text-3xl font-bold'>This account doesn’t exist</p>
                <p className='text-light-secondary dark:text-dark-secondary'>
                  Try searching for another.
                </p>
              </div>
            </div>
          ) : (
            <ViewChat />
          )}
        </motion.section>
      </>
    );
  }
  