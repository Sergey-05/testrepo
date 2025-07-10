'use client';

import { useState, useRef, useEffect } from 'react';
import { Drawer } from 'vaul';
import { ChevronLeft, X } from 'lucide-react';
import { useModal } from '@/app/context/ModalContext';
import { ModalProps } from '@/app/context/ModalContext';
import { useNotification } from '@/app/context/NotificContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import clsx from 'clsx';
import { createCryptoDepositTransaction } from '@/app/lib/actions';
import { cryptoMethods } from '@/app/lib/data';

type CryptoPaymentDialogProps = ModalProps['CryptoPaymentDialog'] & {
  isOpen: boolean;
  onClose: () => void;
  isClosing?: boolean; // Добавляем isClosing
};

export function CryptoPaymentDialog({
  isOpen,
  onClose,
  method,
  selectedAmount,
  isClosing,
}: CryptoPaymentDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [addressRipples, setAddressRipples] = useState<
    { id: number; left: number; top: number }[]
  >([]);
  const [amountRipples, setAmountRipples] = useState<
    { id: number; left: number; top: number }[]
  >([]);
  const addressButtonRef = useRef<HTMLButtonElement>(null);
  const amountButtonRef = useRef<HTMLButtonElement>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(100); // Заглушка
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { openModal } = useModal();
  const { showNotification } = useNotification();
  const { bonuses, cryptoWallets, transactions, user } = useGlobalStore();

  const selectedWallet = cryptoWallets.find(
    (wallet) => wallet.currency_code.toLowerCase() === method.id.toLowerCase(),
  );

  const hasPendingDeposit = transactions.some(
    (tx) => tx.type === 'deposit' && tx.status === 'in_process',
  );
  const isSubmitDisabled = isSubmitting || hasPendingDeposit || !selectedWallet;

  const getBonus = (
    amount: number,
  ): { bonusAmount: number; percentage: number } | null => {
    for (const bonus of bonuses) {
      if (
        amount >= bonus.min_deposit &&
        (!bonus.max_deposit || amount <= bonus.max_deposit)
      ) {
        const bonusAmount = (amount * bonus.percentage) / 100;
        return { bonusAmount, percentage: bonus.percentage };
      }
    }
    return null;
  };

  // Сумма в RUB
  const numericAmount = selectedAmount || 0;
  // Конверсия в криптовалюту
  const convertedAmount = (numericAmount / exchangeRate).toFixed(6);
  // Бонус
  const bonus = getBonus(numericAmount);
  // Бонусный счет в криптовалюте
  const bonusAmountCrypto = bonus
    ? (bonus.bonusAmount / exchangeRate).toFixed(6)
    : '0.000000';

  // Загрузка курса с CoinGecko
  useEffect(() => {
    if (!isOpen) return;

    const fetchExchangeRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const coinIds: Record<string, string> = {
          BTC: 'bitcoin',
          Ton: 'the-open-network',
          USDT: 'tether',
        };
        const coinId = coinIds[method.title] || 'tether';
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=rub`,
        );
        if (!response.ok) throw new Error('Ошибка загрузки курса');
        const data = await response.json();
        const rate = data[coinId].rub;
        if (!rate || typeof rate !== 'number') {
          throw new Error('Некорректный курс');
        }
        setExchangeRate(rate);
      } catch (err) {
        console.error('Ошибка загрузки курса:', err);
        setError('Не удалось загрузить курс. Используется курс по умолчанию.');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate().then(() => {
      if (error) {
        showNotification('Непредвиденная ошибка', 'error', 'Попробуйте позже');
        onClose();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, method.title]); // Убраны showNotification и onClose

  // Обработка фокуса и Escape
  useEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const copyToClipboard = async (
    text: string,
    setRipples: React.Dispatch<
      React.SetStateAction<{ id: number; left: number; top: number }[]>
    >,
    type: 'address' | 'amount',
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      const newRipples = [{ id: Date.now(), left: -6.2, top: -7 }];
      setRipples(newRipples);
      setTimeout(() => setRipples([]), 800);
      showNotification(
        'Реквизиты скопированы!',
        'success',
        `Скопирован${type === 'address' ? ' адрес' : 'а сумма'} ${text}`,
      );
    } catch (err) {
      console.error('Ошибка копирования:', err);
      showNotification(
        'Ошибка копирования',
        'error',
        'Не удалось скопировать реквизиты',
      );
    }
  };

  const handlePaymentConfirmation = async () => {
    if (hasPendingDeposit) {
      showNotification(
        'Пополнение недоступно',
        'info',
        'Есть необработанная заявка на пополнение',
      );
      return;
    }
    if (!selectedWallet || !user?.telegram_id) {
      showNotification(
        'Ошибка',
        'error',
        'Отсутствуют реквизиты кошелька или пользователь, обратитесь к менеджеру',
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await createCryptoDepositTransaction({
        telegram_id: user.telegram_id,
        amount: numericAmount,
        converted_amount: convertedAmount,
        crypto_currency: method.title,
        network: method.network,
        wallet_address: selectedWallet.wallet_address,
      });
      showNotification(
        'Заявка создана',
        'success',
        'Заявка на пополнение успешно отправлена',
      );
      openModal('RequestSuccessDialog', { requestType: 'deposit' });
      onClose();
    } catch (error) {
      console.error('Ошибка при создании криптовалютной транзакции:', error);
      showNotification(
        'Ошибка',
        'error',
        error instanceof Error
          ? error.message
          : 'Не удалось создать транзакцию',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMethod = cryptoMethods.find((m) => m.id === method.id);
  const MethodIcon = selectedMethod?.icon;

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen && !isClosing}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' />
        <Drawer.Content
          ref={dialogRef}
          role='dialog'
          aria-modal='true'
          aria-describedby={undefined}
          className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-2xl bg-zinc-900 text-white outline-none'
          style={{ pointerEvents: 'auto' }}
        >
          <div className='relative p-4 pb-2 md:p-6 md:pb-4'>
            <Drawer.Close
              onClick={onClose}
              className='absolute right-4 top-4 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90 md:right-6 md:top-6'
            >
              <X size={20} />
            </Drawer.Close>
            <button
              onClick={() => {
                openModal('CardTransferDialog', { methodId: method.id });
                onClose();
              }}
              className='mb-3 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90'
            >
              <ChevronLeft className='h-4 w-4' />
              <span>Назад</span>
            </button>
            <Drawer.Description
              id='crypto-payment-description'
              className='sr-only'
            >
              Диалог для пополнения кошелька через криптовалюту
            </Drawer.Description>
          </div>
          <div className='relative flex min-w-0 max-w-full grow flex-col overflow-y-auto px-4 md:px-6'>
            <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
              Криптовалютный платеж
            </Drawer.Title>
            {loading ? (
              <div className='flex grow flex-col items-center justify-center'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 17 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='mr-2 h-6 w-6 animate-spin text-white'
                >
                  <path
                    d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
                    fill='currentColor'
                  />
                </svg>
              </div>
            ) : (
              <>
                <div className='flex grow flex-col pb-4'>
                  <div className='mb-4 flex max-w-full flex-col gap-0.5 overflow-hidden px-2'>
                    <div className='flex items-center gap-3 rounded-t-xl bg-zinc-800 py-3 pl-4 pr-3'>
                      {MethodIcon && <MethodIcon className='size-6' />}

                      <div className='flex shrink flex-col overflow-hidden break-words'>
                        <p className='mb-1 text-xs text-gray-400'>Сумма</p>
                        <p className='text-sm font-semibold text-white'>
                          {convertedAmount} {method.title}
                        </p>
                      </div>
                      <div className='ml-auto shrink-0'>
                        <button
                          ref={amountButtonRef}
                          className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
                          onClick={() =>
                            copyToClipboard(
                              convertedAmount,
                              setAmountRipples,
                              'amount',
                            )
                          }
                        >
                          {amountRipples.map((ripple, index) => (
                            <span
                              key={ripple.id}
                              className='ripple-span'
                              style={{
                                left: `calc(50% + ${ripple.left}px)`,
                                top: `calc(50% + ${ripple.top}px)`,
                                animationDelay: `${index * 0.05}s`,
                              }}
                            />
                          ))}
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            className='h-4 w-4 shrink-0'
                          >
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M15.5 5.8c.01.166-.124.3-.29.3l-3.27.01c-2.87 0-4.95 2.15-4.95 5.1v4.88a.285.285 0 0 1-.3.29c-1.943-.135-3.27-1.581-3.27-3.59V6.1c0-2.15 1.38-3.6 3.45-3.6h5.19c1.962 0 3.317 1.316 3.44 3.3m-3.56 1.813h5.195c2.06 0 3.446 1.445 3.446 3.596v6.695c0 2.15-1.385 3.596-3.447 3.596H11.94c-2.061 0-3.446-1.446-3.446-3.596V11.21c0-2.15 1.385-3.596 3.446-3.596'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-none bg-zinc-800 py-3 pl-4 pr-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='h-6 w-6 shrink-0 text-gray-400'
                      >
                        <path
                          fill='currentColor'
                          d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m2 11.4-1.564 1.251a.5.5 0 0 0-.041.744l1.239 1.239a2 2 0 0 1 .508.864l.175.613a1.8 1.8 0 0 0 1.017 1.163 8 8 0 0 0 2.533-1.835l-.234-1.877a2 2 0 0 0-1.09-1.54l-1.47-.736A1 1 0 0 0 14 13.4M12 4a7.99 7.99 0 0 0-6.335 3.114l-.165.221V9.02a3 3 0 0 0 1.945 2.809l.178.06 1.29.395c1.373.42 2.71-.697 2.577-2.096l-.019-.145-.175-1.049a1 1 0 0 1 .656-1.108l.108-.03.612-.140a2.667 2.667 0 0 0 1.989-3.263A8 8 0 0 0 12 4'
                        />
                      </svg>
                      <div className='flex shrink flex-col overflow-hidden break-words'>
                        <p className='mb-1 text-xs text-gray-400'>
                          Ваш постоянный адрес
                        </p>
                        <p className='text-sm font-semibold text-white'>
                          {selectedWallet
                            ? selectedWallet.wallet_address
                            : 'Кошелек не найден'}
                        </p>
                      </div>
                      <div className='ml-auto shrink-0'>
                        <button
                          ref={addressButtonRef}
                          className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
                          onClick={() =>
                            selectedWallet
                              ? copyToClipboard(
                                  selectedWallet.wallet_address,
                                  setAddressRipples,
                                  'address',
                                )
                              : showNotification(
                                  'Ошибка',
                                  'error',
                                  'Адрес кошелька не найден',
                                )
                          }
                        >
                          {addressRipples.map((ripple, index) => (
                            <span
                              key={ripple.id}
                              className='ripple-span'
                              style={{
                                left: `calc(50% + ${ripple.left}px)`,
                                top: `calc(50% + ${ripple.top}px)`,
                                animationDelay: `${index * 0.05}s`,
                              }}
                            />
                          ))}
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            className='h-4 w-4 shrink-0'
                          >
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M15.5 5.8c.01.166-.124.3-.29.3l-3.27.01c-2.87 0-4.95 2.15-4.95 5.1v4.88a.285.285 0 0 1-.3.29c-1.943-.135-3.27-1.581-3.27-3.59V6.1c0-2.15 1.38-3.6 3.45-3.6h5.19c1.962 0 3.317 1.316 3.44 3.3m-3.56 1.813h5.195c2.06 0 3.446 1.445 3.446 3.596v6.695c0 2.15-1.385 3.596-3.447 3.596H11.94c-2.061 0-3.446-1.446-3.446-3.596V11.21c0-2.15 1.385-3.596 3.446-3.596'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-b-xl bg-zinc-800 py-3 pl-4 pr-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='h-6 w-6 shrink-0 text-gray-400'
                      >
                        <path
                          fill='#9FA5AC'
                          d='M12 8.657a1 1 0 0 1 1 1v9h2a1 1 0 1 1 0 2H9a1 1 0 0 1 0-2h2v-9a1 1 0 0 1 1-1M7.05 3.293a1 1 0 0 1 0 1.414A6.98 6.98 0 0 0 5 9.657c0 1.933.782 3.682 2.05 4.95a1 1 0 0 1-1.414 1.414A8.97 8.97 0 0 1 3 9.657a8.98 8.98 0 0 1 2.636-6.364 1 1 0 0 1 1.414 0m11.314 0A8.98 8.98 0 0 1 21 9.657a8.98 8.98 0 0 1-2.636 6.364 1 1 0 0 1-1.414-1.414A6.98 6.98 0 0 0 19 9.657a6.97 6.97 0 0 0-2.05-4.95 1 1 0 0 1 1.414-1.414M9.879 6.12a1 1 0 0 1 0 1.415A2.99 2.99 0 0 0 9 9.656c0 .83.335 1.578.879 2.122a1 1 0 0 1-1.415 1.415A5 5 0 0 1 7 9.657c0-1.38.56-2.632 1.464-3.536a1 1 0 0 1 1.415 0m5.657 0A4.99 4.99 0 0 1 17 9.657c0 1.38-.56 2.632-1.464 3.536a1 1 0 0 1-1.415-1.415A2.99 2.99 0 0 0 15 9.657c0-.83-.335-1.577-.879-2.121a1 1 0 0 1 1.415-1.415'
                        />
                      </svg>
                      <div className='flex shrink flex-col overflow-hidden break-words'>
                        <p className='mb-1 text-xs text-gray-400'>Сеть</p>
                        <p className='text-sm font-semibold text-white'>
                          {method.network}
                        </p>
                      </div>
                      <div className='ml-auto shrink-0'>
                        <button
                          className='flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 focus:bg-zinc-600'
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (selectedWallet) {
                              openModal('QRCodeDialog', {
                                walletAddress: selectedWallet.wallet_address,
                              });
                              e.currentTarget.blur();
                            } else {
                              showNotification(
                                'Ошибка',
                                'error',
                                'Адрес кошелька не найден',
                              );
                            }
                          }}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 16 16'
                            className='h-4 w-4 shrink-0'
                          >
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M5.833 5.266a.57.57 0 0 1-.567.567H3.234a.57.57 0 0 1-.568-.567V3.234c0-.314.255-.568.568-.568h2.032c.313 0 .567.254.567.568zm-.567-3.933H3.234c-1.048 0-1.901.853-1.901 1.9v2.033c0 1.048.853 1.9 1.9 1.9h2.033c1.048 0 1.9-.852 1.9-1.9V3.234c0-1.048-.852-1.901-1.9-1.901'
                              clipRule='evenodd'
                            />
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M4.25 3.589a.67.67 0 0 0-.667.67.667.667 0 0 0 1.334 0v-.007a.664.664 0 0 0-.667-.663M4.25 11.089a.67.67 0 0 0-.667.67.667.667 0 0 0 1.334 0v-.008a.663.663 0 0 0-.667-.662'
                              clipRule='evenodd'
                            />
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M5.833 12.766a.57.57 0 0 1-.567.567H3.234a.57.57 0 0 1-.568-.567v-2.032c0-.314.255-.568.568-.568h2.032c.313 0 .567.254.567.568zm-.567-3.933H3.234c-1.048 0-1.901.853-1.901 1.9v2.033c0 1.048.853 1.9 1.9 1.9h2.033c1.048 0 1.9-.852 1.9-1.9v-2.032c0-1.048-.852-1.901-1.9-1.901M13.333 12.766a.57.57 0 0 1-.567.567h-2.032a.57.57 0 0 1-.568-.567v-2.032c0-.314.255-.568.568-.568h2.032c.313 0 .567.254.567.568zm-.567-3.933h-2.032c-1.048 0-1.901.853-1.901 1.9v2.033c0 1.048.853 1.9 1.9 1.9h2.033c1.048 0 1.9-.852 1.9-1.9v-2.032c0-1.048-.852-1.901-1.9-1.901'
                              clipRule='evenodd'
                            />
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M11.75 11.075a.667.667 0 0 0-.667.667v.007c0 .368.299.663.667.663a.70.70 0 0 0 .667-.70.667.667 0 0 0-.667-.667M9.5 2.673a.667.667 0 0 0 .667-.666v-.008a.663.663 0 0 0-.667-.663.67.67 0 0 0-.667.67c0 .369.299.667.667.667M13.02 1.333h-1.27a.666.666 0 1 0 0 1.333h1.27c.173 0 .314.141.314.314v1.27a.666.666 0 1 0 1.333 0V2.98c0-.908-.739-1.647-1.647-1.647M14 5.833h-2.25a.667.667 0 0 0 0 1.333H14a.667.667 0 0 0 0-1.333M9.5 7.166a.667.667 0 0 0 .667-.666V5.23c0-.173.14-.314.314-.314h1.269a.667.667 0 0 0 0-1.333h-1.27c-.908 0-1.647.739-1.647 1.647V6.5c0 .368.299.666.667.666'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className='mb-4 flex gap-2'>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='mb-2 h-6 w-6 shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          d='M10.628 3.353a2.85 2.85 0 0 1 3.85 1.09l7.268 12.614c.16.377.23.683.25 1.001a2.76 2.76 0 0 1-.73 2.021c-.51.554-1.2.881-1.95.921H4.68c-.31-.019-.62-.09-.91-.198-1.45-.585-2.15-2.23-1.56-3.656L9.53 4.433a2.73 2.73 0 0 1 1.099-1.08m1.37 11.92c-.48 0-.88.396-.88.873 0 .474.4.872.88.872s.87-.398.87-.883a.867.867 0 0 0-.87-.862m0-6.183c-.48 0-.88.386-.88.862v2.804c0 .475.4.873.88.873s.87-.398.87-.873V9.952a.866.866 0 0 0-.87-.862'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Перевод только {method.title} ({method.network})
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='mb-2 h-6 w-6 shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          d='M10.628 3.353a2.85 2.85 0 0 1 3.85 1.09l7.268 12.614c.16.377.23.683.25 1.001a2.76 2.76 0 0 1-.73 2.021c-.51.554-1.2.881-1.95.921H4.68c-.31-.019-.62-.09-.91-.198-1.45-.585-2.15-2.23-1.56-3.656L9.53 4.433a2.73 2.73 0 0 1 1.099-1.08m1.37 11.92c-.48 0-.88.396-.88.873 0 .474.4.872.88.872s.87-.398.87-.883a.867.867 0 0 0-.87-.862m0-6.183c-.48 0-.88.386-.88.862v2.804c0 .475.4.873.88.873s.87-.398.87-.873V9.952a.866.866 0 0 0-.87-.862'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Обязательно подтвердите перевод кнопкой ниже
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='mb-2 h-6 w-6 shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          d='M10.628 3.353a2.85 2.85 0 0 1 3.85 1.09l7.268 12.614c.16.377.23.683.25 1.001a2.76 2.76 0 0 1-.73 2.021c-.51.554-1.2.881-1.95.921H4.68c-.31-.019-.62-.09-.91-.198-1.45-.585-2.15-2.23-1.56-3.656L9.53 4.433a2.73 2.73 0 0 1 1.099-1.08m1.37 11.92c-.48 0-.88.396-.88.873 0 .474.4.872.88.872s.87-.398.87-.883a.867.867 0 0 0-.87-.862m0-6.183c-.48 0-.88.386-.88.862v2.804c0 .475.4.873.88.873s.87-.398.87-.873V9.952a.866.866 0 0 0-.87-.862'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Переводите точную сумму
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                      <p className='py-0.5 text-sm text-gray-400'>
                        К пополнению
                      </p>
                      <p className='text-base font-semibold text-white'>
                        {convertedAmount} {method.title}
                      </p>
                    </div>
                    {bonus && (
                      <div className='flex justify-between'>
                        <p className='py-0.5 text-sm text-gray-400'>
                          Бонусный счет
                        </p>
                        <p className='flex items-center text-base font-semibold text-indigo-500'>
                          {bonusAmountCrypto} {method.title}
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            className='ml-1 h-4 w-4'
                          >
                            <path
                              fill='currentColor'
                              fillRule='evenodd'
                              d='M11.272 6.5c-.407-1.151-1.327-3-3.053-3-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5zM17.82 5c0-.827-.673-1.5-1.501-1.5-1.725 0-2.646 1.849-3.052 3h3.052c.828 0 1.501-.673 1.501-1.5m.9 1.78h.436a2.38 2.38 0 0 1 2.377 2.38v.81a2.27 2.27 0 0 1-2.27 2.27H5.378A2.377 2.377 0 0 1 3 9.87v-.82a2.273 2.273 0 0 1 2.272-2.27h.546A2.97 2.97 0 0 1 5.219 5c0-1.654 1.346-3 3-3 2.123 0 3.365 1.592 4.05 2.999C12.954 3.592 14.196 2 16.319 2a3.005 3.005 0 0 1 3.001 3c0 .669-.228 1.281-.6 1.78M4.845 13.538a.3.3 0 0 0-.3.3v4.442a2.974 2.974 0 0 0 2.97 2.97h3.703a.3.3 0 0 0 .3-.3v-7.112a.3.3 0 0 0-.3-.3zm8.473 0a.3.3 0 0 0-.3.3v7.452a.3.3 0 0 0 .3.3h3.704a2.973 2.973 0 0 0 2.969-2.97v-4.442a.3.3 0 0 0-.3-.3'
                            />
                          </svg>
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handlePaymentConfirmation}
                    className={clsx(
                      'mb-6 mt-4 flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#3B1A6D] to-[#2A104F] px-5 text-sm font-semibold text-white',
                      isSubmitDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:from-[#4A2284] hover:to-[#351663] focus:outline-none focus:ring-2 focus:ring-[#3B1A6D]',
                    )}
                    data-mixpanel={`{"button_name":"Confirm payment","page_name":"Crypto payment popup window","popup_window":true,"deposit_method_name":"${method.title}","deposit_amount":"${convertedAmount}","currency":"${method.title}"}`}
                    disabled={isSubmitDisabled}
                  >
                    <span className='truncate text-sm font-semibold'>
                      {isSubmitting ? 'Обработка...' : 'Я оплатил'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
