'use client';

import { Drawer } from 'vaul';
import { useState } from 'react';
import { tariffs, Tariff } from '@/app/lib/constants/tariffs';
import { Calculator } from 'lucide-react';

export function CalculatorButton() {
  const [input, setInput] = useState<string>('');

  const deposit = parseInt(input || '0', 10);

  // Функция для выбора тарифа на основе минимальной границы
  const getTariff = (amount: number): Tariff | null => {
    let selectedTariff: Tariff | null = null;
    let highestRate = 0;

    for (const tariff of tariffs) {
      const minAmount = tariff.amountMin ?? 0; // Если amountMin не указан, считаем 0
      if (amount >= minAmount && tariff.rate > highestRate) {
        selectedTariff = tariff;
        highestRate = tariff.rate;
      }
    }
    return selectedTariff;
  };

  const selectedTariff = getTariff(deposit);
  const rate = selectedTariff ? selectedTariff.rate : 0;
  const minDeposit = Math.min(...tariffs.map((t) => t.amountMin ?? 0)) || 250; // Минимальная сумма из всех тарифов
  const isTooSmall = deposit < minDeposit;

  // Расчет доходов
  const daily = +((deposit * rate) / 100).toFixed(2);
  const weekly = +(daily * 7).toFixed(2);
  const monthly = +(daily * 30).toFixed(2);
  const yearly = +(daily * 365).toFixed(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) setInput(value);
  };

  return (
    <Drawer.Root repositionInputs={false}>
      <Drawer.Trigger asChild>
        <button className='mt-6 w-full rounded-xl border-none bg-purple-600 px-6 py-3 text-base font-semibold text-white outline-none focus:outline-none active:scale-95'>
          <div className='flex items-center justify-center'>
            Открыть калькулятор
            <Calculator className='ml-2 h-5 w-5' />
          </div>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
        <Drawer.Content
          aria-describedby={undefined}
          className='fixed bottom-0 left-0 right-0 z-50 h-[80vh] rounded-t-3xl bg-zinc-950 p-4 text-white'
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
          <div className='mx-auto'>
            <Drawer.Title className='mb-6 text-center text-lg font-bold'>
              Калькулятор прибыли
            </Drawer.Title>

            <div className='mb-8'>
              <input
                type='text'
                inputMode='numeric'
                value={input}
                onChange={handleChange}
                placeholder='Введите сумму'
                className='w-full border-none bg-transparent text-center text-4xl font-semibold text-white placeholder-gray-500 outline-none'
              />

              {isTooSmall ? (
                <p className='mt-2 text-center text-sm font-medium text-red-400'>
                  Минимальная сумма вклада — {minDeposit} ₽
                </p>
              ) : selectedTariff ? (
                <p className='mt-2 text-center text-sm text-gray-400'>
                  Текущий тариф:{' '}
                  <span className='text-purple-400'>{selectedTariff.name}</span>{' '}
                  ({rate}% в день)
                </p>
              ) : (
                <p className='mt-2 text-center text-sm font-medium text-red-400'>
                  Подходящий тариф не найден
                </p>
              )}
            </div>

            {selectedTariff && !isTooSmall && rate > 0 ? (
              <div className='space-y-4 rounded-2xl bg-zinc-900 p-4 shadow-inner'>
                <Result label='Доход в день' value={daily} />
                <Result label='Доход в неделю' value={weekly} />
                <Result label='Доход в месяц' value={monthly} />
                <Result label='Доход в год' value={yearly} />
              </div>
            ) : (
              <div className='rounded-2xl bg-zinc-900 p-6 text-center text-sm text-gray-500 shadow-inner'>
                {isTooSmall
                  ? `Минимальная сумма для расчёта — ${minDeposit} ₽.`
                  : 'Подходящий тариф не найден. Пожалуйста, выберите сумму, соответствующую доступным тарифам.'}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Result({ label, value }: { label: string; value: number }) {
  return (
    <div className='flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none last:pb-0'>
      <span className='text-sm text-gray-400'>{label}</span>
      <span className='text-lg font-semibold text-white'>
        {value.toLocaleString('ru-RU')} ₽
      </span>
    </div>
  );
}
