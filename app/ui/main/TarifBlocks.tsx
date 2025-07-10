'use client';

import { tariffs } from '../../lib/constants/tariffs';

export default function TariffBlocks() {
  const [leftTariff, ...rightTariffs] = tariffs;

  return (
    <div className='mb-3 grid grid-cols-2 border border-zinc-800 bg-black text-white'>
      {/* Левая колонка: один тариф */}
      <div className='relative flex flex-col justify-between border-r border-zinc-800 p-2'>
        <div className='flex flex-col'>
          <leftTariff.icon className='mb-2 h-6 w-6' />
          <h2 className='truncate text-sm font-bold'>{leftTariff.name}</h2>
          <div className='mt-1 rounded bg-purple-900/50 p-1'>
            <p className='truncate text-center text-[6px] uppercase tracking-wider text-purple-300'>
              {leftTariff.description}
            </p>
          </div>
          <p className='mt-1 text-[10px] font-medium underline decoration-purple-500 underline-offset-4'>
            <span className='text-sm text-purple-500'>+{leftTariff.rate}%</span>{' '}
            <span className='text-white'>в сутки</span>
          </p>
        </div>
      </div>

      {/* Правая колонка: два тарифа */}
      <div className='grid grid-rows-2 divide-y divide-zinc-800'>
        {rightTariffs.map((tariff) => (
          <div
            key={tariff.id}
            className='relative flex flex-1 flex-col justify-between p-1.5 transition-colors hover:bg-zinc-800/50'
          >
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <tariff.icon className='h-5 w-5' />
                <h2 className='truncate text-xs font-semibold'>
                  {tariff.name}
                </h2>
                <div className='ml-auto rounded bg-purple-900/50 p-1'>
                  <p className='truncate text-[6px] uppercase tracking-wider text-purple-300'>
                    {tariff.description}
                  </p>
                </div>
              </div>
              <p className='mt-1 text-[10px] font-medium'>
                <span className='text-xs text-purple-500'>+{tariff.rate}%</span>{' '}
                <span className='text-white'>в сутки</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
