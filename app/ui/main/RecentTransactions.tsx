'use client';

import clsx from 'clsx';
import { CircleArrowDown, CircleArrowUp, X } from 'lucide-react';
import useGlobalStore from '@/app/store/useGlobalStore';

const RecentTransactions: React.FC = () => {
  const { recentTransactions } = useGlobalStore();

  // Filter transactions with non-null review_time and sort by review_time
  const recent = [...recentTransactions]
    .filter((tx) => tx.review_time !== null)
    .sort(
      (a, b) =>
        new Date(b.review_time!).getTime() - new Date(a.review_time!).getTime(),
    )
    .slice(0, 5);

  return (
    <div className='w-full max-w-full px-2'>
      <h3 className='mb-4 flex items-center text-base font-semibold text-white xs:text-lg sm:text-xl'>
        <span className='mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-blue-500' />
        Live Транзакции
      </h3>
      {recent.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <X className='h-12 w-12 text-gray-500' strokeWidth={4} />
          <p className='mt-2 text-lg font-semibold text-zinc-500'>Пока пусто</p>
        </div>
      ) : (
        <ul className='flex flex-col gap-3'>
          {recent.map((tx, index) => {
            const isLast = index === recent.length - 1;
            return (
              <li
                key={tx.id}
                className={clsx(
                  'flex items-center justify-between rounded-lg px-2 py-2 transition-opacity duration-300',
                  isLast ? 'mx-1 opacity-80' : 'hover:bg-white/5',
                )}
              >
                <div className='mr-3 flex h-8 min-h-8 w-8 min-w-8 items-center justify-center'>
                  {tx.type === 'deposit' ? (
                    <CircleArrowUp className='h-6 w-6 text-green-400' />
                  ) : (
                    <CircleArrowDown className='h-6 w-6 text-red-400' />
                  )}
                </div>
                <div className='mr-auto'>
                  <p className='text-xs text-gray-300'>ID: {tx.telegram_id}</p>
                  <p
                    className={clsx(
                      'text-xs font-medium',
                      tx.type === 'deposit' ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {tx.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-2xs text-gray-500'>
                    {new Date(tx.review_time!).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p
                    className={clsx(
                      'text-xs font-semibold',
                      tx.type === 'deposit' ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {tx.type === 'withdrawal' ? '-' : '+'}
                    {tx.amount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export { RecentTransactions };
