import {
  HiOutlineCamera,
  HiOutlineChartBar,
  HiOutlineShoppingBag
} from 'react-icons/hi2';

const Feature = ({ icon, title, desc }) => (
  <div className='group rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] sm:p-7'>
    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-lg text-neutral-700 transition-transform duration-200 group-hover:scale-[1.02] md:h-12 md:w-12 md:text-xl'>
      {icon}
    </div>

    <div className='mt-5 space-y-2'>
      <h3 className='text-base font-bold tracking-tight text-neutral-900 sm:text-lg'>
        {title}
      </h3>

      <p className='text-sm leading-6 text-neutral-600'>{desc}</p>
    </div>
  </div>
);

const Features = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:pb-14 lg:px-8'>
      <div className='rounded-[22px] bg-[#eceff1] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14'>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-900 sm:text-xs'>
            Tính năng thông minh
          </p>

          <h2 className='mt-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl'>
            Cải thiện chế độ ăn của bạn
          </h2>

          <p className='mt-4 text-sm leading-7 text-neutral-600 sm:text-base'>
            Trợ lí bữa ăn MealMeat giúp việc lựa chọn bữa ăn dễ dàng hơn bao giờ
            hết.
          </p>
        </div>

        <div className='mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 md:mt-12 md:grid-cols-3 md:gap-6'>
          <Feature
            icon={<HiOutlineCamera />}
            title='Cá nhân hoá'
            desc='Thiết kế thực đơn riêng biệt dựa trên chỉ số cơ thể và mục tiêu sức khỏe của bạn.'
          />

          <Feature
            icon={<HiOutlineShoppingBag />}
            title='Đa dạng món ăn'
            desc='Thư viện hàng ngàn món ăn dinh dưỡng, từ món truyền thống đến các chế độ ăn đặc biệt.'
          />

          <Feature
            icon={<HiOutlineChartBar />}
            title='Mạng lưới sức khỏe'
            desc='Kết nối với các chuyên gia và hệ thống phòng gym đối tác trên toàn quốc.'
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
