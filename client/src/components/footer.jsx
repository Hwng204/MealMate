import { Mail } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className='mt-auto w-full bg-[#a9c894] text-neutral-900'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3'>

          <div className='flex flex-col items-start space-y-4'>
            <Link to='/' className='inline-flex items-center'>
              <div className='flex h-16 w-32 items-center justify-center rounded-xl bg-white/30 p-2'>
                <img
                  src='/logo.png'
                  alt='Logo'
                  className='h-full w-full object-contain'
                />
              </div>
            </Link>
            <p className='max-w-xs text-sm leading-relaxed text-neutral-800/90'>
              Nền tảng gợi ý bữa ăn và dinh dưỡng thông minh, đồng hành cùng bạn
              xây dựng lối sống khỏe bền vững.
            </p>
          </div>

          <div className='lg:flex lg:flex-col lg:items-center'>
            <div>
              <h3 className='text-sm font-black uppercase tracking-wide text-neutral-900'>
                Khám phá
              </h3>
              <ul className='mt-4 space-y-2.5 text-sm font-medium text-neutral-900/85'>
                <li>
                  <Link to='/exercises' className='hover:underline decoration-neutral-900/30 underline-offset-4 transition'>
                    Tập luyện
                  </Link>
                </li>
                <li>
                  <Link to='/dishes' className='hover:underline decoration-neutral-900/30 underline-offset-4 transition'>
                    Thực đơn dinh dưỡng
                  </Link>
                </li>
                <li>
                  <Link to='/posts' className='hover:underline decoration-neutral-900/30 underline-offset-4 transition'>
                    Blog sức khỏe
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col space-y-5 lg:items-end'>
            <div className='lg:text-right'>
              <h3 className='text-sm font-black uppercase tracking-wide text-neutral-900'>
                Liên hệ với chúng tôi
              </h3>
              <a
                href='mailto:mealmatemanagement@gmail.com'
                className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:opacity-70 transition'
              >
                <Mail className='h-4 w-4 shrink-0' />
                mealmatemanagement@gmail.com
              </a>
            </div>

            <div className='flex gap-3'>
              <a
                href='https://www.facebook.com/mealmatemanagement'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Facebook'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-neutral-900 transition hover:bg-white/50 hover:scale-110'
              >
                <FaFacebookF className='h-4 w-4' />
              </a>
              <a
                href='#'
                aria-label='Instagram'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-neutral-900 transition hover:bg-white/50 hover:scale-110'
              >
                <FaInstagram className='h-5 w-5' />
              </a>
              <a
                href='#'
                aria-label='YouTube'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-neutral-900 transition hover:bg-white/50 hover:scale-110'
              >
                <FaYoutube className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>

        <div className='mt-12 border-t border-neutral-900/10 pt-8'>
          <p className='text-center text-xs font-medium text-neutral-800/60'>
            © {new Date().getFullYear()} MealMate. Đồng hành cùng sức khỏe Việt.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;