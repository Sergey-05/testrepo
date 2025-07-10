'use client';

import { useState, useEffect } from 'react';
import { Backpack, Briefcase, TrendingUp } from 'lucide-react';
import { NextTariffCard } from './NextTariffCard';
import { useNotification } from '@/app/context/NotificContext';
import ReinvestModal from '../modals/ReinvestModal';
import useGlobalStore from '@/app/store/useGlobalStore';
import { saveAccum, updateAccum } from '@/app/lib/actions';

interface Tariff {
  name: string;
  rate: number;
  amountMin?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function TariffCard({
  tariff,
  deposit,
  accumulation,
  nextTariff,
  profitPercentage,
}: {
  tariff: Tariff | null;
  deposit: number;
  accumulation: number;
  nextTariff?: Tariff;
  profitPercentage: number;
}) {
  const Icon = tariff?.icon || Briefcase;
  const { showNotification } = useNotification();
  const { user, setUser, setDepositEarnings } = useGlobalStore();
  const [isCollecting, setIsCollecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  // Логика таймера для накоплений
  useEffect(() => {
    // Если есть накопления, таймер всегда "00:00:00"
    if (accumulation > 0) {
      setTimeLeft('00:00:00');
      return;
    }

    let hasSavedAccum = false;
    let serverTimeMs: number | null = null;

    // Запрос серверного времени
    const fetchServerTime = async () => {
      try {
        const response = await fetch('/api/health');
        const serverTimeHeader = response.headers.get('Date');
        if (serverTimeHeader) {
          serverTimeMs = new Date(serverTimeHeader).getTime();
        } else {
          throw new Error('No Date header in response');
        }
      } catch {
        setTimeLeft('00:00:00');
        return;
      }
    };

    // Если есть депозит и тариф, запускаем таймер
    if (user?.deposit_amount && user.deposit_amount > 0 && tariff) {
      fetchServerTime();

      const mostRecentTime = user.last_deposit_at
        ? new Date(user.last_deposit_at).getTime()
        : null;

      const timer = setInterval(() => {
        if (serverTimeMs === null) {
          setTimeLeft('00:00:00');
          return;
        }

        serverTimeMs += 1000; // Увеличиваем серверное время на 1 секунду
        const elapsedTime = mostRecentTime
          ? serverTimeMs - mostRecentTime
          : 24 * 60 * 60 * 1000;
        const timeUntil24Hours = Math.max(0, 24 * 60 * 60 * 1000 - elapsedTime);

        if (timeUntil24Hours === 0) {
          clearInterval(timer);
          setTimeLeft('00:00:00');
          if (!hasSavedAccum) {
            hasSavedAccum = true;
            const calculateAndSaveAccum = async () => {
              try {
                const updatedData = await saveAccum(
                  user.telegram_id,
                  user.deposit_amount * (tariff.rate / 100),
                );
                setUser(updatedData.user);
                setDepositEarnings(updatedData.depositEarnings);
              } catch {
                showNotification('Ошибка при сохранении накоплений', 'error');
                hasSavedAccum = false; // Повторная попытка при ошибке
              }
            };
            calculateAndSaveAccum();
          }
        } else {
          const hours = Math.floor(timeUntil24Hours / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeUntil24Hours % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((timeUntil24Hours % (1000 * 60)) / 1000);
          setTimeLeft(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
          );
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft('00:00:00');
    }
  }, [
    user,
    tariff,
    setUser,
    showNotification,
    accumulation,
    setDepositEarnings,
  ]);

  // Обработчик сбора накоплений
  const handleCollect = async () => {
    if (!user || accumulation <= 0 || timeLeft !== '00:00:00' || isCollecting) {
      showNotification(
        'Сбор накоплений невозможен',
        'info',
        'Проверьте условия сбора накоплений',
      );
      return;
    }

    setIsCollecting(true);
    try {
      const { user: updatedUser, depositEarnings } = await updateAccum(
        user.telegram_id,
        accumulation,
      );
      setUser(updatedUser);
      setDepositEarnings(depositEarnings);
      showNotification('Накопления успешно собраны', 'success');
    } catch (error) {
      console.error('Ошибка при сборе накоплений:', error);
      showNotification('Ошибка при сборе накоплений', 'error');
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className='relative rounded-2xl bg-gradient-to-br from-black to-[#1e0631] p-2 text-white'>
      {/* Фоновый график */}
      <div className='absolute inset-0 opacity-50'>
        <div className='container-card-charts'>
          <div className='card-charts'>
            <div className='charts-lines'>
              <i className='icon-week'>
                <svg viewBox='0 0 469 262' fill='none'>
                  <path
                    d='M2.5 261L6.42112 216.887C6.4726 216.308 6.69121 215.757 7.05039 215.3L11.359 209.816C11.7743 209.287 12 208.635 12 207.962V202.987C12 202.346 12.2055 201.722 12.5863 201.206L27.2479 181.342C27.4151 181.115 27.5496 180.866 27.6474 180.602L31.7748 169.458C32.2107 168.281 33.333 167.5 34.588 167.5H35.5756C37.8226 167.5 39.292 169.89 38.4086 171.956C36.1137 177.322 34.0615 183.976 36.5 185.5C39.338 187.274 43.1722 202.55 45.2823 212.494C45.6701 214.321 47.5992 215.378 49.3403 214.701L53.6761 213.015C54.5141 212.689 55.1618 212.004 55.4407 211.15L78.3519 140.954C78.45 140.653 78.5 140.339 78.5 140.023V114.385C78.5 114.129 78.5327 113.875 78.5974 113.627L95.9026 47.3728C95.9673 47.1253 96 46.8705 96 46.6147V27L102.483 117.259C102.494 117.42 102.519 117.578 102.555 117.735L108.878 144.485C108.959 144.826 109.098 145.15 109.291 145.442L117.591 158.073C118.871 160.022 121.788 159.829 122.8 157.729L131.594 139.49C132.629 137.343 135.632 137.202 136.864 139.241L147.401 156.681C148.059 157.771 149.334 158.326 150.581 158.067L170.757 153.863C171.832 153.639 172.942 154.02 173.654 154.856L187.803 171.481C189.536 173.517 192.865 172.441 193.078 169.776L199.81 85.6203C200.037 82.7832 203.718 81.8273 205.297 84.1955L227.5 117.5L230.279 122.299C231.461 124.342 234.43 124.282 235.53 122.194L237.842 117.801C237.947 117.601 238.074 117.414 238.222 117.242L261.286 90.4123C262.029 89.5473 263.199 89.1789 264.304 89.4616L280.695 93.6546C282.448 94.1029 284.196 92.9099 284.416 91.1144L294.882 6.02633C295.16 3.76377 297.761 2.62601 299.611 3.95714L322.945 20.7414C323.618 21.2254 324.061 21.9662 324.168 22.7881L335.097 106.419C335.317 108.103 336.89 109.268 338.565 108.989L365.007 104.582C366.835 104.277 368.5 105.688 368.5 107.541V116.792C368.5 117.258 368.608 117.717 368.817 118.133L385.671 151.842C386.179 152.858 387.218 153.5 388.354 153.5H393.231C393.736 153.5 394.232 153.373 394.674 153.13L406.191 146.814C407.884 145.886 409.999 146.775 410.522 148.633L418.132 175.692C418.366 176.523 418.23 177.415 417.76 178.139L412.903 185.611C412.341 186.476 412.262 187.568 412.694 188.504L426.196 217.757C426.686 218.82 427.749 219.5 428.919 219.5H439.146C440.282 219.5 441.321 220.142 441.829 221.158L454.169 245.839C454.387 246.273 454.706 246.648 455.1 246.932L467 255.5'
                    stroke='url(#paint0_linear_230_5)'
                    strokeWidth='5'
                    strokeDasharray='1500'
                  ></path>
                  <defs>
                    <linearGradient
                      id='paint0_linear_230_5'
                      x1='3'
                      y1='176'
                      x2='463'
                      y2='189'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='#89FB73' stopOpacity='0.05'></stop>
                      <stop offset='0.5' stopColor='white'></stop>
                      <stop
                        offset='1'
                        stopColor='#A62727'
                        stopOpacity='0.1'
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </i>
              <i className='icon-month'>
                <svg fill='none' viewBox='0 0 472 170'>
                  <path
                    d='M2.5 167L7.87783 124.955C7.95728 124.334 8.22911 123.753 8.65521 123.294L12.5765 119.071C13.6568 117.908 15.4565 117.788 16.682 118.797L23 124L28.9022 129.246C30.4289 130.603 32.8358 130.071 33.648 128.197L37.7169 118.807C38.1923 117.71 39.2738 117 40.4696 117H47.9618C49.192 117 50.2976 116.249 50.7508 115.105L60.1181 91.4638C60.3655 90.8394 60.8153 90.316 61.3955 89.9776L72.0575 83.7581C72.3504 83.5873 72.6122 83.368 72.8317 83.1097L77.1069 78.0801C78.7093 76.195 81.7764 76.9507 82.3195 79.3645L85.1283 91.848C85.359 92.8733 86.1094 93.7031 87.1064 94.0355L93.877 96.2923C95.1364 96.7121 96.522 96.2542 97.2833 95.1666L116.458 67.7747C116.811 67.2705 117 66.6698 117 66.0543V52C117 50.3431 118.343 49 120 49H137.857C138.88 49 139.834 49.5221 140.385 50.3848L150.824 66.7248C150.941 66.9077 151.077 67.0774 151.231 67.2309L155.012 71.0123C156.318 72.3175 158.481 72.1456 159.563 70.6505L165.937 61.8495C167.019 60.3544 169.182 60.1824 170.488 61.4877L179.121 70.1213C179.684 70.6839 180.447 71 181.243 71H200.338C200.774 71 201.205 71.0952 201.601 71.279L213.688 76.891C214.517 77.2758 215.476 77.2619 216.293 76.8533L221.342 74.3292C222.358 73.821 223 72.7822 223 71.6459V37.4669C223 36.2725 223.704 35.1822 224.827 34.7763C228.907 33.3021 234.813 32.0629 235.5 35.5C236.221 39.1067 245.127 48.1338 250.781 53.4172C251.786 54.3559 253.302 54.4654 254.446 53.7028L261.5 49L279.106 36.4903C279.97 35.8764 281.094 35.7639 282.062 36.1944L292.391 40.7847C293.384 41.2263 294.539 41.0957 295.409 40.4433L301.025 36.2309C301.65 35.7622 302.068 35.0683 302.189 34.2966L306.775 5.11153C307.114 2.95384 309.572 1.87012 311.394 3.07489L337.527 20.3567C338.153 20.7705 338.601 21.4037 338.783 22.1314L344.852 46.4092C345.222 47.8862 346.639 48.8524 348.148 48.6567L370.337 45.7804C371.627 45.6132 372.877 46.296 373.434 47.4713L376.858 54.6994C376.952 54.8992 377.069 55.0879 377.205 55.2621L388.12 69.2333C388.938 70.281 390.349 70.665 391.585 70.1768L405.789 64.5701C407.299 63.9741 409.009 64.687 409.648 66.1788L414.257 76.934C414.417 77.3074 414.5 77.7095 414.5 78.1158V84.3944C414.5 85.3975 415.001 86.3342 415.836 86.8906L437 101L456.676 112.518C457.212 112.832 457.638 113.304 457.894 113.869L469.5 139.5'
                    stroke='url(#paint0_linear_230_6)'
                    strokeWidth='5'
                    strokeDasharray='1500'
                  ></path>
                  <defs>
                    <linearGradient
                      gradientUnits='userSpaceOnUse'
                      y2='84'
                      x2='465.5'
                      y1='84'
                      x1='14'
                      id='paint0_linear_230_6'
                    >
                      <stop stopOpacity='0.1' stopColor='white'></stop>
                      <stop stopColor='white' offset='0.5'></stop>
                      <stop
                        stopOpacity='0.1'
                        stopColor='white'
                        offset='1'
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </i>
              <div className='lines'>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mb-1 flex items-center gap-2 text-xs text-white'>
        {deposit == 0 && <Backpack className='h-4 w-4 text-purple-400' />}
        Ваш депозит:
      </div>

      <div className='mb-3 flex items-center gap-2 text-xs'>
        {tariff ? (
          <>
            <Icon className='mr-1 h-4 w-4' />
            Тариф: <h2 className='font-semibold text-white'>{tariff.name}</h2>
          </>
        ) : (
          <>
            Тариф: <h2 className='font-semibold text-white'>Нет</h2>
          </>
        )}
      </div>

      <p
        className='text-2xl font-bold tracking-tight text-white'
        style={{
          textDecoration: 'underline',
          textDecorationColor: 'rgba(168, 85, 247, 0.7)',
          textDecorationThickness: '2px',
        }}
      >
        {deposit.toLocaleString('ru-RU')} ₽
      </p>

      <div className='my-3 flex items-center gap-2'>
        <div className='rounded-full bg-[#161616] px-2.5 py-1 text-xs font-semibold text-purple-400 shadow-[inset_2px_2px_5px_#0e0e0e,inset_-2px_-2px_5px_#1f1f1f]'>
          {tariff ? `${tariff.rate.toFixed(1)}%` : '0%'}
        </div>
        <div className='rounded-full bg-[#161616] p-1 text-purple-400 shadow-[inset_2px_2px_5px_#0e0e0e,inset_-2px_-2px_5px_#1f1f1f]'>
          <TrendingUp className='h-4 w-4 text-purple-400' />
        </div>
      </div>

      <div className='flex justify-between text-xs'>
        <div>
          <span className='text-purple-300'>Накоплено: </span>
          <span className='font-semibold text-white'>
            {accumulation.toLocaleString('ru-RU', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ₽
          </span>
        </div>
        <div>
          <span className='text-purple-300'>Прибыль: </span>
          <span className='font-semibold text-white'>+{profitPercentage}%</span>
        </div>
      </div>

      <div className='my-2 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent' />

      <div className='grid grid-cols-2 gap-2'>
        <ReinvestModal />
        <button
          onClick={handleCollect}
          disabled={isCollecting}
          className='relative w-full overflow-hidden rounded-xl border border-[#7c3aed] px-3 py-2 text-sm font-semibold text-[#c4b5fd] transition-all duration-300 active:text-white disabled:cursor-not-allowed disabled:opacity-50'
        >
          <span className='relative z-10 flex items-center justify-center gap-1 text-xs sm:text-sm'>
            {isCollecting ? (
              <svg
                width='16'
                height='16'
                viewBox='0 0 17 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mr-2 h-4 w-4 animate-spin text-white'
              >
                <path
                  d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
                  fill='currentColor'
                />
              </svg>
            ) : (
              <TrendingUp className='h-4 w-4 shrink-0' />
            )}
            <span className='truncate'>Сбор</span>
          </span>
        </button>
      </div>
      <div className='my-2 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent' />

      {nextTariff && (
        <NextTariffCard
          tariff={tariff}
          deposit={deposit}
          nextTariff={nextTariff}
        />
      )}
    </div>
  );
}
