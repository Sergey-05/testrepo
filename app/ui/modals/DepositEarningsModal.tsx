'use client';

import { useState, useMemo, useEffect } from 'react';
import { Drawer } from 'vaul';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useNotification } from '@/app/context/NotificContext';
import { saveAccum, updateAccum } from '@/app/lib/actions';
import { DepositEarning } from '@/app/lib/definition';
import Link from 'next/link';
import Image from 'next/image';
import { tariffs } from '@/app/lib/constants/tariffs';

export default function DepositEarningsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, depositEarnings, setUser, setDepositEarnings } =
    useGlobalStore();
  const { showNotification } = useNotification();
  const [isCollecting, setIsCollecting] = useState(false);

  // Найти текущий тариф
  const currentTariff = useMemo(() => {
    return (
      tariffs
        .filter((t) => (user?.deposit_amount || 0) >= (t.amountMin ?? 0))
        .sort((a, b) => b.rate - a.rate)[0] || null
    );
  }, [user]);

  // Расчет накоплений
  const accumulation = useMemo(() => {
    if (
      !depositEarnings ||
      !Array.isArray(depositEarnings) ||
      !user ||
      user.deposit_amount <= 0
    ) {
      return 0.0;
    }
    const total = depositEarnings
      .filter((earning: DepositEarning) => !earning?.last_collected_at)
      .reduce(
        (sum: number, earning: DepositEarning) =>
          sum + (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
        0,
      );
    return Number(total.toFixed(2));
  }, [depositEarnings, user]);

  // Проверка условий и начисление накоплений
  useEffect(() => {
    if (
      !user?.deposit_amount ||
      user.deposit_amount <= 250 ||
      !user.last_deposit_at ||
      !currentTariff
    ) {
      setIsOpen(false);
      return;
    }

    const checkAndSaveAccum = async () => {
      try {
        // Получение серверного времени
        const response = await fetch('/api/health');
        const serverTimeHeader = response.headers.get('Date');
        const serverTimeMs = serverTimeHeader
          ? new Date(serverTimeHeader).getTime()
          : new Date().getTime();

        // Проверка last_deposit_at
        if (!user.last_deposit_at) {
          setIsOpen(false);
          return;
        }
        const lastDepositTime = new Date(user.last_deposit_at).getTime();
        const timeDiff = serverTimeMs - lastDepositTime;
        const hasUncollectedEarnings = depositEarnings?.some(
          (earning: DepositEarning) => !earning.last_collected_at,
        );

        // Если накопления уже есть, показываем модальное окно
        if (hasUncollectedEarnings && accumulation > 0) {
          setIsOpen(true);
          return;
        }

        // Если прошло более 24 часов и нет накоплений, начисляем их
        if (timeDiff > 24 * 60 * 60 * 1000 && !hasUncollectedEarnings) {
          const updatedData = await saveAccum(
            user.telegram_id,
            user.deposit_amount * (currentTariff.rate / 100),
          );
          setUser(updatedData.user);
          setDepositEarnings(updatedData.depositEarnings);
          setIsOpen(true); // Открываем модальное окно после начисления
        } else {
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Ошибка при проверке или сохранении накоплений:', error);
        showNotification('Ошибка при загрузке данных', 'error');
        setIsOpen(false);
      }
    };

    checkAndSaveAccum();
  }, [
    user,
    currentTariff,
    accumulation,
    depositEarnings,
    setUser,
    setDepositEarnings,
    showNotification,
  ]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 bg-black/40' />
        <Drawer.Content className='fixed bottom-0 left-0 right-0 h-[50vh] rounded-t-xl bg-gradient-to-br from-black to-[#1e0631] text-white'>
          <div className='flex h-full flex-col p-4'>
            <div className='flex justify-end'>
              <button
                type='button'
                className='p-2'
                onClick={() => setIsOpen(false)}
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='#ffffff'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M6.32277 6.32277C6.75314 5.89241 7.4509 5.89241 7.88126 6.32277L11.9999 10.4414L16.1185 6.32277C16.5489 5.89241 17.2466 5.89241 17.677 6.32277C18.1074 6.75314 18.1074 7.4509 17.677 7.88126L13.5584 11.9999L17.677 16.1185C18.1074 16.5489 18.1074 17.2466 17.677 17.677C17.2466 18.1074 16.5489 18.1074 16.1185 17.677L11.9999 13.5584L7.88126 17.677C7.4509 18.1074 6.75314 18.1074 6.32277 17.677C5.89241 17.2466 5.89241 16.5489 6.32277 16.1185L10.4414 11.9999L6.32277 7.88126C5.89241 7.4509 5.89241 6.75314 6.32277 6.32277Z'
                    fill='currentColor'
                  />
                </svg>
              </button>
            </div>
            <div className='flex flex-1 flex-col items-center justify-center'>
              <div className='mb-4'>
                <Image
                  src='/coin-BqBBbrtn.webp'
                  alt='Coin'
                  width={64}
                  height={64}
                />
              </div>
              <div className='mb-4 text-center'>
                <p className='flex items-center justify-center gap-3 text-lg font-semibold'>
                  Ты заработал
                  <Image src='/Coin.webp' alt='Coin' width={24} height={24} />
                  {accumulation.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  ₽!
                </p>
              </div>
              <div className='mb-4 flex items-center gap-2'>
                <svg
                  width='17'
                  height='16'
                  viewBox='0 0 17 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M8.54492 16.0005C10.2543 16.0005 11.5971 16.0007 12.6455 15.8599C13.72 15.7154 14.5733 15.4135 15.2432 14.7437C15.913 14.0738 16.2149 13.2204 16.3594 12.146C16.5003 11.0976 16.5 9.75483 16.5 8.04541V7.95557C16.5 6.24615 16.5003 4.90338 16.3594 3.85498C16.2149 2.78052 15.913 1.92714 15.2432 1.25732C14.5733 0.587518 13.72 0.285574 12.6455 0.141113C11.5971 0.000219464 10.2543 0.000480801 8.54492 0.000488455L8.45508 0.000488455C6.74566 0.000480502 5.40287 0.000221431 4.35449 0.141113C3.28007 0.285574 2.42665 0.58752 1.75684 1.25732C1.08702 1.92714 0.785093 2.78052 0.640624 3.85498C0.499738 4.90338 0.5 6.24614 0.5 7.95557L0.5 8.04541C0.5 9.75483 0.499741 11.0976 0.640625 12.146C0.785093 13.2204 1.08702 14.0738 1.75684 14.7437C2.42665 15.4135 3.28007 15.7154 4.35449 15.8599C5.40287 16.0007 6.74566 16.0005 8.45508 16.0005H8.54492ZM3.87109 12.5718C3.58737 12.5716 3.35768 12.3418 3.35742 12.0581C3.35742 11.7742 3.58721 11.5436 3.87109 11.5435H4.38574L4.38574 6.91455C4.38582 6.74277 4.47142 6.58215 4.61426 6.48682L6.15723 5.4585C6.499 5.23065 6.95703 5.47547 6.95703 5.88623L6.95703 11.5435H7.47168L7.47168 2.80029C7.47175 2.62213 7.56426 2.45647 7.71582 2.36279C7.86736 2.26934 8.05654 2.2607 8.21582 2.34033L12.3301 4.39795C12.5042 4.4851 12.6143 4.66319 12.6143 4.85791L12.6143 11.5435H13.1289C13.4128 11.5436 13.6426 11.7742 13.6426 12.0581C13.6423 12.3418 13.4126 12.5716 13.1289 12.5718L3.87109 12.5718Z'
                    fill='#A855F7'
                  />
                </svg>
                <span className='font-semibold text-white'>
                  {accumulation.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  ₽
                </span>
                <span className='text-purple-300'>от Вклада</span>
              </div>
              <div className='mb-4 text-sm text-gray-300'>
                Заходи каждые 24 часа, чтобы получить прибыль!
              </div>
              <div className='w-full'>
                <Link
                  href='/cabinet'
                  className='relative w-full overflow-hidden rounded-xl border border-[#7c3aed] px-3 py-2 text-center text-sm font-semibold text-[#c4b5fd] transition-all duration-300 active:text-white disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <span className='flex items-center justify-center gap-1'>
                    <span className='truncate'>Собрать</span>
                  </span>
                </Link>
              </div>
              <p className='mt-2 text-center text-xs text-gray-400'>
                Не забудь собрать ежедневную награду
              </p>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
