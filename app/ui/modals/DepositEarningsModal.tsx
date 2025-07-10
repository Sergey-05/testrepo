'use client';

import { useState, useMemo, useEffect } from 'react';
import { Drawer } from 'vaul';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useNotification } from '@/app/context/NotificContext';
import { saveAccum } from '@/app/lib/actions';
import { DepositEarning } from '@/app/lib/definition';
import Link from 'next/link';
import { tariffs } from '@/app/lib/constants/tariffs';
import Image from 'next/image';

export default function DepositEarningsModal({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [wasOpenedOnce, setWasOpenedOnce] = useState(false);
  const { user, depositEarnings, setUser, setDepositEarnings } =
    useGlobalStore();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && !wasOpenedOnce) {
      setWasOpenedOnce(true);
      onFinish();
    }
  }, [isOpen, wasOpenedOnce, onFinish]);

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
      user.deposit_amount < 250 ||
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

        // Явная проверка last_deposit_at
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
          const amount = user.deposit_amount * (currentTariff.rate / 100);
          const updatedData = await saveAccum(user.telegram_id, amount);
          setUser(updatedData.user);
          setDepositEarnings(updatedData.depositEarnings);
          setIsOpen(true);
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
    <Drawer.Root
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (value) onFinish();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300' />

        <Drawer.Content className='fixed inset-x-0 bottom-0 z-[110] w-full rounded-t-3xl border-t border-purple-800 bg-black/90 shadow-[0_-8px_40px_#6b21a8] backdrop-blur-xl transition-transform duration-300'>
          <div className='relative flex flex-col items-center px-6 pb-8 pt-20'>
            <div className='absolute -top-14 z-20 rounded-full border-4 border-[#1e0631] bg-gradient-to-br from-purple-800 via-black to-purple-950 p-2 shadow-lg'>
              <Image
                src='/coins.webp'
                alt='Coin'
                width={80}
                height={80}
                className='rounded-full'
              />
            </div>

            <button
              type='button'
              className='absolute right-4 top-4 z-30 rounded-full p-2 transition hover:bg-white/10'
              onClick={() => setIsOpen(false)}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill='currentColor'
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M6.32277 6.32277C6.75314 5.89241 7.4509 5.89241 7.88126 6.32277L11.9999 10.4414L16.1185 6.32277C16.5489 5.89241 17.2466 5.89241 17.677 6.32277C18.1074 6.75314 18.1074 7.4509 17.677 7.88126L13.5584 11.9999L17.677 16.1185C18.1074 16.5489 18.1074 17.2466 17.677 17.677C17.2466 18.1074 16.5489 18.1074 16.1185 17.677L11.9999 13.5584L7.88126 17.677C7.4509 18.1074 6.75314 18.1074 6.32277 17.677C5.89241 17.2466 5.89241 16.5489 6.32277 16.1185L10.4414 11.9999L6.32277 7.88126C5.89241 7.4509 5.89241 6.75314 6.32277 6.32277Z'
                />
              </svg>
            </button>

            <div className='mt-4 text-center'>
              <p className='text-lg font-semibold text-gray-300'>
                Ты заработал
              </p>
              <p className='mt-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-purple-600 bg-clip-text text-3xl font-bold text-transparent drop-shadow'>
                {accumulation.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                ₽
              </p>
              <p className='mt-1 text-sm text-purple-400'>от вклада</p>
            </div>

            <p className='mt-4 text-center text-sm text-gray-400'>
              Заходи каждые 24 часа, чтобы получать прибыль
            </p>

            <Link
              href='/cabinet'
              className='relative mt-6 block w-full max-w-xs rounded-xl border border-purple-600 bg-gradient-to-br from-purple-800 to-purple-950 px-5 py-3 text-center text-base font-semibold text-white shadow-md transition hover:border-purple-400 hover:shadow-lg active:scale-95'
              onClick={() => setIsOpen(false)}
            >
              <span className='relative z-10'>Собрать</span>
              <div className='absolute inset-0 z-0 animate-pulse rounded-xl bg-purple-500 opacity-10 blur-sm' />
            </Link>

            <p className='mt-3 text-center text-xs text-gray-500'>
              Не забудь собрать ежедневную награду
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
