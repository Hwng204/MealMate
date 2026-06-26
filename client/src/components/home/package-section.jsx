import { useSelector } from 'react-redux';
import { MEMBERSHIP_LEVEL } from '~/constants/membership-level';
import PackagesGrid from '~/features/payment/create-payment/components/packages-grid';

const PackagesSection = () => {
  const user = useSelector(state => state.auth.user);
  const isUpgraded =
    user &&
    user.membershipLevel &&
    user.membershipLevel !== MEMBERSHIP_LEVEL.NORMAL;

  if (isUpgraded) return null;

  return (
    <section
      id='packages'
      className='mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-background'
    >
      <PackagesGrid />
    </section>
  );
};

export default PackagesSection;
