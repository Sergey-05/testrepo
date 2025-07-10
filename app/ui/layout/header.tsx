'use client';

import { MessageSquareText, Gift, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWebApp } from '../../lib/hooks/useWebApp';
import Image from 'next/image';
import { IconButton } from '@mui/material';
import useGlobalStore from '@/app/store/useGlobalStore';
import { Drawer } from 'vaul';

export default function HeaderMain() {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);

  const { appConfig } = useGlobalStore();

  const WebApp = useWebApp();

  useEffect(() => {
    const loadAvatar = async () => {
      if (
        typeof window !== 'undefined' &&
        WebApp &&
        WebApp.initDataUnsafe.user
      ) {
        const photoUrl = WebApp.initDataUnsafe.user.photo_url;
        const userFirstName = WebApp.initDataUnsafe.user.first_name;
        const storedPhotoUrl = localStorage.getItem('avatar_photo_url');

        if (
          photoUrl &&
          photoUrl.startsWith('https://t.me/') &&
          photoUrl !== storedPhotoUrl
        ) {
          try {
            const response = await fetch(
              `/api/avatar/proxy?photoUrl=${encodeURIComponent(photoUrl)}`,
            );
            if (!response.ok) throw new Error('Не удалось загрузить аватар');
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              setAvatarUrl(base64String);
              localStorage.setItem('avatar_base64', base64String);
              localStorage.setItem('avatar_photo_url', photoUrl);
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            console.error('Ошибка загрузки аватара:', err);
            setAvatarUrl(localStorage.getItem('avatar_base64') || undefined);
          }
        } else {
          setAvatarUrl(localStorage.getItem('avatar_base64') || undefined);
        }

        setFirstName(userFirstName || 'User');
      } else {
        setAvatarUrl(undefined);
        setFirstName('User');
      }
    };

    loadAvatar();
  }, [WebApp]);

  return (
    <header className='glass fixed relative left-0 top-0 z-50 flex w-full items-center justify-between px-3 py-4 backdrop-blur-md'>
      {/* Левая часть — аватар и имя, ширина ограничена */}
      <div className='flex w-[35%] max-w-[140px] items-center space-x-2 overflow-hidden'>
        <div className='relative h-9 w-9 shrink-0'>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt='avatar'
              fill
              className='rounded-full border border-white/10 object-cover'
              sizes='36px'
              onError={() => setAvatarUrl(undefined)}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-black'>
              <User className='text-base text-white' />
            </div>
          )}
        </div>
        <span className='overflow-hidden truncate whitespace-nowrap text-sm font-light text-white'>
          {firstName || 'User'}
        </span>
      </div>

      {/* Центр — логотип, всегда по центру вне зависимости от остального */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          x='0'
          y='0'
          baseProfile='basic'
          version='1.1'
          viewBox='0 0 1920 1080'
          className='w-50 h-12'
        >
          <path
            d='M1526.3 609.4h99.9c1.4 19 15 25.7 30.7 29.1 27 5.9 54.2 5.7 81.3.5 4.6-.9 9.3-2.8 13.3-5.3 10.6-6.7 9.9-20.4-1.7-24.7-10.5-3.9-21.7-6-32.8-7.9-36.9-6.3-73.9-11.6-110.8-18.4-11.8-2.2-23.3-6.9-34.4-11.7-23.2-10.1-36.1-28.2-38.6-53.4-1.5-15.2-1.1-30.3 4.6-44.8 7.8-20 22.8-32.8 41.6-41.7 19.8-9.4 41-13.6 62.6-15.9 29.9-3.1 59.9-3.3 89.8 0 26 2.8 51.3 8.3 74 22.1 22.4 13.6 35.2 33.4 37.7 59.7.2 2.5 0 4.9 0 7.8h-97.1c-1.8-16.7-14.4-21.7-28.1-24.3-23.6-4.6-47.4-4.3-71 .6-4 .8-8 2.4-11.5 4.5-11 6.7-11 20.4.5 26 7.8 3.7 16.6 6.2 25.2 7.4 24.4 3.3 49 5.4 73.4 8.3 26.3 3 52.7 5.7 77.8 14.8 6.2 2.3 12.3 5.1 18.1 8.4 19.9 11.7 29.5 29.9 30.6 52.4.5 10.7-.2 21.8-2.5 32.2-5.7 25.8-23 42.1-46.2 52.9-22.2 10.3-45.9 14.6-70 17-28.2 2.8-56.6 3.1-84.9 1-30.4-2.2-60.2-7.1-87.5-21.9-26.9-14.6-42.1-37-44.3-67.9.2-2.2.3-4.4.3-6.8M1184.1 418.2h95.9v5.8c0 51.3-.2 102.7.3 154 .1 10.2 1.6 20.6 3.9 30.6 4.2 17.7 15.7 28.6 33.8 31.8 16.4 2.9 32.9 3.1 49.2-.5 19.2-4.2 30.7-17.9 33.8-40.3 1.3-9.2 1.9-18.6 2-27.9.2-49.2.1-98.3.1-147.5v-5.8h95.9v165.5c0 15.9-1.7 31.6-6.3 46.9-11.2 37.2-37.1 58.9-73.8 67.9-16.9 4.1-34.4 6.5-51.7 7.6-31.8 2-63.6 1.6-95-5.4-21.5-4.7-41.3-12.9-57.3-28.6-19.4-19.2-27.3-43.4-29.6-69.7-.9-10.4-1-21-1-31.4-.1-48.8 0-97.7 0-146.5-.2-2.1-.2-4.1-.2-6.5M522.2 483.7v-65.5c1.6-.1 3.2-.2 4.8-.2 67.5 0 135 0 202.4.2 20.5.1 40.5 3.5 59.2 12.1 32.1 14.7 48.5 40.4 51.1 75.2 1.2 16.1-.3 31.9-5.9 47.2-10.3 28-31.7 43.6-59 52.2-18.2 5.7-37.1 8-56.1 8.1-31.5.1-63 .1-94.5.1h-6v87.7h-95.7V548.4h6.1c56.1 0 112.3.1 168.4-.1 7.6 0 15.4-.5 22.7-2.4 20.2-5.1 30-30.2 19.3-48.2-4.8-8-12.6-11.3-21.2-12.5-6.9-1-13.9-1.3-20.9-1.4-56-.1-112-.1-167.9-.1zM872.5 418.1h95.4v217.7h183.3v64.8H872.6c-.1-93.9-.1-187.9-.1-282.5M316 628c1.3-2.1 2.4-4.3 3.9-6.3 19.1-25.6 38.3-51.2 57.5-76.8 1.1-1.5 2.1-3 3.7-5.2H251.9V412.9c-.4-.1-.7-.3-1.1-.4-20.8 27.7-41.6 55.4-63.2 84.1V367.5c1.5-.1 2.8-.3 4.1-.3 40 0 80 .1 120-.1 4.1 0 5.2 1.5 5.2 5.2 0 39.7 0 79.3-.1 119 0 1.5-.1 2.9-.3 5.1h127.9V626h-5.6c-38.3 0-76.7 0-115 .1-2.5 0-5.1 1.2-7.8 1.9'
            fill='#fff'
          />
          <path
            d='M316 628c.2 1.3.5 2.6.5 3.9v119.5c0 1.1-.2 2.3-.3 3.8-1.6.1-3 .3-4.5.3-39.5 0-79-.1-118.5.1-4.9 0-5.7-1.6-5.7-6 .1-39.2 0-78.3.2-117.5 0-5-1.2-6.5-6.4-6.5-39 .2-78 .1-117 .1h-5.8V497.2H187c-21.4 28.5-42.4 56.5-64.1 85.4h128.9v128.2c.3.1.6.2 1 .3 6.3-8.3 12.5-16.7 18.8-25 13.8-18.4 27.5-36.8 41.3-55.2.9-1 2.1-1.9 3.1-2.9'
            fill='#fff'
          />
        </svg>
      </div>

      <div className='flex w-[35%] max-w-[140px] items-center justify-end space-x-1'>
        <Drawer.Root repositionInputs={false}>
          <Drawer.Trigger asChild>
            <IconButton
              sx={{
                color: '#fff',
                padding: '6px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Gift className='stroke-[0.9]' />
            </IconButton>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
            <Drawer.Content
              aria-describedby={undefined}
              className='fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col rounded-t-3xl bg-zinc-950 p-6 text-white'
            >
              <Drawer.Close
                className='absolute right-4 top-4 text-gray-400 hover:text-white active:scale-95'
                aria-label='Закрыть'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  className='h-6 w-6'
                >
                  <path
                    fill='currentColor'
                    d='M18 6L6 18M6 6l12 12'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </Drawer.Close>

              <Drawer.Title className='mb-6 select-none text-center text-xl font-extrabold tracking-wide text-purple-400'>
                Бонусная система — простой и прозрачный путь к доходу
              </Drawer.Title>

              <div className='flex-1 select-text overflow-y-auto text-base leading-relaxed text-gray-300'>
                <p className='mb-5'>
                  Мы создали для вас продуманную систему бонусов, которая даёт
                  возможность не просто пополнять счёт, а получать стабильный
                  пассивный доход от активности ваших партнёров и собственной
                  вовлечённости.
                </p>
                <p className='mb-5'>
                  Первый бонус — 1000 рублей на вклад, когда приглашённый вами
                  человек делает пополнение от 5000 ₽. Эти деньги сразу начинают
                  приносить доход, увеличивая ваш капитал.
                </p>
                <p className='mb-5'>
                  Кроме того, вы получаете 12% от каждого пополнения ваших
                  партнёров. Бонусы автоматически поступают на ваш кошелёк и
                  доступны к выводу без задержек и ограничений.
                </p>
                <p className='mb-5'>
                  Мы регулярно проводим акции с дополнительными бонусами при
                  пополнении на определённые суммы. Следите за новостями, чтобы
                  не пропустить выгодные предложения и увеличить свой доход ещё
                  быстрее.
                </p>
                <p className='mt-auto select-none text-sm text-gray-500'>
                  Все начисления проходят автоматически. В личном кабинете вы
                  всегда можете отследить статус партнёров и полученные бонусы.
                  Подключайте новых пользователей и увеличивайте свои доходы с
                  каждым днём.
                </p>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        <IconButton
          sx={{
            color: '#fff',
            padding: '6px',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
          onClick={() =>
            WebApp && appConfig.manager_link
              ? WebApp.openTelegramLink(appConfig.manager_link)
              : null
          }
        >
          <MessageSquareText className='stroke-[0.9]' />
        </IconButton>
      </div>
    </header>
  );
}
