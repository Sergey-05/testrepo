'use client';

import { Briefcase, Layers } from 'lucide-react';

interface Tariff {
  name: string;
  rate: number;
  amountMin?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function NextTariffCard({
  tariff,
  nextTariff,
  deposit,
}: {
  tariff: Tariff | null;
  nextTariff: Tariff;
  deposit: number;
}) {
  if (!nextTariff) return null;

  return (
    <div className='col-span-2'>
      {/* Заголовок */}
      <div className='mb-2 flex items-center gap-1'>
        <Layers className='h-3 w-3 text-purple-400' />
        <p className='text-[10px] font-semibold uppercase tracking-wide text-white'>
          Тарифные планы
        </p>
      </div>

      {/* Контейнер с градиентом для тарифов */}
      <div className='w-full rounded-lg bg-gradient-to-br from-black/80 to-black/60 p-3'>
        {/* Тарифы: левая и правая части */}
        <div className='flex justify-between gap-2'>
          {/* Левая часть: текущий тариф */}
          <div className='flex-1'>
            <div className='flex items-center gap-1'>
              {deposit > 250 && tariff?.icon && (
                <tariff.icon className='h-3 w-3 text-purple-400' />
              )}
              <p className='text-xs font-semibold text-white'>
                {deposit > 250 && tariff?.name ? tariff.name : 'Нет тарифа'}
              </p>
            </div>
            <p className='text-[8px] text-purple-400/70'>Текущий тариф</p>
          </div>

          {/* Правая часть: следующий тариф */}
          <div className='flex-1 text-right'>
            <div className='flex items-center justify-end gap-1'>
              <p className='text-xs font-semibold text-white'>
                {nextTariff.name || 'Нет данных'}
              </p>
              {nextTariff?.icon ? (
                <nextTariff.icon className='h-3 w-3 text-purple-400' />
              ) : (
                <Briefcase className='h-3 w-3 text-purple-400' />
              )}
            </div>
            <p className='text-[8px] text-purple-400/70'>Следующий тариф</p>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className='mt-1'>
          <div className='h-0.5 rounded-full bg-gray-800/50'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500'
              style={{
                width: nextTariff?.amountMin
                  ? `${Math.min((deposit / nextTariff.amountMin) * 100, 100)}%`
                  : '0%',
              }}
            />
          </div>
        </div>

        {/* Проценты */}
        <div className='mt-1 flex justify-between text-[10px]'>
          <span className='font-semibold text-purple-400'>
            {tariff?.rate ? `${tariff.rate.toFixed(1)}%` : '0.0%'}
          </span>
          <span className='font-semibold text-purple-400'>
            {nextTariff?.rate ? `${nextTariff.rate.toFixed(1)}%` : '0.0%'}
          </span>
        </div>
      </div>

      {/* Депозит и сумма до следующего тарифа */}
      <div className='mt-1 space-y-0.5'>
        <div className='flex justify-between text-[10px]'>
          <span className='text-purple-400/70'>Личный депозит:</span>
          <span className='font-semibold text-white'>
            {(deposit || 0).toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className='h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent' />
        <div className='flex justify-between text-[10px]'>
          <span className='text-purple-400/70'>До следующего тарифа:</span>
          <span className='font-semibold text-white'>
            {nextTariff?.amountMin
              ? (nextTariff.amountMin - deposit).toLocaleString('ru-RU')
              : '0'}{' '}
            ₽
          </span>
        </div>
        <div className='h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent' />
      </div>
    </div>
  );
}
