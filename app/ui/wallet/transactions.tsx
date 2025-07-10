'use client';

import { useState } from 'react';
import { useModal } from '@/app/context/ModalContext';
import { useNotification } from '@/app/context/NotificContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import {
  Ban,
  Check,
  CircleArrowDown,
  CircleArrowUp,
  Clock8,
  RefreshCw,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { getTransactionsByTelegramId } from '@/app/lib/dataQuery';

// Локальный интерфейс для совместимости с компонентом
interface ComponentTransaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: Date;
  status: 'approved' | 'in_process' | 'canceled';
}

export function Transactions() {
  const { transactions, user, setTransactions } = useGlobalStore();
  const { openModal } = useModal();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // Маппим транзакции для соответствия локальному интерфейсу
  const mappedTransactions: ComponentTransaction[] = transactions.map((tx) => ({
    id: parseInt(tx.id, 10),
    type: tx.type,
    amount: tx.amount,
    date: tx.created_at,
    status: tx.status,
  }));

  const handleRefresh = async () => {
    if (loading || !user?.telegram_id) return;
    setLoading(true);
    setFadingOut(true);

    try {
      const updatedTransactions = await getTransactionsByTelegramId(
        BigInt(user.telegram_id),
      );
      setTransactions(updatedTransactions);
      setFadingOut(false);
    } catch {
      showNotification('Ошибка', 'error', 'Не удалось загрузить транзакции');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600); // Длительность анимации
  };

  // Сортируем и ограничиваем до 5 последних транзакций
  const recent = [...mappedTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className='mb-4 w-full'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='xs:text-md flex items-center text-base font-semibold text-white sm:text-lg'>
          Последние транзакции
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading || !user?.telegram_id}
          className='relative'
          aria-label='Обновить транзакции'
        >
          <RefreshCw
            className={clsx(
              'h-5 w-5 text-gray-500 transition-transform duration-500',
              loading && 'animate-spin',
            )}
          />
        </button>
      </div>
      {recent.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <X className='h-12 w-12 text-gray-500' strokeWidth={4} />
          <p className='mt-2 text-lg font-semibold text-zinc-500'>Пока пусто</p>
        </div>
      ) : (
        <div
          className={clsx(
            'transition-opacity duration-300',
            fadingOut ? 'opacity-0' : 'opacity-100',
          )}
        >
          <ul className='flex flex-col divide-y divide-white/10'>
            {recent.map((tx) => (
              <li
                key={tx.id}
                className='flex items-center justify-between py-3'
              >
                {/* Иконка типа */}
                <div className='flex h-8 w-8 items-center justify-center'>
                  {tx.type === 'deposit' ? (
                    <CircleArrowUp className='h-6 w-6 text-green-400' />
                  ) : (
                    <CircleArrowDown className='h-6 w-6 text-red-400' />
                  )}
                </div>

                {/* Название и дата */}
                <div className='ml-3 flex flex-col'>
                  <span className='text-sm text-white'>
                    {tx.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                  </span>
                  <span className='text-xs text-white/40'>
                    {new Date(tx.date).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Сумма и статус */}
                <div className='ml-auto flex flex-col items-end'>
                  <span
                    className={clsx(
                      'text-sm font-medium',
                      tx.type === 'deposit' ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {tx.type === 'deposit' ? '+' : '-'}
                    {tx.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  <span
                    className={clsx(
                      'mt-0.5 flex items-center gap-1 text-xs',
                      tx.status === 'approved' && 'text-green-400',
                      tx.status === 'in_process' && 'text-yellow-400',
                      tx.status === 'canceled' && 'text-red-400',
                    )}
                  >
                    {tx.status === 'approved' && <Check className='h-3 w-3' />}
                    {tx.status === 'in_process' && (
                      <Clock8 className='h-3 w-3' />
                    )}
                    {tx.status === 'canceled' && <Ban className='h-3 w-3' />}
                    {
                      {
                        approved: 'Подтверждена',
                        in_process: 'В процессе',
                        canceled: 'Отклонена',
                      }[tx.status]
                    }
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {mappedTransactions.length > 5 && !loading && (
            <div className='mt-2 text-center'>
              <button
                onClick={() =>
                  openModal('BottomSheet', { initialActiveTab: 'История' })
                }
                className={clsx(
                  'transition-300 relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-all active:scale-95',
                  showRipple && 'ripple',
                )}
                onMouseDown={handleMouseDown}
              >
                <span className='tracking-wide'>Просмотреть все</span>
                <span className='absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 hover:opacity-20' />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
