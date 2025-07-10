'use client';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { Timer } from 'lucide-react';

export function NextCollectionCard({
  lastCollectedAt,
}: {
  lastCollectedAt?: string | null;
}) {
  const now = dayjs();
  const last = lastCollectedAt ? dayjs(lastCollectedAt) : null;
  const nextClaim = last ? last.add(1, 'day') : null;
  const remainingTime = nextClaim ? nextClaim.diff(now, 'second') : 0;
  const isReady = remainingTime <= 0;

  const formatTimer = () => {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    return `${hours}ч ${minutes}м ${seconds}с`;
  };

  return (
    <div className='col-span-2 rounded-2xl bg-zinc-900/80 p-4 shadow-sm md:col-span-1'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm text-zinc-400'>Следующий сбор</span>
        <Timer
          className={clsx(
            'h-4 w-4',
            isReady ? 'text-green-400' : 'text-zinc-500',
          )}
        />
      </div>
      <p
        className={clsx(
          'text-lg font-semibold',
          isReady ? 'text-green-400' : 'text-white',
        )}
      >
        {lastCollectedAt
          ? isReady
            ? 'Доступно для сбора'
            : formatTimer()
          : 'Нет данных'}
      </p>
    </div>
  );
}
