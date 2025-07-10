'use client';

import { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import clsx from 'clsx';
import { bankMethods, cryptoMethods } from '../../lib/data';
import { useModal } from '@/app/context/ModalContext';
import { ModalProps } from '@/app/context/ModalContext';
import { useNotification } from '@/app/context/NotificContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import { createWithdrawalRequest } from '@/app/lib/actions';

type WithdrawalRequestDialogProps = ModalProps['WithdrawalRequestDialog'] & {
  isOpen: boolean;
  onClose: () => void;
  isClosing?: boolean;
};

export function WithdrawalRequestDialog({
  isOpen,
  onClose,
  methodId,
  isClosing,
}: WithdrawalRequestDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serverTimeMs, setServerTimeMs] = useState<number | null>(null);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await fetch('/api/health');
        const serverTimeHeader = response.headers.get('Date');
        if (serverTimeHeader) {
          setServerTimeMs(new Date(serverTimeHeader).getTime());
        } else {
          throw new Error('No Date header in response');
        }
      } catch (error) {
        console.error('Ошибка при получении серверного времени:', error);
        setServerTimeMs(null);
      }
    };
    fetchServerTime();
  }, []); // Запрашиваем серверное время один раз при монтировании

  const { openModal } = useModal();
  const { showNotification } = useNotification();

  const { user, transactions } = useGlobalStore();
  const userBalance = user?.balance || 0;
  const minWithdrawal = 50;

  const selectedMethod = [...bankMethods, ...cryptoMethods].find(
    (method) => method.id === methodId,
  );
  const isCrypto = cryptoMethods.some((method) => method.id === methodId);

  const hasWithdrawalRequest = transactions.some(
    (tx) => tx.type === 'withdrawal',
  );
  const isLowBalanceRestricted = userBalance < 50 && hasWithdrawalRequest;

  const lastWithdrawal = transactions
    .filter((tx) => tx.type === 'withdrawal' && tx.status === 'approved')
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  const isWithin24Hours =
    lastWithdrawal && serverTimeMs
      ? serverTimeMs - new Date(lastWithdrawal.created_at).getTime() <
        24 * 60 * 60 * 1000
      : false;

  const isSubmitDisabled =
    isSubmitting ||
    Object.keys(errors).length > 0 ||
    isLowBalanceRestricted ||
    isWithin24Hours;

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setWalletAddress('');
      setPhoneNumber('');
      setCardNumber('');
      setBankName('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const amountNum = parseFloat(amount);
    if (
      amount &&
      (!/^\d+$/.test(amount) || isNaN(amountNum) || amountNum <= 0)
    ) {
      newErrors.amount = 'Только цифры, больше 0';
    } else if (amount && amountNum < minWithdrawal) {
      newErrors.amount = `Мин. сумма: ${minWithdrawal} RUB`;
    } else if (amount && amountNum > userBalance) {
      newErrors.amount = `Макс. сумма: ${userBalance} RUB`;
    } else if (amount && userBalance < 50 && hasWithdrawalRequest) {
      newErrors.amount = `Баланс менее 50 RUB и есть заявка на вывод`;
    }
    if (
      isCrypto &&
      walletAddress &&
      !/^[a-zA-Z0-9]{20,}$/.test(walletAddress)
    ) {
      newErrors.walletAddress = 'Неверный формат адреса';
    }
    if (!isCrypto) {
      if (phoneNumber && !/^\+7\d{10}$/.test(phoneNumber)) {
        newErrors.phoneNumber = 'Формат: +7 и 10 цифр';
      }
      if (cardNumber && !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Требуется 16 цифр';
      }
      if (bankName && !/^[a-zA-Zа-яА-Я\s-]{2,50}$/.test(bankName)) {
        newErrors.bankName = 'Только буквы, пробел, дефис, до 50 символов';
      }
    }
    setErrors(newErrors);
  }, [
    amount,
    walletAddress,
    phoneNumber,
    cardNumber,
    bankName,
    isCrypto,
    userBalance,
    hasWithdrawalRequest,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!amount) newErrors.amount = 'Введите сумму';
    if (isCrypto && !walletAddress) newErrors.walletAddress = 'Введите адрес';
    if (!isCrypto) {
      if (!phoneNumber) newErrors.phoneNumber = 'Введите номер';
      if (!cardNumber) newErrors.cardNumber = 'Введите номер карты';
      if (!bankName) newErrors.bankName = 'Укажите название банка';
    }
    if (isLowBalanceRestricted) {
      newErrors.form =
        'Вывод недоступен: баланс менее 50 RUB и есть заявка на вывод';
    }
    if (isWithin24Hours) {
      newErrors.form = 'Вывод доступен раз в 24 часа';
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys({ ...errors, ...newErrors }).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (isLowBalanceRestricted) {
        showNotification(
          'Вывод недоступен',
          'info',
          'Баланс менее 50 RUB и есть заявка на вывод',
        );
      } else if (isWithin24Hours) {
        showNotification(
          'Вывод недоступен',
          'info',
          'Вывод доступен раз в 24 часа',
        );
      }
      return;
    }
    if (!user?.telegram_id || !selectedMethod) {
      showNotification(
        'Ошибка',
        'error',
        'Отсутствуют данные пользователя или метода, обратитесь к менеджеру',
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await createWithdrawalRequest({
        telegram_id: user.telegram_id,
        amount: parseFloat(amount),
        method_id: selectedMethod.id,
        crypto_currency: isCrypto ? selectedMethod.title : undefined,
        network: isCrypto ? selectedMethod.network : undefined,
        wallet_address: isCrypto ? walletAddress : undefined,
        phone_number: !isCrypto ? phoneNumber : undefined,
        card_number: !isCrypto ? cardNumber.replace(/\s/g, '') : undefined,
        bank_name: !isCrypto ? bankName : undefined,
      });
      showNotification(
        'Успешно!',
        'success',
        'Запрос на вывод успешно отправлен',
      );
      openModal('RequestSuccessDialog', { requestType: 'withdrawal' });
      onClose();
    } catch (error) {
      console.error('Ошибка при создании запроса на вывод:', error);
      showNotification(
        'Ошибка',
        'error',
        error instanceof Error
          ? error.message
          : 'Не удалось создать запрос на вывод',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const formatted =
      digits
        .match(/.{1,4}/g)
        ?.join(' ')
        .slice(0, 19) || digits;
    return formatted;
  };

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const numValue = parseFloat(cleanValue);
    if (cleanValue === '' || (!isNaN(numValue) && numValue <= userBalance)) {
      setAmount(cleanValue);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const cleanValue = value.replace(/[^+\d]/g, '').slice(0, 12);
    setPhoneNumber(cleanValue);
  };

  const handleBankNameChange = (value: string) => {
    const cleanValue = value.replace(/[^a-zA-Zа-яА-Я\s-]/g, '').slice(0, 50);
    setBankName(cleanValue);
  };

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
          className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-3xl bg-black text-white outline-none'
          aria-describedby={undefined}
        >
          <div className='mx-auto my-2 h-1.5 w-10 rounded-full bg-zinc-600' />
          <div className='relative p-4 pb-2 md:p-6 md:pb-4'>
            <Drawer.Close
              onClick={onClose}
              className='absolute right-4 top-4 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90 md:right-6 md:top-6'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                className='h-6 w-6'
              >
                <path
                  fill='currentColor'
                  fillRule='evenodd'
                  d='M19.071 4.929a1.25 1.25 0 0 0-1.768 0L12 10.232 6.697 4.93a1.25 1.25 0 0 0-1.768 1.768L10.232 12 4.93 17.303a1.25 1.25 0 0 0 1.768 1.768L12 13.768l5.303 5.303a1.25 1.25 0 0 0 1.768-1.768L13.768 12l5.303-5.303a1.25 1.25 0 0 0 0-1.768'
                  clipRule='evenodd'
                />
              </svg>
            </Drawer.Close>
            <button
              onClick={() => {
                openModal('BottomSheet', {
                  initialActiveTab: 'Вывод',
                });
                onClose();
              }}
              className='mb-3 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                className='h-4 w-4'
              >
                <path
                  fill='currentColor'
                  fillRule='evenodd'
                  d='M15 19.998c-.29 0-.59-.11-.81-.33l-6.85-6.86a1.14 1.14 0 0 1 0-1.62l6.85-6.85a1.14 1.14 0 0 1 1.62 0c.45.45.45 1.17 0 1.62l-6.05 6.05 6.05 6.05a1.14 1.14 0 0 1-.81 1.95z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Назад</span>
            </button>
          </div>
          <div className='relative flex min-w-0 max-w-full grow flex-col overflow-y-auto px-4 md:px-6'>
            <Drawer.Title className='mb-4 text-xl font-semibold tracking-tight text-white md:text-2xl'>
              Вывод средств
            </Drawer.Title>
            <div className='flex grow flex-col pb-6'>
              <div className='mb-6 flex max-w-full flex-col gap-4 rounded-2xl bg-zinc-900 p-4'>
                <div className='flex flex-col'>
                  <label className='mb-2 text-sm font-medium text-gray-300'>
                    Сумма вывода
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder='Введите сумму'
                      className={clsx(
                        'h-12 w-full rounded-xl bg-zinc-800 px-4 text-base text-white outline-none transition-all',
                        errors.amount
                          ? 'border border-red-500'
                          : 'border border-transparent focus:border-transparent',
                      )}
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-base text-gray-400'>
                      RUB
                    </span>
                  </div>
                  {errors.amount && (
                    <p className='mt-1 text-sm text-red-500'>{errors.amount}</p>
                  )}
                  <p className='mt-1 text-sm text-gray-400'>
                    Доступный баланс: {userBalance} RUB
                  </p>
                </div>

                {isCrypto ? (
                  <div className='flex flex-col'>
                    <label className='mb-2 text-sm font-medium text-gray-300'>
                      Адрес кошелька
                    </label>
                    <input
                      type='text'
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder='Введите адрес кошелька'
                      className={clsx(
                        'h-12 w-full rounded-xl bg-zinc-800 px-4 text-base text-white outline-none transition-all',
                        errors.walletAddress
                          ? 'border border-red-500'
                          : 'border border-transparent focus:border-transparent',
                      )}
                    />
                    {errors.walletAddress && (
                      <p className='mt-1 text-sm text-red-500'>
                        {errors.walletAddress}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className='flex flex-col'>
                      <label className='mb-2 text-sm font-medium text-gray-300'>
                        Номер телефона
                      </label>
                      <input
                        type='text'
                        value={phoneNumber}
                        onChange={(e) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                        placeholder='+79991234567'
                        className={clsx(
                          'h-12 w-full rounded-xl bg-zinc-800 px-4 text-base text-white outline-none transition-all',
                          errors.phoneNumber
                            ? 'border border-red-500'
                            : 'border border-transparent focus:border-transparent',
                        )}
                        maxLength={12}
                      />
                      {errors.phoneNumber && (
                        <p className='mt-1 text-sm text-red-500'>
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className='flex flex-col'>
                      <label className='mb-2 text-sm font-medium text-gray-300'>
                        Номер карты
                      </label>
                      <input
                        type='text'
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder='1234 5678 9012 3456'
                        className={clsx(
                          'h-12 w-full rounded-xl bg-zinc-800 px-4 text-base text-white outline-none transition-all',
                          errors.cardNumber
                            ? 'border border-red-500'
                            : 'border border-transparent focus:border-transparent',
                        )}
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className='mt-1 text-sm text-red-500'>
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className='flex flex-col'>
                      <label className='mb-2 text-sm font-medium text-gray-300'>
                        Название банка
                      </label>
                      <input
                        type='text'
                        value={bankName}
                        onChange={(e) => handleBankNameChange(e.target.value)}
                        placeholder='Укажите название банка'
                        className={clsx(
                          'h-12 w-full rounded-xl bg-zinc-800 px-4 text-base text-white outline-none transition-all',
                          errors.bankName
                            ? 'border border-red-500'
                            : 'border border-transparent focus:border-transparent',
                        )}
                        maxLength={50}
                      />
                      {errors.bankName && (
                        <p className='mt-1 text-sm text-red-500'>
                          {errors.bankName}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <p className='md:text-2lg mb-3 text-base font-semibold tracking-tight text-white'>
                Важная информация
              </p>
              <div className='flex flex-row gap-2'>
                {isCrypto ? (
                  <>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 25'
                        className='mb-spacing-12 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M21.645 3.236a.75.75 0 0 0-.686-.46l-.006-.003H18.06a.75.75 0 0 0 0 1.5h1.083l-2.627 2.63a.751.751 0 0 0 1.062 1.061l2.625-2.628v1.088a.75.75 0 0 0 1.5 0v-2.9a.8.8 0 0 0-.058-.288'
                          clipRule='evenodd'
                        />
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M13.492 4.7a6.345 6.345 0 0 0 7.313 6.272.303.303 0 0 1 .349.24q.142.8.143 1.64c0 5.238-4.262 9.5-9.5 9.5-5.24 0-9.5-4.262-9.5-9.5s4.26-9.5 9.5-9.5q.773.002 1.514.124a.303.303 0 0 1 .245.347c-.04.287-.064.58-.064.878m-1.475 4.31a.97.97 0 0 0-.582.204L8.7 11.34a.933.933 0 1 0 1.174 1.45l1.334-1.124-.085 6.421a.9.9 0 1 0 1.802.02l.067-8.124a.965.965 0 0 0-.975-.972'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Адрес должен быть в сети{' '}
                        {selectedMethod?.network || 'криптовалюты'}
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 25 25'
                        className='mr-2 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M15.541 15.696a.747.747 0 0 1-1.06-.002l-1.514-1.519-1.509 1.514a.75.75 0 1 1-1.063-1.058l1.512-1.518-1.513-1.519a.751.751 0 0 1 1.062-1.059l1.511 1.515 1.51-1.514a.749.749 0 1 1 1.061 1.059l-1.513 1.518 1.518 1.522a.75.75 0 0 1-.002 1.061m4.146-9.321a9.42 9.42 0 0 0-6.717-2.79c-2.539 0-4.927.99-6.72 2.79-2.806 2.815-3.57 7.136-1.913 10.73.191.477.316.81.316 1.091c0 .333-.14.749-.278 1.151-.265.779-.565 1.662.077 2.307.65.649 1.531.346 2.313.075.396-.137.806-.279 1.13-.281.292 0 .658.147 1.081.319a9.527 9.527 0 0 0 10.711-1.915c3.703-3.717 3.703-9.762 0-13.477'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Регламент на вывод средств до 24 часов
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 25 24'
                        className='mr-2 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M14.784 10.052h2.2v-1.7h-2.2z'
                          clipRule='evenodd'
                        />
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M18.484 10.198a.8.8 0 0 1-.023.182c-.27 1.084-1.083 1.168-1.327 1.168h-2.5a1.32 1.32 0 0 1-1.35-1.35v-2c0-.77.58-1.35 1.35-1.35h2.5c.77 0 1.35.58 1.35 1.35zm-5.15 6.45h-6.3a.75.75 0 0 1 0-1.5h6.3a.75.75 0 0 1 0 1.5m-6.3-4.4h2.7a.75.75 0 0 1 0 1.5h-2.7a.75.75 0 0 1 0-1.5m9.7-8.85h-8.8c-2.955 0-5.1 2.314-5.1 5.5v6.2c0 3.135 2.192 5.5 5.1 5.5h8.8c2.954 0 5.1-2.314 5.1-5.5v-6.2c0-3.136-2.193-5.5-5.1-5.5'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Ошибка адреса — потеря средств
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 25'
                        className='mb-spacing-12 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M21.645 3.236a.75.75 0 0 0-.686-.46l-.006-.003H18.06a.75.75 0 0 0 0 1.5h1.083l-2.627 2.63a.751.751 0 0 0 1.062 1.061l2.625-2.628v1.088a.75.75 0 0 0 1.5 0v-2.9a.8.8 0 0 0-.058-.288'
                          clipRule='evenodd'
                        />
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M13.492 4.7a6.345 6.345 0 0 0 7.313 6.272.303.303 0 0 1 .349.24q.142.8.143 1.64c0 5.238-4.262 9.5-9.5 9.5-5.24 0-9.5-4.262-9.5-9.5s4.26-9.5 9.5-9.5q.773.002 1.514.124a.303.303 0 0 1 .245.347c-.04.287-.064.58-.064.878m-1.475 4.31a.97.97 0 0 0-.582.204L8.7 11.34a.933.933 0 1 0 1.174 1.45l1.334-1.124-.085 6.421a.9.9 0 1 0 1.802.02l.067-8.124a.965.965 0 0 0-.975-.972'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Карта должна принадлежать вам
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 25 25'
                        className='mr-2 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M15.541 15.696a.747.747 0 0 1-1.06-.002l-1.514-1.519-1.509 1.514a.75.75 0 1 1-1.063-1.058l1.512-1.518-1.513-1.519a.751.751 0 0 1 1.062-1.059l1.511 1.515 1.51-1.514a.749.749 0 1 1 1.061 1.059l-1.513 1.518 1.518 1.522a.75.75 0 0 1-.002 1.061m4.146-9.321a9.42 9.42 0 0 0-6.717-2.79c-2.539 0-4.927.99-6.72 2.79-2.806 2.815-3.57 7.136-1.913 10.73.191.477.316.81.316 1.091c0 .333-.14.749-.278 1.151-.265.779-.565 1.662.077 2.307.65.649 1.531.346 2.313.075.396-.137.806-.279 1.13-.281.292 0 .658.147 1.081.319a9.527 9.527 0 0 0 10.711-1.915c3.703-3.717 3.703-9.762 0-13.477'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Регламент на вывод средств до 24ч
                      </p>
                    </div>
                    <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 25 24'
                        className='mr-2 size-6 flex-shrink-0 text-yellow-500'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M14.784 10.052h2.2v-1.7h-2.2z'
                          clipRule='evenodd'
                        />
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M18.484 10.198a.8.8 0 0 1-.023.182c-.27 1.084-1.083 1.168-1.327 1.168h-2.5a1.32 1.32 0 0 1-1.35-1.35v-2c0-.77.58-1.35 1.35-1.35h2.5c.77 0 1.35.58 1.35 1.35zm-5.15 6.45h-6.3a.75.75 0 0 1 0-1.5h6.3a.75.75 0 0 1 0 1.5m-6.3-4.4h2.7a.75.75 0 0 1 0 1.5h-2.7a.75.75 0 0 1 0-1.5m9.7-8.85h-8.8c-2.955 0-5.1 2.314-5.1 5.5v6.2c0 3.135 2.192 5.5 5.1 5.5h8.8c2.954 0 5.1-2.314 5.1-5.5v-6.2c0-3.136-2.193-5.5-5.1-5.5'
                          clipRule='evenodd'
                        />
                      </svg>
                      <p className='text-xs text-white'>
                        Проверьте данные карты и телефона
                      </p>
                    </div>
                  </>
                )}
              </div>

              <button
                className={clsx(
                  'mb-10 mt-6 flex h-12 w-full items-center justify-center rounded-xl text-white transition-all duration-300',
                  isSubmitDisabled
                    ? 'cursor-not-allowed bg-gray-600'
                    : 'bg-violet-950 hover:bg-blue-600 focus:bg-blue-600 active:bg-indigo-500',
                )}
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                <span className='truncate text-sm font-semibold'>
                  {isSubmitting ? 'Обработка...' : 'Готово'}
                </span>
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
