'use client';

import { House, Newspaper, Users, Banknote, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { name: 'Главная', href: '/', icon: House },
    { name: 'Кабинет', href: '/cabinet', icon: DollarSign },
    { name: 'Кошелек', href: '/wallet', icon: Banknote },
    { name: 'Друзья', href: '/partners', icon: Users },
    { name: 'Обучение', href: '/learning', icon: Newspaper },
  ];

  const hideOnPages = ['/learning', '/wallet', '/partners', '/', '/cabinet'];
  if (!hideOnPages.includes(pathname)) return null;

  return (
    <nav className='fixed bottom-0 left-0 z-50 w-full border-t border-gray-600/50 bg-black pb-3'>
      <div className='flex w-full items-end justify-between px-2 py-1'>
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          const isCenter = index === 2;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'relative flex w-12 flex-col items-center justify-center xs:w-14 sm:w-16',
                isCenter ? '' : 'pt-2',
              )}
            >
              <div className='flex flex-col items-center'>
                {isCenter ? (
                  <div className='flex-col items-center'>
                    <div
                      className={clsx(
                        'absolute left-1/2 top-[-48px] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gray-600 p-1',
                        isActive ? 'bg-purple-900 text-white' : 'text-gray-500',
                      )}
                    >
                      <Icon
                        className={clsx(
                          'h-6 w-6',
                          isActive ? 'text-white' : 'text-black',
                        )}
                      />
                    </div>
                    <p
                      className={clsx(
                        'mt-2 text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px]',
                        isActive ? 'text-purple-900' : 'text-gray-500',
                      )}
                    >
                      {link.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Icon
                      className={clsx(
                        'h-4 w-4',
                        isActive ? 'text-purple-900' : 'text-gray-500',
                      )}
                    />
                    <p
                      className={clsx(
                        'mt-1 text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px]',
                        isActive ? 'text-purple-900' : 'text-gray-500',
                      )}
                    >
                      {link.name}
                    </p>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
