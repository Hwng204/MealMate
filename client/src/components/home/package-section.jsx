import PackagesGrid from '~/features/payment/create-payment/components/packages-grid';

const PackagesSection = () => {
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
