import { HiCheck } from 'react-icons/hi2';
import { useNavigate } from 'react-router';

const THEME_COLORS = {
  emerald: {
    border: 'border-emerald-600',
    ring: 'md:ring-2 md:ring-emerald-600 md:ring-offset-2 md:ring-offset-background',
    badge: 'bg-emerald-600',
    icon: 'text-emerald-600',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    text: 'text-emerald-700'
  },
  blue: {
    border: 'border-blue-600',
    ring: 'md:ring-2 md:ring-blue-600 md:ring-offset-2 md:ring-offset-background',
    badge: 'bg-blue-600',
    icon: 'text-blue-600',
    button: 'bg-blue-600 text-white hover:bg-blue-700',
    text: 'text-blue-700'
  },
  orange: {
    border: 'border-orange-500',
    ring: 'md:ring-2 md:ring-orange-500 md:ring-offset-2 md:ring-offset-background',
    badge: 'bg-orange-500',
    icon: 'text-orange-500',
    button: 'bg-orange-500 text-white hover:bg-orange-600',
    text: 'text-orange-600'
  }
};

const PackageCard = ({ plan, onSelect, isLoading }) => {
  const navigate = useNavigate();
  const theme = THEME_COLORS[plan.colorTheme] || THEME_COLORS.emerald;

  const handleClick = () => {
    onSelect(plan);
  };

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border ${theme.border} bg-white
        p-6 sm:p-7 md:p-8
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        ${theme.ring}
      `}
    >
      {plan.badge && (
        <div
          className={`absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full
          ${theme.badge} px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs whitespace-nowrap`}
        >
          {plan.badge}
        </div>
      )}

      <div className='mb-6 md:mb-8'>
        <h3 className={`text-lg font-black ${theme.text} md:text-xl`}>
          {plan.name}
        </h3>

        <p className='mt-1 text-xs text-neutral-600 sm:text-sm'>{plan.desc}</p>

        <div className='mt-4 flex items-baseline gap-1 md:mt-6'>
          <span className='text-2xl font-black text-neutral-900 sm:text-3xl md:text-4xl'>
            {plan.price}
          </span>

          {plan.period && (
            <span className='text-xs font-medium text-neutral-600 sm:text-sm'>
              {plan.period}
            </span>
          )}
        </div>
      </div>

      <ul className='mb-6 flex-1 space-y-3 md:mb-8 md:space-y-4'>
        {plan.features.map(f => (
          <li
            key={f}
            className='flex items-start gap-2 text-xs font-medium text-neutral-800 sm:text-sm md:gap-3'
          >
            <div className={`mt-0.5 shrink-0 ${theme.icon}`}>
              <HiCheck strokeWidth={3} className='h-4 w-4 sm:h-5 sm:w-5' />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <button
        type='button'
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full rounded-xl ${theme.button} py-3 text-sm font-black transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 md:rounded-2xl md:py-4 md:text-base`}
      >
        {isLoading ? 'Đang xử lý...' : 'Bắt đầu ngay'}
      </button>
    </div>
  );
};

export default PackageCard;