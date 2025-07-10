'use client';

import { useModal } from '@/app/context/ModalContext';
import { useNotification } from '@/app/context/NotificContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import clsx from 'clsx';

export default function ButtonsMain() {
  const { openModal } = useModal();
  const { showNotification } = useNotification();
  const { user, transactions } = useGlobalStore();

  // Проверка для кнопки "Пополнить"
  const hasPendingDeposit = transactions.some(
    (tx) => tx.type === 'deposit' && tx.status === 'in_process',
  );
  const isDepositDisabled = hasPendingDeposit;

  const handleDepositClick = () => {
    if (isDepositDisabled) {
      showNotification(
        'Пополнение недоступно',
        'info',
        'Есть необработанная заявка на пополнение',
      );
      return;
    }
    openModal('BottomSheet', { initialActiveTab: 'Депозит' });
  };

  // Если пользователь не загружен, показываем заглушку
  if (!user) {
    return (
      <div className='mb-4 flex w-full justify-between gap-4'>
        <div className='flex w-[40%] flex-col items-center justify-center rounded-md bg-white/5 px-4 py-1 sm:w-full md:w-[48%]'>
          <p className='text-center text-[8px] text-gray-400'>
            Всего активов (RUB)
          </p>
          <span className='text-center text-base font-semibold text-white'>
            Загрузка...
          </span>
        </div>
        <button
          disabled
          className='w-[40%] cursor-not-allowed rounded-md bg-gradient-to-r from-[#3B1A6D] to-[#2A104F] px-4 py-1 text-center text-sm font-semibold text-white opacity-50 sm:w-full md:w-[48%]'
        >
          Пополнить
        </button>
      </div>
    );
  }

  return (
    <div className='mb-4 flex w-full justify-between gap-4'>
      <div className='flex w-[40%] flex-col items-center justify-center rounded-md bg-white/5 px-4 py-1 sm:w-full md:w-[48%]'>
        <p className='text-center text-[8px] text-gray-400'>
          Всего активов (RUB)
        </p>
        <span className='text-center text-base font-semibold text-white'>
          {user.deposit_amount.toLocaleString('ru-RU')} ₽
        </span>
      </div>
      <button
        onClick={handleDepositClick}
        disabled={isDepositDisabled}
        className={clsx(
          'w-[40%] rounded-md bg-gradient-to-r from-[#3B1A6D] to-[#2A104F] px-4 py-1 text-center text-sm font-semibold text-white transition-all sm:w-full md:w-[48%]',
          isDepositDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:from-[#4A2287] hover:to-[#371565]',
        )}
      >
        Пополнить
      </button>
    </div>
  );
}
