'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Drawer } from 'vaul';
import { X, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { cryptoMethods } from '../../lib/data';
import { motion } from 'framer-motion';
import { useModal } from '@/app/context/ModalContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useNotification } from '@/app/context/NotificContext';
import { fetchPaymentData } from '@/app/lib/dataQuery';
import { useWebApp } from '@/app/lib/hooks/useWebApp';

type CardTransferDialogProps = {
  isOpen: boolean;
  methodId: string;
  onClose: () => void;
  isClosing?: boolean; // Добавляем isClosing
};

// Компонент иконки для банковских методов
const CardTransferIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    className={className || 'size-6 text-gray-400'}
  >
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M21.5 8.79a.3.3 0 0 1-.3.3H2.8a.3.3 0 0 1-.3-.3v-.08c0-2.794 1.794-4.67 4.463-4.67h10.071c2.67 0 4.464 1.876 4.464 4.67zm-10.718 7.13h1.428a.75.75 0 0 0 0-1.5h-1.428a.75.75 0 0 0 0 1.5m-3.884 0h1.428a.75.75 0 0 0 0-1.5H6.898a.75.75 0 0 0 0 1.5m-4.397-5.03a.3.3 0 0 1 .3-.3h18.398a.3.3 0 0 1 .3.3v4.4c0 2.792-1.794 4.67-4.465 4.67H6.964c-2.669 0-4.463-1.878-4.463-4.67z'
      clipRule='evenodd'
    />
  </svg>
);

