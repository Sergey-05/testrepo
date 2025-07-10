'use client';

import { Wallet } from 'lucide-react';

interface TotalEarnedCardProps {
  deposit: number;
  totalIncome: number;
}

export function TotalEarnedCard({
  deposit,
  totalIncome,
}: TotalEarnedCardProps) {
  return (
    <div className='to-white/4 relative rounded-lg border-l-2 border-purple-900 bg-gradient-to-br from-white/10 p-2'>
      <div className='flex items-center justify-between'>
        {/* Левая часть: текст и иконка */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            <Wallet className='h-3 w-3 text-purple-400' />
            <p className='text-[10px] tracking-wide text-white'>
              Всего заработано
            </p>
          </div>
          <p className='text-[10px] text-white/50'>• Депозит • Прибыль</p>
          <div className='flex items-center gap-1'>
            <span className='text-sm text-white'>
              {(deposit || 0).toLocaleString('ru-RU')} ₽
            </span>
            <span className='text-sm text-purple-400'>&gt;&gt;</span>
            <span className='text-sm text-white'>
              {(totalIncome || 0).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>
      <div className='absolute inset-0 z-[-1] overflow-hidden'>
        <svg
          id='wave'
          viewBox='0 0 1440 490'
          xmlns='http://www.w3.org/2000/svg'
          className='h-full w-full opacity-10'
          preserveAspectRatio='none'
        >
          <defs>
            <linearGradient id='sw-gradient-0' x1='0' x2='0' y1='1' y2='0'>
              <stop
                stopColor='rgba(76.859, 3.422, 175.683, 0.3)'
                offset='0%'
              ></stop>
              <stop
                stopColor='rgba(152.872, 84.073, 214.388, 0.47)'
                offset='100%'
              ></stop>
            </linearGradient>
            <filter id='blur-right-bottom'>
              <feGaussianBlur in='SourceGraphic' stdDeviation='4' />
            </filter>
            <mask id='blur-mask'>
              <rect x='0' y='0' width='1440' height='490' fill='white' />
              <rect x='0' y='0' width='1360' height='410' fill='black' />
            </mask>
          </defs>
          <path
            fill='url(#sw-gradient-0)'
            d='M0,294L17.1,277.7C34.3,261,69,229,103,245C137.1,261,171,327,206,318.5C240,310,274,229,309,212.3C342.9,196,377,245,411,294C445.7,343,480,392,514,359.3C548.6,327,583,212,617,147C651.4,82,686,65,720,98C754.3,131,789,212,823,204.2C857.1,196,891,98,926,106.2C960,114,994,229,1029,253.2C1062.9,278,1097,212,1131,179.7C1165.7,147,1200,147,1234,130.7C1268.6,114,1303,82,1337,122.5C1371.4,163,1406,278,1440,285.8C1474.3,294,1509,196,1543,179.7C1577.1,163,1611,229,1646,220.5C1680,212,1714,131,1749,147C1782.9,163,1817,278,1851,302.2C1885.7,327,1920,261,1954,196C1988.6,131,2023,65,2057,49C2091.4,33,2126,65,2160,138.8C2194.3,212,2229,327,2263,351.2C2297.1,376,2331,310,2366,310.3C2400,310,2434,376,2451,408.3L2468.6,441L2468.6,490L2451.4,490C2434.3,490,2400,490,2366,490C2331.4,490,2297,490,2263,490C2228.6,490,2194,490,2160,490C2125.7,490,2091,490,2057,490C2022.9,490,1989,490,1954,490C1920,490,1886,490,1851,490C1817.1,490,1783,490,1749,490C1714.3,490,1680,490,1646,490C1611.4,490,1577,490,1543,490C1508.6,490,1474,490,1440,490C1405.7,490,1371,490,1337,490C1302.9,490,1269,490,1234,490C1200,490,1166,490,1131,490C1097.1,490,1063,490,1029,490C994.3,490,960,490,926,490C891.4,490,857,490,823,490C788.6,490,754,490,720,490C685.7,490,651,490,617,490C582.9,490,549,490,514,490C480,490,446,490,411,490C377.1,490,343,490,309,490C274.3,490,240,490,206,490C171.4,490,137,490,103,490C68.6,490,34,490,17,490L0,490Z'
          ></path>
        </svg>
      </div>
    </div>
  );
}
