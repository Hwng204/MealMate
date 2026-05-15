import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { NavLink } from 'react-router';

import { useIsMobile } from '~/hooks/use-mobile';
import { cn } from '~/lib/utils';

const HeaderNav = ({ links }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const isMobile = useIsMobile();

  const toggleMenu = label => {
    setOpenMenu(prev => (prev === label ? null : label));
  };

  return (
    <nav className='flex flex-col md:flex-row md:items-center gap-2'>
      {links.map(link => {
        if (link.children) {
          if (isMobile) {
            return (
              <div key={link.label} className='flex flex-col'>
                <span className='px-4 py-2 font-semibold text-white/80'>
                  {link.label}
                </span>

                {link.children.map(child => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className='ml-4 rounded-lg px-4 py-2 text-sm text-white hover:bg-white/10'
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            );
          }

          const isOpen = openMenu === link.label;

          return (
            <div key={link.label} className='relative'>
              <button
                onClick={() => toggleMenu(link.label)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium',
                  'hover:bg-white/10 hover:text-white',
                  isOpen
                    ? 'bg-[#e8f1e4] text-neutral-900'
                    : 'text-white'
                )}
              >
                {link.label}
                <HiChevronDown
                  className={cn(
                    'text-sm transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              {isOpen && (
                <div className='absolute left-0 top-full mt-2 bg-background border rounded-xl shadow-lg p-2 min-w-[180px]'>
                  {link.children.map(child => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={() => setOpenMenu(null)}
                      className='block rounded-lg px-3 py-2 text-sm hover:bg-accent'
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'rounded-full px-4 py-2 text-sm font-medium',
                'hover:bg-white/10 hover:text-white',
                isActive
                  ? 'bg-[#e8f1e4] text-neutral-900'
                  : 'text-white'
              )
            }
          >
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