export function CardTransferDialog({
  onClose,
  isOpen,
  methodId,
  isClosing,
}: CardTransferDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const amountOptions = [
    3030, 4040, 5050, 8080, 10010, 25025, 40400, 70777, 100100,
  ];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const WebApp = useWebApp();

  const {
    bonuses,
    cards,
    cryptoWallets,
    setCards,
    setCryptoWallets,
    setBonuses,
    user,
  } = useGlobalStore();

  const { openModal } = useModal();

  const { showNotification } = useNotification();

  const hasFetchedData = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadPaymentData = async () => {
      if (
        hasFetchedData.current ||
        (cards.length > 0 && cryptoWallets.length > 0)
      ) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { cards, cryptoWallets, bonuses } = await fetchPaymentData();
        if (isMounted) {
          setCards(cards);
          setCryptoWallets(cryptoWallets);
          setBonuses(bonuses);
          hasFetchedData.current = true;
        }
      } catch (error) {
        console.error('Ошибка загрузки платежных данных:', error);
        if (isMounted) {
          showNotification(
            'Ошибка загрузки',
            'error',
            'Не удалось загрузить платежные данные',
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (isOpen && !isClosing) {
      loadPaymentData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isClosing]);

  // Валидация
  const parsedAmount = parseFloat(amount);
  const isAmountValid =
    !isNaN(parsedAmount) && parsedAmount >= 250 && parsedAmount <= 10000000;

  // Расчёт бонуса
  const bonus = useMemo(() => {
    if (!isAmountValid) return null;
    for (const b of bonuses) {
      if (
        parsedAmount >= b.min_deposit &&
        (!b.max_deposit || parsedAmount <= b.max_deposit)
      ) {
        const bonusAmount = (parsedAmount * b.percentage) / 100;
        return { bonusAmount, percentage: b.percentage };
      }
    }
    return null;
  }, [bonuses, isAmountValid, parsedAmount]);

  console.log('Calculated bonus:', bonus);

  const handleAmountClick = (value: number) => {
    setAmount(value.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 10000000) {
      setAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAmountValid) {
      // if (isCryptoMethod && selectedMethod?.network) {
      //   openModal('CryptoPaymentDialog', {
      //     method: {
      //       id: selectedMethod.id,
      //       title: selectedMethod.title,
      //       network: selectedMethod.network,
      //     },
      //     selectedAmount: parsedAmount || 0,
      //   });
      // } else {
      //   openModal('CardTransferConfirmationDialog', {
      //     amount: parsedAmount || 0,
      //     methodId,
      //   });
      // }
      // onClose();

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAmountValid || !user?.telegram_id) return;

        if (isCryptoMethod && selectedMethod?.network) {
          openModal('CryptoPaymentDialog', {
            method: {
              id: selectedMethod.id,
              title: selectedMethod.title,
              network: selectedMethod.network,
            },
            selectedAmount: parsedAmount || 0,
          });
        } else {
          try {
            const res = await fetch('/api/create-payou-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: user.telegram_id,
                amount: parsedAmount,
              }),
            });

            const data = await res.json();

            if (!res.ok || !data.url) {
              throw new Error(data.error || 'Не удалось получить ссылку');
            }
            if (WebApp) {
              WebApp.openLink(data.url);
            }
          } catch (error) {
            console.error('Ошибка оплаты:', error);
            showNotification('Ошибка', 'error', 'Не удалось начать оплату');
          }
        }

        onClose();
      };
    }
  };

  // Найти метод по methodId
  const selectedMethod = [...cryptoMethods].find(
    (method) => method.id === methodId,
  );

  // Определить заголовок
  const getMethodTitle = () => {
    if (methodId === 'card-transfer') return 'Перевод на карту';
    if (methodId === 'mir') return 'Перевод на карту МИР';
    return selectedMethod
      ? `Оплата ${selectedMethod.title}`
      : 'Неизвестный метод';
  };

  // Определить иконку
  const getMethodIcon = () => {
    if (methodId === 'card-transfer' || methodId === 'mir') {
      return CardTransferIcon;
    }
    return selectedMethod?.icon || CardTransferIcon;
  };

  const IconComponent = getMethodIcon();

  // Проверка, является ли метод криптовалютным
  const isCryptoMethod = selectedMethod !== undefined;

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen && !isClosing}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' />
        <Drawer.Content
          role='dialog'
          aria-modal='true'
          className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-2xl bg-zinc-900 text-white outline-none'
          style={{ pointerEvents: 'auto' }}
        >
          <div className='relative px-4 py-4 pb-2 md:px-6 md:py-4'>
            <Drawer.Close
              onClick={onClose}
              className='absolute right-4 top-4 flex items-center gap-1 rounded-lg text-sm font-semibold text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B1A6D] md:right-6 md:top-6'
              data-mixpanel='{"button_name":"Close popup window","page_name":"Modal window","popup_window":true}'
            >
              <X className='h-6 w-6' />
            </Drawer.Close>
            <button
              onClick={() => {
                openModal('BottomSheet', {
                  initialActiveTab: 'Депозит', // Укажите нужную вкладку
                });
                onClose(); // Закрываем CardTransferDialog
              }}
              className='mb-3 flex items-center gap-1 rounded-lg text-sm font-semibold text-gray-400'
            >
              <ChevronLeft className='h-4 w-4' />
              <span>Назад</span>
            </button>
          </div>
          <div className='flex min-h-0 max-w-full grow flex-col overflow-y-auto px-4 md:px-6'>
            <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
              {methodId === 'card-transfer' || methodId === 'mir'
                ? 'Банковский платеж'
                : 'Криптовалютный платеж'}
            </Drawer.Title>
            {isLoading ? (
              <div className='flex h-full items-center justify-center'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 17 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 animate-spin text-white'
                >
                  <path
                    d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
                    fill='currentColor'
                  />
                </svg>
              </div>
            ) : (
              <form
                className='flex grow flex-col gap-3'
                onSubmit={handleSubmit}
              >
                <label className='relative flex flex-col gap-2 text-white'>
                  <div className='flex h-10 items-center gap-3 rounded-lg border border-transparent bg-zinc-800 px-4 hover:bg-zinc-700'>
                    <IconComponent className='size-6 text-gray-400' />
                    <p className='w-full select-none bg-transparent text-left text-sm font-semibold tracking-tight text-white outline-none'>
                      {getMethodTitle()}
                    </p>
                  </div>
                </label>
                <label className='relative flex flex-col gap-1 text-white'>
                  <p className='text-[10px] text-gray-400'>Мин. сумма 250 ₽</p>
                  <div
                    className={clsx(
                      'flex h-10 items-center rounded-lg border bg-zinc-800 px-4 transition-colors hover:bg-zinc-700',
                      !isAmountValid && 'border-red-500',
                    )}
                  >
                    <div className='flex max-w-max items-center'>
                      <input
                        ref={inputRef}
                        type='text'
                        className='m-0 appearance-none bg-transparent p-0 text-sm font-semibold text-white outline-none [-moz-appearance:textfield] placeholder:text-gray-400'
                        style={{
                          width: `${amount.length}ch`,
                          minWidth: '4ch',
                        }}
                        placeholder='250'
                        value={amount}
                        onChange={handleAmountChange}
                        min={250}
                        max={10000000}
                        maxLength={9}
                      />
                      <span className='text-sm font-semibold text-white'>
                        ₽
                      </span>
                    </div>
                  </div>
                  {!isAmountValid && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className='mt-1 text-[10px] text-red-400'
                    >
                      Сумма должна быть от 250 до 10 000 000
                    </motion.p>
                  )}
                </label>
                <div className='flex flex-wrap gap-2'>
                  {amountOptions.map((value) => (
                    <button
                      key={value}
                      type='button'
                      className={clsx(
                        'inline-flex min-h-8 items-center rounded-xl px-4 text-sm font-semibold tracking-tight transition-all',
                        parseFloat(amount) === value
                          ? 'bg-gradient-to-r from-[#3B1A6D] to-[#2A104F] text-white hover:from-[#4A2284] hover:to-[#351663]'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700 focus:bg-zinc-700',
                      )}
                      onClick={() => handleAmountClick(value)}
                    >
                      {value} ₽
                    </button>
                  ))}
                </div>
                {bonus && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className='mb-4 rounded-2xl border border-zinc-700'
                  >
                    <div
                      className='flex items-center justify-between rounded-2xl p-2 pl-4'
                      style={{
                        background:
                          'linear-gradient(45deg, rgb(0, 96, 232) 3.64%, rgb(56, 141, 255) 98.23%), linear-gradient(110deg, rgb(103, 2, 245) 0.16%, rgb(161, 46, 252) 100.39%)',
                      }}
                    >
                      <div>
                        <p className='mb-0.5 text-sm font-semibold text-white'>
                          Вы получите
                        </p>
                        <p className='text-sm font-semibold text-gray-300'>
                          Бонус
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='rounded-2xl bg-black/80 px-3 py-2 text-white'>
                          <p className='text-sm font-semibold'>
                            +{bonus.percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className='flex justify-between p-4'
                      style={{
                        background:
                          'url("/bonus-bg.svg") right bottom no-repeat, url("/bonus-bg-2.svg") right bottom no-repeat',
                      }}
                    >
                      <div className='grow'>
                        <p className='mb-2 text-sm font-semibold text-white'>
                          Бонус до {bonus.percentage}% на депозит
                        </p>
                      </div>
                      <div className='flex gap-3'>
                        <button
                          type='button'
                          role='switch'
                          aria-checked='true'
                          data-state='checked'
                          className='flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-indigo-500 transition-colors focus:outline focus:outline-2 focus:outline-indigo-500'
                        >
                          <span
                            data-state='checked'
                            className={clsx(
                              'pointer-events-none block h-5 w-5 rounded-full bg-white transition-all',
                              'translate-x-4',
                            )}
                          />
                        </button>
                        <input
                          aria-hidden='true'
                          type='checkbox'
                          readOnly
                          className='absolute -translate-x-full opacity-0'
                          style={{ width: '40px', height: '24px', margin: 0 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className='mt-4 border-t-2 border-zinc-600' />
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-row justify-between'>
                    <p className='py-0.5 text-sm text-gray-400'>К пополнению</p>
                    <p className='text-base font-semibold text-white'>
                      {parsedAmount || 0} ₽
                    </p>
                  </div>
                  {bonus && (
                    <div className='flex flex-row justify-between'>
                      <p className='py-0.5 text-sm text-gray-400'>
                        Бонусный счет
                      </p>
                      <p className='flex items-center text-base font-semibold text-violet-700'>
                        {bonus.bonusAmount} ₽
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          className='ml-1 h-4 w-4'
                        >
                          <path
                            fill='currentColor'
                            fillRule='evenodd'
                            d='M11.272 6.5c-.407-1.151-1.327-3-3.053-3-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5zM17.82 5c0-.827-.673-1.5-1.501-1.5-1.725 0-2.646 1.849-3.052 3h3.052c.828 0 1.501-.673 1.501-1.5m.9 1.78h.436a2.38 2.38 0 0 1 2.377 2.38v.81a2.27 2.27 0 0 1-2.27 2.27H5.378A2.377 2.377 0 0 1 3 9.87v-.82a2.273 2.273 0 0 1 2.272-2.27h.546A2.97 2.97 0 0 1 5.219 5c0-1.654 1.346-3 3-3 2.123 0 3.365 1.592 4.05 2.999C12.954 3.592 14.196 2 16.319 2a3.005 3.005 0 0 1 3.001 3c0 .669-.228 1.281-.6 1.78M4.845 13.538a.3.3 0 0 0-.3.3v4.442a2.974 2.974 0 0 0 2.97 2.97h3.703a.3.3 0 0 0 .3-.3v-7.112a.3.3 0 0 0-.3-.3zm8.473 0a.3.3 0 0 0-.3.3v7.112a.3.3 0 0 0 .3.3h3.704a2.973 2.973 0 0 0 2.969-2.97v-4.442a.3.3 0 0 0-.3-.3z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type='submit'
                  className='mb-6 mt-4 flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#3B1A6D] to-[#2A104F] px-5 text-sm font-semibold text-white hover:from-[#4A2284] hover:to-[#351663] focus:outline-none focus:ring-2 focus:ring-[#3B1A6D] disabled:cursor-not-allowed disabled:opacity-50'
                  data-mixpanel={`{"button_name":"Continue payment","page_name":"Transfer to card popup window","popup_window":true,"deposit_method_name":"${getMethodTitle()}","deposit_amount":"${parsedAmount || 0}","currency":"RUB"}`}
                  disabled={!isAmountValid}
                >
                  Продолжить
                </button>
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
