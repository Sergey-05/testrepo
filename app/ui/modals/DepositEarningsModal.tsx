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
        <Drawer.Overlay className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm' />

        <Drawer.Content className='fixed inset-x-0 bottom-0 z-[110] flex w-full flex-col items-center rounded-t-3xl bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,1)_0%,#120022_100%)] text-white'>
          <div className='relative flex w-full max-w-md flex-col items-center px-6 pb-8 pt-20'>
            {/* Иконка */}
            {/* <div className='absolute -top-12 z-20 flex h-24 w-24 items-center justify-center rounded-full border border-[#1e0631] bg-black'>
              <Image
                src='/coins.png'
                alt='Coin'
                width={80}
                height={80}
                className='rounded-full'
              />
            </div> */}

            <div className='absolute -top-12 z-20 rounded-full border-4 border-[#1e0631] bg-[#0d0d0d] shadow-xl'>
              <Image
                src='/coins.png'
                alt='Coin'
                width={96}
                height={96}
                className='rounded-full'
              />
            </div>

            {/* Кнопка закрытия */}
            <button
              type='button'
              className='absolute right-4 top-4 z-30 rounded-full p-2'
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

            {/* Заголовок и сумма */}
            <div className='mt-2 w-full max-w-xs rounded-xl bg-black/10 px-4 py-5'>
              <div className='flex items-center justify-center gap-3'>
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
                    d='M8.54492 -0.000975867C10.2543 -0.000976016 11.5971 -0.00123172 12.6455 0.139649C13.72 0.284115 14.5734 0.58606 15.2432 1.25586C15.913 1.92567 16.2149 2.7791 16.3594 3.85352C16.5003 4.9019 16.5 6.24468 16.5 7.9541L16.5 8.04395C16.5 9.75336 16.5003 11.0961 16.3594 12.1445C16.2149 13.219 15.913 14.0724 15.2432 14.7422C14.5734 15.412 13.72 15.7139 12.6455 15.8584C11.5971 15.9993 10.2543 15.999 8.54492 15.999L8.45508 15.999C6.74565 15.999 5.40287 15.9993 4.35449 15.8584C3.28032 15.714 2.42756 15.4117 1.75781 14.7422C1.088 14.0724 0.785092 13.219 0.640624 12.1445C0.499738 11.0961 0.499999 9.75337 0.499999 8.04395L0.499999 7.9541C0.499999 6.24468 0.499742 4.9019 0.640624 3.85352C0.785092 2.7791 1.088 1.92567 1.75781 1.25586C2.42756 0.586369 3.28032 0.284084 4.35449 0.139649C5.40287 -0.00124071 6.74565 -0.00097571 8.45508 -0.000975859L8.54492 -0.000975867ZM7.43457 3.42774L7.43457 4.4043C6.50303 4.51412 5.78092 4.7689 5.26855 5.16895C4.75618 5.57686 4.5 6.09896 4.5 6.73438L4.5 6.85156C4.5 7.90274 5.37735 8.53042 7.13184 8.73438L9.28613 8.98145C9.68977 9.02851 9.96579 9.08373 10.1133 9.14648C10.2527 9.21706 10.3222 9.31898 10.3223 9.45215L10.3223 9.53418C10.3223 9.8715 9.75946 10.041 8.63379 10.041C7.96644 10.041 7.47356 9.97408 7.15527 9.84082C6.82922 9.71531 6.66602 9.51867 6.66602 9.25195L6.66602 9.16992L4.6748 9.16992L4.6748 9.25195C4.6748 9.8952 4.91122 10.4134 5.38477 10.8057C5.85056 11.2057 6.53403 11.4605 7.43457 11.5703L7.43457 12.5703L9.6123 12.5703L9.6123 11.582C10.497 11.4801 11.1799 11.2445 11.6611 10.876C12.1347 10.5073 12.3721 10.0288 12.3721 9.44043L12.3721 9.32324C12.3721 8.76628 12.1584 8.32651 11.7314 8.00488C11.3045 7.6833 10.6564 7.47501 9.78711 7.38086L7.5625 7.14551C7.18999 7.10629 6.93368 7.04815 6.79394 6.96973C6.65421 6.89128 6.58398 6.7731 6.58398 6.61621L6.58398 6.53418C6.58398 6.33022 6.73234 6.18105 7.02734 6.08691C7.31461 5.99286 7.77282 5.94531 8.40137 5.94531C9.11512 5.94534 9.64284 6.02004 9.98437 6.16895C10.3259 6.32579 10.497 6.56136 10.4971 6.875L10.4971 6.95801L12.5 6.95801L12.5 6.875C12.4999 6.16132 12.2595 5.59637 11.7783 5.18066C11.2893 4.77278 10.5671 4.51414 9.6123 4.4043L9.6123 3.42773L7.43457 3.42774Z'
                    fill='#FFC300'
                  />
                </svg>
                <div className='flex flex-col items-start justify-center'>
                  <span className='bg-gradient-to-br from-yellow-300 via-orange-400 to-purple-500 bg-clip-text text-2xl font-bold leading-snug text-transparent'>
                    {accumulation.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </span>
                  <span className='text-sm text-purple-300'>от вклада</span>
                </div>
              </div>
            </div>

            <p className='mt-4 text-center text-xs text-gray-400'>
              Заходи каждые 24 часа, чтобы получать прибыль
            </p>

            {/* Кнопка "Собрать" — точная копия из обучения */}
            <div className='mt-6 w-full max-w-md'>
              <Link
                href='/cabinet'
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-purple-700/50 bg-gradient-to-tr from-purple-900/50 via-black/30 to-black/40 px-6 py-3.5 text-sm font-semibold text-white'
                onClick={() => setIsOpen(false)}
              >
                <span className='relative z-10'>Собрать</span>
              </Link>
            </div>

            <p className='mt-3 text-center text-[10px] text-zinc-500'>
              Не забудь собрать ежедневную награду
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
