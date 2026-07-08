import { HiCheck, HiOutlineSparkles } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const PackageCard = ({ plan, onSelect, isLoading }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (plan.isFree) {
      navigate('/schedules/day');
      return;
    }
    if (plan.name?.toLowerCase() === 'cơ bản') {
      navigate('/schedules/day');
      return;
    }

    onSelect(plan);
  };

  const parsePrice = priceString => {
    if (!priceString) return 0;
    return parseInt(priceString.replace(/[^0-9]/g, ''), 10);
  };

  const originalPrice = parsePrice(plan.originalPrice);
  const currentPrice = parsePrice(plan.price);
  const discountPercent =
    originalPrice > 0 && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border border-neutral-900 bg-white
        p-6 sm:p-7 md:p-8
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        ${plan.highlight ? 'md:ring-2 md:ring-neutral-900 md:ring-offset-2 md:ring-offset-background' : ''}
        ${plan.isFree ? 'border-dashed border-neutral-400 bg-neutral-50/60' : ''}
      `}
    >
      {plan.highlight && (
        <div
          className='absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full
          bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs'
        >
          <HiOutlineSparkles className='h-3.5 w-3.5' />
          Phổ biến
        </div>
      )}

      {plan.isFree && (
        <div
          className='absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full
          bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs whitespace-nowrap'
        >
          Miễn phí
        </div>
      )}

      <div className='mb-6 md:mb-8'>
        <h3 className='text-lg font-black text-neutral-900 md:text-xl'>
          {plan.name}
        </h3>

        <p className='mt-1 text-xs text-neutral-600 sm:text-sm'>{plan.desc}</p>

        <div className='mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 md:mt-6'>
          <div className='flex items-baseline gap-1'>
            <span className='text-2xl font-black text-neutral-900 sm:text-3xl md:text-4xl'>
              {plan.price}
            </span>
            {plan.originalPrice && (
              <span className='text-base font-medium text-neutral-500 line-through sm:text-lg'>
                {plan.originalPrice}
              </span>
            )}
          </div>

          {discountPercent > 0 && (
            <div className='rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-600'>
              -{discountPercent}%
            </div>
          )}

          {plan.period && (
            <span className='text-xs font-medium text-neutral-600 sm:text-sm'>
              {plan.period}
            </span>
          )}
        </div>

        {plan.tokenInfo && (
          <div className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1'>
            <span className='text-[10px] font-bold text-emerald-700'>🪙 {plan.tokenInfo}</span>
          </div>
        )}
      </div>

      <ul className='mb-6 flex-1 space-y-3 md:mb-8 md:space-y-4'>
        {plan.features.map(f => (
          <li
            key={f}
            className='flex items-start gap-2 text-xs font-medium text-neutral-800 sm:text-sm md:gap-3'
          >
            <div className='mt-0.5 shrink-0 text-emerald-700'>
              <HiCheck strokeWidth={3} className='h-4 w-4 sm:h-5 sm:w-5' />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <button
        type='button'
        onClick={handleClick}
        disabled={isLoading && plan.amount > 0}
        className={`w-full rounded-xl py-3 text-sm font-black transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 md:rounded-2xl md:py-4 md:text-base ${plan.isFree
            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-300'
            : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
          }`}
      >
        {plan.amount > 0 && isLoading
          ? 'Đang chuyển đến PayOS...'
          : 'Bắt đầu ngay'}
      </button>
    </div>
  );
};

export default PackageCard;
