import { FiLock } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';

import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { isExpertMembership } from '~/constants/membership-level';

const NutritionistProtectedRoute = ({ children }) => {
  const { user, loading, loggingOut } = useSelector(state => state.auth);
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && user?.role === 'Nutritionist') {
      if (!isExpertMembership(profile.membershipLevel)) {
        navigate('/#packages', { replace: true });
      }
    }
  }, [profile, user, navigate]);

  if (loggingOut) {
    return null;
  }

  if (loading || profileLoading) {
    return <Spinner size='lg' />;
  }

  if (!user) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center px-4 py-10 transition-colors duration-300'>
        <div className='w-full max-w-md border border-border bg-card p-10 text-center shadow-2xl shadow-primary/10 backdrop-blur-sm dark:shadow-none'>
          <div className='relative mx-auto mb-8 flex h-24 w-24 items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-primary/20 blur-3xl opacity-60 animate-pulse' />
            <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 shadow-sm'>
              <FiLock className='text-4xl text-primary' />
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
              Bạn chưa đăng nhập
            </h2>
            <p className='text-sm leading-relaxed text-muted-foreground sm:text-base'>
              Vui lòng đăng nhập để tiếp tục truy cập trang này.
            </p>
          </div>

          <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              asChild
              className='h-12 rounded-2xl bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95'
            >
              <Link to='/auth/login' className='font-semibold'>
                Đăng nhập
              </Link>
            </Button>

            <Button
              variant='outline'
              asChild
              className='h-12 rounded-2xl border-border bg-transparent px-8 text-foreground transition-all hover:bg-secondary'
            >
              <Link to='/' className='font-medium'>
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'Nutritionist') {
    return null;
  }

  if (!isExpertMembership(profile?.membershipLevel)) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center px-4 py-10 transition-colors duration-300'>
        <div className='w-full max-w-md border border-border bg-card p-10 text-center shadow-2xl shadow-primary/10 backdrop-blur-sm dark:shadow-none'>
          <div className='relative mx-auto mb-8 flex h-24 w-24 items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-primary/20 blur-3xl opacity-60 animate-pulse' />
            <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 shadow-sm'>
              <FiLock className='text-4xl text-primary' />
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
              Cần mua gói chuyên gia
            </h2>
            <p className='text-sm leading-relaxed text-muted-foreground sm:text-base'>
              Bạn cần mua gói chuyên gia để sử dụng chức năng quản lý lớp học.
            </p>
          </div>

          <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              asChild
              className='h-12 rounded-2xl bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95'
            >
              <Link to='/#packages' className='font-semibold'>
                Xem các gói
              </Link>
            </Button>

            <Button
              variant='outline'
              asChild
              className='h-12 rounded-2xl border-border bg-transparent px-8 text-foreground transition-all hover:bg-secondary'
            >
              <Link to='/' className='font-medium'>
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default NutritionistProtectedRoute;