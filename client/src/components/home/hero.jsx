import {
  HiOutlineArrowRight,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

const Hero = () => {
  const user = useSelector(state => state.auth.user);
  return (
    <section className='relative bg-background overflow-hidden'>
      <div className='relative left-1/2 w-screen max-w-none -translate-x-1/2'>
        <img
          src="/banner.png"
          alt="MealMeat Banner"
          className='h-[220px] w-full object-cover object-center sm:h-[300px] md:h-[380px] lg:h-[420px]'
        />
      </div>
      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16 grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-center'>
        <div className='relative order-1'>
          <img
            src='/food.jpg'
            alt='MealMeat Healthy Meal'
            className='relative z-10 w-full h-auto max-h-[min(520px,55vh)] object-cover rounded-3xl md:rounded-[2rem] shadow-xl shadow-black/10 border border-black/[0.06]'
          />
        </div>

        <div className='relative z-10 order-2'>
          <div className='inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm'>
            <HiOutlineSparkles className='text-base' />
            Cá nhân hoá bằng AI
          </div>

          <h1 className='mt-5 text-3xl font-black leading-[1.12] tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-[3.25rem]'>
            Trợ lí AI bữa ăn
            <br />
            Đồng hành cùng bạn
          </h1>

          <p className='mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg'>
            MealMeat gợi ý thực đơn phù hợp mục tiêu của bạn, theo dõi dinh dưỡng
            trực quan và giúp duy trì thói quen ăn uống lành mạnh mỗi ngày.
          </p>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4'>
            <Link
              to={user ? '/schedules/day' : '/auth/login'}
              className='group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#f5812a] px-6 text-sm font-bold text-white shadow-md shadow-orange-900/10 transition-all duration-200 hover:brightness-105 sm:h-14 sm:px-8 sm:text-base'
            >
              Bắt đầu miễn phí
              <HiOutlineArrowRight className='text-lg transition-transform duration-200 group-hover:translate-x-1' />
            </Link>

            <a
              href='https://www.youtube.com/watch?v=7uLCm3g_CLM'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-6 text-sm font-bold text-emerald-900 shadow-sm transition-colors duration-200 hover:bg-neutral-50 sm:h-14 sm:px-8 sm:text-base'
            >
              Xem cách hoạt động
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
