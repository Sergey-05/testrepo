'use client';

import Image from 'next/image';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useWebApp } from '@/app/lib/hooks/useWebApp';

export function Banner() {
  const { appConfig } = useGlobalStore();
  const WebApp = useWebApp();
  return (
    <div className='relative my-4 flex items-center justify-between border-y border-white/20 text-white'>
      <div className='p-2'>
        <p className='text-[12px] font-medium'>
          Как пополнить депозит с помощью банковской карты
        </p>
        <button
          onClick={() =>
            WebApp && appConfig.manager_link
              ? WebApp.openTelegramLink(appConfig.manager_link)
              : null
          }
          className='text-[10px] text-purple-400 outline-none'
        >
          Узнать →
        </button>
      </div>
      <Image
        src='/cards-right.png'
        alt='Card'
        width={80}
        height={80}
        className='rotate-[-45deg] transform'
      />
    </div>
  );
}
