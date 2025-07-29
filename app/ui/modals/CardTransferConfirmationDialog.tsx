// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Drawer } from 'vaul';
// import { useModal } from '@/app/context/ModalContext';
// import { useNotification } from '@/app/context/NotificContext'; // Добавляем импорт
// import useGlobalStore from '@/app/store/useGlobalStore';
// import clsx from 'clsx';
// import { createCardDepositTransaction } from '@/app/lib/actions';
// import { useWebApp } from '@/app/lib/hooks/useWebApp';
// import { AlertCircle, MessageSquare } from 'lucide-react';

// type SelectedCardType = {
//   card_number: string;
//   bank_name: string;
//   min_amount: number;
//   max_amount: number;
//   wallet_owner?: string;
// };

// type CardTransferConfirmationDialogProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   isClosing?: boolean;
//   amount: number;
//   methodId: string;
// };

// export function CardTransferConfirmationDialog({
//   isOpen,
//   methodId,
//   amount,
//   isClosing,
//   onClose,
// }: CardTransferConfirmationDialogProps) {
//   const dialogRef = useRef<HTMLDivElement>(null);
//   const amountButtonRef = useRef<HTMLButtonElement>(null);
//   const cardButtonRef = useRef<HTMLButtonElement>(null);
//   const bankButtonRef = useRef<HTMLButtonElement>(null);
//   const [isLoadingCard, setIsLoadingCard] = useState(false);
//   const [cardError, setCardError] = useState<string | null>(null);
//   const [selectedCard, setSelectedCard] = useState<
//     SelectedCardType | undefined
//   >(undefined); // Замените тип `any` на ваш интерфейс карты
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [randomAdd, setRandomAdd] = useState(0);
//   const [ripplesAmount, setRipplesAmount] = useState<
//     { id: number; left: number; top: number }[]
//   >([]);
//   const [ripplesCard, setRipplesCard] = useState<
//     { id: number; left: number; top: number }[]
//   >([]);
//   const [ripplesBank, setRipplesBank] = useState<
//     { id: number; left: number; top: number }[]
//   >([]);

//   const { openModal } = useModal();
//   const { showNotification } = useNotification(); // Добавляем хук
//   const { cards, transactions, user, appConfig } = useGlobalStore();
//   const WebApp = useWebApp();

//   useEffect(() => {
//     if (isOpen) {
//       const newRandomAdd = Math.floor(Math.random() * 15) + 1;
//       setRandomAdd(newRandomAdd);
//     }
//   }, [isOpen]);

//   const adjustedAmount = amount + randomAdd;

//   useEffect(() => {
//     const fetchCardDetails = async () => {
//       setIsLoadingCard(true);
//       setCardError(null);

//       try {
//         const response = await fetch('/api/reqs', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             telegram_id: user?.telegram_id,
//             amount: adjustedAmount,
//           }),
//         });

//         const data = await response.json();

//         if (data.error || data.status === 'processing') {
//           setCardError(
//             'Не удалось получить реквизиты. Попробуйте позже или свяжитесь с менеджером.',
//           );
//           throw new Error(
//             data.error || 'Система обрабатывает запрос. Попробуйте позже.',
//           );
//         }

//         setSelectedCard({
//           card_number: data.card,
//           bank_name: data.sbp_bank,
//           min_amount: 0,
//           max_amount: Infinity,
//           wallet_owner: data.wallet_owner,
//         });
//       } catch (error) {
//         console.error('Ошибка получения реквизитов:', error);
//         setCardError(
//           'Не удалось получить реквизиты. Попробуйте позже или свяжитесь с менеджером.',
//         );
//       } finally {
//         setIsLoadingCard(false);
//       }
//     };

//     if (!user?.telegram_id) {
//       setSelectedCard(undefined);
//       return;
//     }

//     const useApiForCard = appConfig?.useapiforcard ?? true;
//     const isAmountInApiRange = adjustedAmount >= 1500 && adjustedAmount < 10000;

//     if (isAmountInApiRange && useApiForCard) {
//       fetchCardDetails();
//     } else {
//       const card = cards.find(
//         (card) =>
//           card.min_amount <= adjustedAmount &&
//           adjustedAmount <= card.max_amount,
//       );
//       setSelectedCard(card);
//       setIsLoadingCard(false);
//       setCardError(card ? null : 'Подходящая карта не найдена.');
//     }
//   }, [adjustedAmount, user?.telegram_id, cards, appConfig]);

//   const hasPendingDeposit = transactions.some(
//     (tx) => tx.type === 'deposit' && tx.status === 'in_process',
//   );
//   const isSubmitDisabled = isSubmitting || hasPendingDeposit || !selectedCard;

//   // Копирование текста
//   const copyToClipboard = async (
//     text: string,
//     buttonType: 'amount' | 'card' | 'bank',
//   ) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       const newRipple = [{ id: Date.now(), left: -6.2, top: -7 }];
//       if (buttonType === 'amount') {
//         setRipplesAmount(newRipple);
//         setTimeout(() => setRipplesAmount([]), 800);
//         showNotification(
//           'Сумма скопирована!',
//           'success',
//           'Сумма перевода скопирована в буфер обмена',
//         );
//       } else if (buttonType === 'card') {
//         setRipplesCard(newRipple);
//         setTimeout(() => setRipplesCard([]), 800);
//         showNotification(
//           'Номер карты скопирован!',
//           'success',
//           'Номер карты скопирован в буфер обмена',
//         );
//       } else if (buttonType === 'bank') {
//         setRipplesBank(newRipple);
//         setTimeout(() => setRipplesBank([]), 800);
//         showNotification(
//           'Банк скопирован!',
//           'success',
//           'Информация о банке скопирована в буфер обмена',
//         );
//       }
//     } catch (err) {
//       console.error('Ошибка копирования:', err);
//       showNotification(
//         'Ошибка копирования',
//         'error',
//         'Не удалось скопировать текст',
//       );
//     }
//   };

//   const handleSubmit = async () => {
//     if (hasPendingDeposit) {
//       showNotification(
//         'Пополнение недоступно',
//         'info',
//         'Есть необработанная заявка на пополнение',
//       );
//       return;
//     }
//     if (!selectedCard || !user?.telegram_id) {
//       showNotification(
//         'Ошибка',
//         'error',
//         'Отсутствуют реквизиты или пользователь, обратитесь к менеджеру',
//       );
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       await createCardDepositTransaction({
//         telegram_id: user.telegram_id,
//         amount: adjustedAmount,
//         card_number: selectedCard.card_number,
//         bank_name: selectedCard.bank_name,
//       });
//       showNotification(
//         'Заявка создана',
//         'success',
//         'Заявка на пополнение успешно отправлена',
//       );
//       openModal('RequestSuccessDialog', { requestType: 'deposit' });
//       onClose();
//     } catch (error) {
//       console.error('Ошибка при создании транзакции:', error);
//       showNotification(
//         'Ошибка',
//         'error',
//         error instanceof Error
//           ? error.message
//           : 'Не удалось создать транзакцию',
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Drawer.Root
//       repositionInputs={false}
//       open={isOpen && !isClosing}
//       onOpenChange={(open) => !open && onClose()}
//     >
//       <Drawer.Portal>
//         <Drawer.Overlay className='fixed inset-0 z-40 bg-black/50' />
//         <Drawer.Content
//           ref={dialogRef}
//           role='dialog'
//           aria-modal='true'
//           className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-2xl bg-zinc-900 outline-none'
//           style={{ pointerEvents: 'auto' }}
//           aria-describedby={undefined}
//         >
//           <div className='relative p-4 pb-2 md:p-6 md:pb-4'>
//             <Drawer.Close
//               onClick={onClose}
//               className='absolute right-4 top-4 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90 md:right-6 md:top-6'
//             >
//               <svg
//                 xmlns='http://www.w3.org/2000/svg'
//                 fill='none'
//                 viewBox='0 0 24 24'
//                 className='h-6 w-6'
//               >
//                 <path
//                   fill='currentColor'
//                   fillRule='evenodd'
//                   d='M19.071 4.929a1.25 1.25 0 0 0-1.768 0L12 10.232 6.697 4.93a1.25 1.25 0 0 0-1.768 1.768L10.232 12 4.93 17.303a1.25 1.25 0 0 0 1.768 1.768L12 13.768l5.303 5.303a1.25 1.25 0 0 0 1.768-1.768L13.768 12l5.303-5.303a1.25 1.25 0 0 0 0-1.768'
//                   clipRule='evenodd'
//                 />
//               </svg>
//             </Drawer.Close>
//             <Drawer.Close
//               onClick={() => {
//                 openModal('CardTransferDialog', { methodId: methodId });
//                 onClose();
//               }}
//               className='mb-3 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-90'
//             >
//               <svg
//                 xmlns='http://www.w3.org/2000/svg'
//                 fill='none'
//                 viewBox='0 0 24 24'
//                 className='h-4 w-4'
//               >
//                 <path
//                   fill='currentColor'
//                   fillRule='evenodd'
//                   d='M15 19.998c-.29 0-.59-.11-.81-.33l-6.85-6.86a1.14 1.14 0 0 1 0-1.62l6.85-6.85a1.14 1.14 0 0 1 1.62 0c.45.45.45 1.17 0 1.62l-6.05 6.05 6.05 6.05a1.14 1.14 0 0 1-.81 1.95z'
//                   clipRule='evenodd'
//                 />
//               </svg>
//               <span>Назад</span>
//             </Drawer.Close>
//           </div>
//           <div className='relative flex min-w-0 max-w-full grow flex-col overflow-y-auto px-4 md:px-6'>
//             {methodId === 'card-transfer' ? (
//               <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
//                 Перевод на карту
//               </Drawer.Title>
//             ) : (
//               <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
//                 Перевод на карту МИР
//               </Drawer.Title>
//             )}
//             {isLoadingCard ? (
//               <div className='flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/60 px-6 py-6 text-center shadow-md'>
//                 <div className='mb-3 flex items-center justify-center'>
//                   <svg
//                     width='24'
//                     height='24'
//                     viewBox='0 0 17 16'
//                     fill='none'
//                     xmlns='http://www.w3.org/2000/svg'
//                     className='h-6 w-6 animate-spin text-indigo-400'
//                   >
//                     <path
//                       d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
//                       fill='currentColor'
//                     />
//                   </svg>
//                 </div>
//                 <p className='text-sm font-medium text-gray-300'>
//                   Загружаем реквизиты карты...
//                 </p>
//                 <p className='mt-1 text-xs text-gray-500'>
//                   Пожалуйста, подождите несколько секунд
//                 </p>
//               </div>
//             ) : cardError ? (
//               <div className='mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-red-400 bg-red-900/20 px-4 py-6 text-center shadow-md'>
//                 <AlertCircle className='mb-2 h-7 w-7 text-red-400' />
//                 <p className='text-sm font-medium text-red-300'>{cardError}</p>
//                 <button
//                   onClick={() =>
//                     WebApp && appConfig.manager_link
//                       ? WebApp.openTelegramLink(appConfig.manager_link)
//                       : null
//                   }
//                   className='mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition duration-200 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 active:scale-95'
//                 >
//                   <MessageSquare className='mr-2 h-4 w-4 text-white' />
//                   Связаться с менеджером
//                 </button>
//               </div>
//             ) : (
//               <div className='flex grow flex-col pb-4'>
//                 <div className='mb-4 flex max-w-full flex-col gap-0.5 overflow-hidden px-2'>
//                   <div className='flex items-center gap-3 rounded-t-xl bg-zinc-800 py-3 pl-4 pr-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 24 24'
//                       className='size-6 shrink-0 text-black'
//                     >
//                       <path
//                         fill='#D80027'
//                         d='M0 12C0 5.373 5.373-.001 12-.001S24 5.373 24 12s-5.373 12.001-12 12.001S0 18.627 0 12'
//                       ></path>
//                       <path
//                         fill='#BBEB00'
//                         d='M0 12C0 5.373 5.373-.001 12-.001S24 5.373 24 12s-5.373 12.001-12 12.001S0 18.627 0 12'
//                       ></path>
//                       <path
//                         fill='currentColor'
//                         d='M9.908 18a.36.36 0 0 1-.277-.12.46.46 0 0 1-.093-.291v-1.886H8.37a.34.34 0 0 1-.261-.12A.42.42 0 0 1 8 15.29v-.531a.42.42 0 0 1 .108-.291.34.34 0 0 1 .261-.12h1.17v-.909h-1.17a.34.34 0 0 1-.261-.12.45.45 0 0 1-.108-.309v-.925q0-.189.108-.292a.34.34 0 0 1 .261-.12h1.17V6.43q0-.189.092-.309A.36.36 0 0 1 9.908 6h4.107q1.215 0 2.108.429a3.02 3.02 0 0 1 1.385 1.268q.492.84.492 2.109 0 1.235-.492 2.04-.492.788-1.385 1.2-.892.394-2.108.394h-2.277v.909h2.508q.17 0 .262.12a.42.42 0 0 1 .107.291v.531a.42.42 0 0 1-.107.292.31.31 0 0 1-.262.12h-2.508v1.886a.42.42 0 0 1-.107.291.36.36 0 0 1-.277.12zm1.8-6.326h2.23q.893 0 1.37-.463.492-.48.492-1.405 0-.858-.446-1.372-.447-.531-1.415-.531h-2.231z'
//                       ></path>
//                     </svg>
//                     <div className='flex shrink flex-col overflow-hidden break-words'>
//                       <p className='mb-1 text-xs text-gray-400'>
//                         Сумма перевода
//                       </p>
//                       <p className='text-sm font-semibold text-white'>
//                         {adjustedAmount}
//                       </p>
//                     </div>
//                     <div className='ml-auto shrink-0'>
//                       <button
//                         ref={amountButtonRef}
//                         className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
//                         onClick={() =>
//                           copyToClipboard(adjustedAmount.toString(), 'amount')
//                         }
//                       >
//                         {ripplesAmount.map((ripple, index) => (
//                           <span
//                             key={ripple.id}
//                             className='ripple-span'
//                             style={{
//                               left: `calc(50% + ${ripple.left}px)`,
//                               top: `calc(50% + ${ripple.top}px)`,
//                               animationDelay: `${index * 0.05}s`,
//                             }}
//                           />
//                         ))}
//                         <svg
//                           xmlns='http://www.w3.org/2000/svg'
//                           fill='none'
//                           viewBox='0 0 24 24'
//                           className='h-4 w-4 shrink-0'
//                         >
//                           <path
//                             fill='currentColor'
//                             fillRule='evenodd'
//                             d='M15.5 5.8c.01.166-.124.3-.29.3l-3.27.01c-2.87 0-4.95 2.15-4.95 5.1v4.88a.285.285 0 0 1-.3.29c-1.943-.135-3.27-1.581-3.27-3.59V6.1c0-2.15 1.38-3.6 3.45-3.6h5.19c1.962 0 3.317 1.316 3.44 3.3m-3.56 1.813h5.195c2.06 0 3.446 1.445 3.446 3.596v6.695c0 2.15-1.385 3.596-3.447 3.596H11.94c-2.061 0-3.446-1.446-3.446-3.596V11.21c0-2.15 1.385-3.596 3.446-3.596'
//                             clipRule='evenodd'
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                   <div className='relative -mt-2 rounded-b-md bg-zinc-800 pb-3 pl-4 pr-3'>
//                     <div className='flex flex-row items-start rounded-md bg-blue-900 p-3'>
//                       <svg
//                         xmlns='http://www.w3.org/2000/svg'
//                         fill='none'
//                         viewBox='0 0 24 24'
//                         className='mr-3 h-6 w-6 shrink-0 text-blue-400'
//                       >
//                         <path
//                           fill='currentColor'
//                           d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m-.01 8H11a1 1 0 0 0-.117 1.993L11 12v4.99c0 .52.394.95.9 1.004l.11.006h.49a1 1 0 0 0 .596-1.803L13 16.134V11.01c0-.52-.394-.95-.9-1.004zM12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2'
//                         />
//                       </svg>
//                       <div className='flex flex-col'>
//                         <p className='mb-1 text-sm font-semibold text-white'>
//                           Скопируйте сумму
//                         </p>
//                         <p className='text-xs text-white'>
//                           Мы изменили сумму вашего перевода, чтобы убедиться,
//                           что это ваш платёж и зачислить его автоматически.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className='flex items-center gap-3 rounded-md bg-zinc-800 py-3 pl-4 pr-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 24 24'
//                       className='h-6 w-6 shrink-0 text-gray-400'
//                     >
//                       {selectedCard?.card_number &&
//                       /^\+\d{10,12}$/.test(
//                         selectedCard.card_number.replace(/\s/g, ''),
//                       ) ? (
//                         <path
//                           fill='currentColor'
//                           fillRule='evenodd'
//                           d='M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C9.93 21 3 14.07 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.02z'
//                           clipRule='evenodd'
//                         />
//                       ) : (
//                         <path
//                           fill='currentColor'
//                           fillRule='evenodd'
//                           d='M21.5 8.79a.3.3 0 0 1-.3.3H2.8a.3.3 0 0 1-.3-.3v-.08c0-2.794 1.794-4.67 4.463-4.67h10.071c2.67 0 4.464 1.876 4.464 4.67zm-10.718 7.13h1.428a.75.75 0 0 0 0-1.5h-1.428a.75.75 0 0 0 0 1.5m-3.884 0h1.428a.75.75 0 0 0 0-1.5H6.898a.75.75 0 0 0 0 1.5m-4.397-5.03a.3.3 0 0 1 .3-.3h18.398a.3.3 0 0 1 .3.3v4.4c0 2.792-1.794 4.67-4.465 4.67H6.964c-2.669 0-4.463-1.878-4.463-4.67z'
//                           clipRule='evenodd'
//                         />
//                       )}
//                     </svg>
//                     <div className='flex shrink flex-col overflow-hidden break-words'>
//                       <p className='mb-1 text-xs text-gray-400'>
//                         {selectedCard?.card_number &&
//                         /^\+\d{10,12}$/.test(
//                           selectedCard.card_number.replace(/\s/g, ''),
//                         )
//                           ? 'Номер телефона для перевода по СБП'
//                           : 'Номер для перевода'}
//                       </p>
//                       <p className='text-sm font-semibold text-white'>
//                         {selectedCard
//                           ? selectedCard.card_number
//                           : 'Карта не найдена'}
//                       </p>
//                     </div>
//                     <div className='ml-auto shrink-0'>
//                       <button
//                         ref={cardButtonRef}
//                         className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
//                         onClick={() =>
//                           selectedCard
//                             ? copyToClipboard(selectedCard.card_number, 'card')
//                             : showNotification(
//                                 'Ошибка',
//                                 'error',
//                                 'Нет подходящей карты для копирования',
//                               )
//                         }
//                       >
//                         {ripplesCard.map((ripple, index) => (
//                           <span
//                             key={ripple.id}
//                             className='ripple-span'
//                             style={{
//                               left: `calc(50% + ${ripple.left}px)`,
//                               top: `calc(50% + ${ripple.top}px)`,
//                               animationDelay: `${index * 0.05}s`,
//                             }}
//                           />
//                         ))}
//                         <svg
//                           xmlns='http://www.w3.org/2000/svg'
//                           fill='none'
//                           viewBox='0 0 24 24'
//                           className='h-4 w-4 shrink-0'
//                         >
//                           <path
//                             fill='currentColor'
//                             fillRule='evenodd'
//                             d='M15.5 5.8c.01.166-.124.3-.29.3l-3.27.01c-2.87 0-4.95 2.15-4.95 5.1v4.88a.285.285 0 0 1-.3.29c-1.943-.135-3.27-1.581-3.27-3.59V6.1c0-2.15 1.38-3.6 3.45-3.6h5.19c1.962 0 3.317 1.316 3.44 3.3m-3.56 1.813h5.195c2.06 0 3.446 1.445 3.446 3.596v6.695c0 2.15-1.385 3.596-3.447 3.596H11.94c-2.061 0-3.446-1.446-3.446-3.596V11.21c0-2.15 1.385-3.596 3.446-3.596'
//                             clipRule='evenodd'
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                   <div className='flex items-center gap-3 rounded-b-xl rounded-t-md bg-zinc-800 py-3 pl-4 pr-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 24 24'
//                       className='h-6 w-6 shrink-0 text-gray-400'
//                     >
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M21.5 8.79a.3.3 0 0 1-.3.3H2.8a.3.3 0 0 1-.3-.3v-.08c0-2.794 1.794-4.67 4.463-4.67h10.071c2.67 0 4.464 1.876 4.464 4.67zm-10.718 7.13h1.428a.75.75 0 0 0 0-1.5h-1.428a.75.75 0 0 0 0 1.5m-3.884 0h1.428a.75.75 0 0 0 0-1.5H6.898a.75.75 0 0 0 0 1.5m-4.397-5.03a.3.3 0 0 1 .3-.3h18.398a.3.3 0 0 1 .3.3v4.4c0 2.792-1.794 4.67-4.465 4.67H6.964c-2.669 0-4.463-1.878-4.463-4.67z'
//                         clipRule='evenodd'
//                       />
//                     </svg>
//                     <div className='flex shrink flex-col overflow-hidden break-words'>
//                       <p className='mb-1 text-xs text-gray-400'>Банк</p>
//                       <p className='text-sm font-semibold text-white'>
//                         {selectedCard
//                           ? selectedCard.bank_name
//                           : 'Банк не найден'}
//                       </p>
//                     </div>
//                     <div className='ml-auto shrink-0'>
//                       <button
//                         ref={bankButtonRef}
//                         className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
//                         onClick={() =>
//                           selectedCard
//                             ? copyToClipboard(selectedCard.bank_name, 'bank')
//                             : showNotification(
//                                 'Ошибка',
//                                 'error',
//                                 'Нет подходящего банка для копирования',
//                               )
//                         }
//                       >
//                         {ripplesBank.map((ripple, index) => (
//                           <span
//                             key={ripple.id}
//                             className='ripple-span'
//                             style={{
//                               left: `calc(50% + ${ripple.left}px)`,
//                               top: `calc(50% + ${ripple.top}px)`,
//                               animationDelay: `${index * 0.05}s`,
//                             }}
//                           />
//                         ))}
//                         <svg
//                           xmlns='http://www.w3.org/2000/svg'
//                           fill='none'
//                           viewBox='0 0 24 24'
//                           className='h-4 w-4 shrink-0'
//                         >
//                           <path
//                             fill='currentColor'
//                             fillRule='evenodd'
//                             d='M15.5 5.8c.01.166-.124.3-.29.3l-3.27.01c-2.87 0-4.95 2.15-4.95 5.1v4.88a.285.285 0 0 1-.3.29c-1.943-.135-3.27-1.581-3.27-3.59V6.1c0-2.15 1.38-3.6 3.45-3.6h5.19c1.962 0 3.317 1.316 3.44 3.3m-3.56 1.813h5.195c2.06 0 3.446 1.445 3.446 3.596v6.695c0 2.15-1.385 3.596-3.447 3.596H11.94c-2.061 0-3.446-1.446-3.446-3.596V11.21c0-2.15 1.385-3.596 3.446-3.596'
//                             clipRule='evenodd'
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                   {selectedCard?.wallet_owner && (
//                     <div className='flex items-center gap-3 rounded-md bg-zinc-800 py-3 pl-4 pr-3'>
//                       <svg
//                         xmlns='http://www.w3.org/2000/svg'
//                         fill='none'
//                         viewBox='0 0 24 24'
//                         className='h-6 w-6 shrink-0 text-gray-400'
//                       >
//                         <path
//                           fill='currentColor'
//                           fillRule='evenodd'
//                           d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 4a1 1 0 0 0-1 1v5.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L13 12.586V7a1 1 0 0 0-1-1z'
//                           clipRule='evenodd'
//                         />
//                       </svg>
//                       <div className='flex shrink flex-col overflow-hidden break-words'>
//                         <p className='mb-1 text-xs text-gray-400'>
//                           Владелец кошелька
//                         </p>
//                         <p className='text-sm font-semibold text-white'>
//                           {selectedCard.wallet_owner}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <p className='md:text-2lg mb-3 text-base font-semibold tracking-tight text-white'>
//                   Помните об условиях платежа
//                 </p>
//                 <div className='flex gap-2'>
//                   <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 24 25'
//                       className='mb-spacing-12 size-6 flex-shrink-0 text-yellow-500'
//                     >
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M21.645 3.236a.75.75 0 0 0-.686-.46l-.006-.003H18.06a.75.75 0 0 0 0 1.5h1.083l-2.627 2.63a.751.751 0 0 0 1.062 1.061l2.625-2.628v1.088a.75.75 0 0 0 1.5 0v-2.9a.8.8 0 0 0-.058-.288'
//                         clipRule='evenodd'
//                       ></path>
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M13.492 4.7a6.345 6.345 0 0 0 7.313 6.272.303.303 0 0 1 .349.24q.142.8.143 1.64c0 5.238-4.262 9.5-9.5 9.5-5.24 0-9.5-4.262-9.5-9.5s4.26-9.5 9.5-9.5q.773.002 1.514.124a.303.303 0 0 1 .245.347c-.04.287-.064.58-.064.878m-1.475 4.31a.97.97 0 0 0-.582.204L8.7 11.34a.933.933 0 1 0 1.174 1.45l1.334-1.124-.085 6.421a.9.9 0 1 0 1.802.02l.067-8.124a.965.965 0 0 0-.975-.972'
//                         clipRule='evenodd'
//                       ></path>
//                     </svg>
//                     <p className='text-xs text-white'>
//                       Совершайте платеж одной операцией
//                     </p>
//                   </div>
//                   <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 25 25'
//                       className='mr-2 size-6 flex-shrink-0 text-yellow-500'
//                     >
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M15.541 15.696a.747.747 0 0 1-1.06-.002l-1.514-1.519-1.509 1.514a.75.75 0 1 1-1.063-1.058l1.512-1.518-1.513-1.519a.751.751 0 0 1 1.062-1.059l1.511 1.515 1.51-1.514a.749.749 0 1 1 1.061 1.059l-1.513 1.518 1.518 1.522a.75.75 0 0 1-.002 1.061m4.146-9.321a9.42 9.42 0 0 0-6.717-2.79c-2.539 0-4.927.99-6.72 2.79-2.806 2.815-3.57 7.136-1.913 10.73.191.477.316.81.316 1.091c0 .333-.14.749-.278 1.151-.265.779-.565 1.662.077 2.307.65.649 1.531.346 2.313.075.396-.137.806-.279 1.13-.281.292 0 .658.147 1.081.319a9.527 9.527 0 0 0 10.711-1.915c3.703-3.717 3.703-9.762 0-13.477'
//                         clipRule='evenodd'
//                       />
//                     </svg>
//                     <p className='text-xs text-white'>
//                       Не оставляйте комментарии к переводу
//                     </p>
//                   </div>
//                   <div className='flex flex-col rounded-xl bg-violet-950/60 p-3'>
//                     <svg
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 25 24'
//                       className='mr-2 size-6 flex-shrink-0 text-yellow-500'
//                     >
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M14.784 10.052h2.2v-1.7h-2.2z'
//                         clipRule='evenodd'
//                       />
//                       <path
//                         fill='currentColor'
//                         fillRule='evenodd'
//                         d='M18.484 10.198a.8.8 0 0 1-.023.182c-.27 1.084-1.083 1.168-1.327 1.168h-2.5a1.32 1.32 0 0 1-1.35-1.35v-2c0-.77.58-1.35 1.35-1.35h2.5c.77 0 1.35.58 1.35 1.35zm-5.15 6.45h-6.3a.75.75 0 0 1 0-1.5h6.3a.75.75 0 0 1 0 1.5m-6.3-4.4h2.7a.75.75 0 0 1 0 1.5h-2.7a.75.75 0 0 1 0-1.5m9.7-8.85h-8.8c-2.955 0-5.1 2.314-5.1 5.5v6.2c0 3.135 2.192 5.5 5.1 5.5h8.8c2.954 0 5.1-2.314 5.1-5.5v-6.2c0-3.136-2.193-5.5-5.1-5.5'
//                         clipRule='evenodd'
//                       />
//                     </svg>
//                     <p className='text-xs text-white'>
//                       Реквизиты всегда меняются
//                     </p>
//                   </div>
//                 </div>
//                 <div className='my-4 flex items-center rounded-xl bg-zinc-800 p-3'>
//                   <svg
//                     width='16'
//                     height='16'
//                     viewBox='0 0 17 16'
//                     fill='none'
//                     xmlns='http://www.w3.org/2000/svg'
//                     className='mr-2 h-6 w-6 animate-spin text-white'
//                   >
//                     <path
//                       d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
//                       fill='currentColor'
//                     />
//                   </svg>
//                   <p className='text-sm text-gray-400'>Ожидаем ваш перевод</p>
//                 </div>
//                 <button
//                   className={clsx(
//                     'mb-10 mt-auto flex h-12 w-full items-center justify-center rounded-xl bg-violet-950 text-white transition-all duration-300',
//                     isSubmitDisabled
//                       ? 'cursor-not-allowed opacity-50'
//                       : 'hover:bg-blue-600 focus:bg-blue-600 focus:outline-transparent active:scale-90 active:bg-indigo-500',
//                   )}
//                   onClick={handleSubmit}
//                   disabled={isSubmitDisabled}
//                 >
//                   <span className='flex items-center gap-2 truncate text-sm font-semibold'>
//                     {isSubmitting ? (
//                       <svg
//                         width='16'
//                         height='16'
//                         viewBox='0 0 17 16'
//                         fill='none'
//                         xmlns='http://www.w3.org/2000/svg'
//                         className='h-5 w-5 animate-spin text-white'
//                       >
//                         <path
//                           d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
//                           fill='currentColor'
//                         />
//                       </svg>
//                     ) : (
//                       'Я оплатил'
//                     )}
//                   </span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </Drawer.Content>
//       </Drawer.Portal>
//     </Drawer.Root>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { useModal } from '@/app/context/ModalContext';
import { useNotification } from '@/app/context/NotificContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import clsx from 'clsx';
import { createCardDepositTransaction } from '@/app/lib/actions';
import { useWebApp } from '@/app/lib/hooks/useWebApp';
import { AlertCircle, MessageSquare } from 'lucide-react';

type SelectedCardType = {
  card_number: string;
  bank_name: string;
  min_amount: number;
  max_amount: number;
  wallet_owner?: string;
};

type CardTransferConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isClosing?: boolean;
  amount: number;
  methodId: string;
};

export function CardTransferConfirmationDialog({
  isOpen,
  methodId,
  amount,
  isClosing,
  onClose,
}: CardTransferConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const amountButtonRef = useRef<HTMLButtonElement>(null);
  const cardButtonRef = useRef<HTMLButtonElement>(null);
  const bankButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<
    SelectedCardType | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [randomAdd, setRandomAdd] = useState(0);
  const [ripplesAmount, setRipplesAmount] = useState<
    { id: number; left: number; top: number }[]
  >([]);
  const [ripplesCard, setRipplesCard] = useState<
    { id: number; left: number; top: number }[]
  >([]);
  const [ripplesBank, setRipplesBank] = useState<
    { id: number; left: number; top: number }[]
  >([]);

  const { openModal } = useModal();
  const { showNotification } = useNotification();
  const { cards, transactions, user, appConfig } = useGlobalStore();
  const WebApp = useWebApp();

  useEffect(() => {
    if (isOpen) {
      const newRandomAdd = Math.floor(Math.random() * 15) + 1;
      setRandomAdd(newRandomAdd);
    }
  }, [isOpen]);

  const adjustedAmount = amount + randomAdd;

  useEffect(() => {
    const fetchCardDetails = async () => {
      setIsLoadingCard(true);
      setCardError(null);

      try {
        const response = await fetch('/api/reqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: user?.telegram_id,
            amount: adjustedAmount,
          }),
        });

        const data = await response.json();

        if (data.error || data.status === 'processing') {
          setCardError(
            'Не удалось получить реквизиты. Попробуйте позже или свяжитесь с менеджером.',
          );
          throw new Error(
            data.error || 'Система обрабатывает запрос. Попробуйте позже.',
          );
        }

        setSelectedCard({
          card_number: data.card,
          bank_name: data.sbp_bank,
          min_amount: 0,
          max_amount: Infinity,
          wallet_owner: data.wallet_owner,
        });
      } catch (error) {
        console.error('Ошибка получения реквизитов:', error);
        setCardError(
          'Не удалось получить реквизиты. Попробуйте позже или свяжитесь с менеджером.',
        );
      } finally {
        setIsLoadingCard(false);
      }
    };

    if (!user?.telegram_id) {
      setSelectedCard(undefined);
      return;
    }

    const useApiForCard = appConfig?.useapiforcard ?? true;
    const isAmountInApiRange = adjustedAmount >= 1500 && adjustedAmount < 10000;

    if (isAmountInApiRange && useApiForCard) {
      fetchCardDetails();
    } else {
      const card = cards.find(
        (card) =>
          card.min_amount <= adjustedAmount &&
          adjustedAmount <= card.max_amount,
      );
      setSelectedCard(card);
      setIsLoadingCard(false);
      setCardError(card ? null : 'Подходящая карта не найдена.');
    }
  }, [adjustedAmount, user?.telegram_id, cards, appConfig]);

  const hasPendingDeposit = transactions.some(
    (tx) => tx.type === 'deposit' && tx.status === 'in_process',
  );
  const isSubmitDisabled = isSubmitting || hasPendingDeposit || !selectedCard;

  const copyToClipboard = async (
    text: string,
    buttonType: 'amount' | 'card' | 'bank',
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      const newRipple = [{ id: Date.now(), left: -6.2, top: -7 }];
      if (buttonType === 'amount') {
        setRipplesAmount(newRipple);
        setTimeout(() => setRipplesAmount([]), 800);
        showNotification(
          'Сумма скопирована!',
          'success',
          'Сумма перевода скопирована в буфер обмена',
        );
      } else if (buttonType === 'card') {
        setRipplesCard(newRipple);
        setTimeout(() => setRipplesCard([]), 800);
        showNotification(
          'Номер карты скопирован!',
          'success',
          'Номер карты скопирован в буфер обмена',
        );
      } else if (buttonType === 'bank') {
        setRipplesBank(newRipple);
        setTimeout(() => setRipplesBank([]), 800);
        showNotification(
          'Банк скопирован!',
          'success',
          'Информация о банке скопирована в буфер обмена',
        );
      }
    } catch (err) {
      console.error('Ошибка копирования:', err);
      showNotification(
        'Ошибка копирования',
        'error',
        'Не удалось скопировать текст',
      );
    }
  };

  const handleSubmit = async () => {
    if (hasPendingDeposit) {
      showNotification(
        'Пополнение недоступно',
        'info',
        'Есть необработанная заявка на пополнение',
      );
      return;
    }
    if (!selectedCard || !user?.telegram_id) {
      showNotification(
        'Ошибка',
        'error',
        'Отсутствуют реквизиты или пользователь, обратитесь к менеджеру',
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await createCardDepositTransaction({
        telegram_id: user.telegram_id,
        amount: adjustedAmount,
        card_number: selectedCard.card_number,
        bank_name: selectedCard.bank_name,
      });
      showNotification(
        'Заявка создана',
        'success',
        'Заявка на пополнение успешно отправлена',
      );
      openModal('RequestSuccessDialog', { requestType: 'deposit' });
      onClose();
    } catch (error) {
      console.error('Ошибка при создании транзакции:', error);
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

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen && !isClosing}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-40 bg-black/50' />
        <Drawer.Content
          ref={dialogRef}
          role='dialog'
          aria-modal='true'
          className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-2xl bg-zinc-900 outline-none'
          style={{ pointerEvents: 'auto' }}
          aria-describedby={undefined}
        >
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
            <Drawer.Close
              onClick={() => {
                openModal('CardTransferDialog', { methodId: methodId });
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
            </Drawer.Close>
          </div>
          <div className='relative flex min-w-0 max-w-full grow flex-col overflow-y-auto px-4 md:px-6'>
            {methodId === 'card-transfer' ? (
              <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
                Перевод на карту
              </Drawer.Title>
            ) : (
              <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
                Перевод на карту МИР
              </Drawer.Title>
            )}
            {methodId === 'card-transfer' && adjustedAmount >= 10000 ? (
              <div className="relative mt-6 flex h-[180px] max-w-full shrink-0 overflow-hidden rounded-xl bg-zinc-800 p-6 before:absolute before:bottom-0 before:right-0 before:h-full before:w-[196px] before:bg-[url('data:image/png;base64,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')] before:bg-cover before:content-[''] lg:max-w-[343px]">
                <div className='flex h-full max-w-36 flex-col items-start'>
                  <div className='mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-white'>
                    <AlertCircle className='h-5 w-5 text-yellow-400' />
                    Пополнение свыше 10 000 ₽
                  </div>
                  <p className='text-sm leading-relaxed tracking-tight text-zinc-400'>
                    Для пополнения на сумму более 10 000 рублей обратитесь к
                    нашему менеджеру.
                  </p>
                  <button
                    className='mt-auto flex min-h-8 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 px-4 text-sm font-semibold tracking-tight text-white outline outline-2 outline-offset-2 outline-transparent transition-all hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-700 focus-visible:bg-gradient-to-br focus-visible:from-blue-500 focus-visible:to-blue-700 active:scale-95'
                    onClick={() => {
                      if (WebApp && appConfig.manager_link) {
                        WebApp.openTelegramLink(appConfig.manager_link);
                      } else {
                        showNotification(
                          'Ошибка',
                          'error',
                          'Ссылка на менеджера недоступна. Попробуйте позже.',
                        );
                      }
                    }}
                  >
                    <MessageSquare className='h-4 w-4' />
                    Написать менеджеру
                  </button>
                </div>
              </div>
            ) : isLoadingCard ? (
              <div className='flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/60 px-6 py-6 text-center shadow-md'>
                <div className='mb-3 flex items-center justify-center'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 17 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 animate-spin text-indigo-400'
                  >
                    <path
                      d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
                      fill='currentColor'
                    />
                  </svg>
                </div>
                <p className='text-sm font-medium text-gray-300'>
                  Загружаем реквизиты карты...
                </p>
                <p className='mt-1 text-xs text-gray-500'>
                  Пожалуйста, подождите несколько секунд
                </p>
              </div>
            ) : cardError ? (
              <div className='mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-red-400 bg-red-900/20 px-4 py-6 text-center shadow-md'>
                <AlertCircle className='mb-2 h-7 w-7 text-red-400' />
                <p className='text-sm font-medium text-red-300'>{cardError}</p>
                <button
                  onClick={() =>
                    WebApp && appConfig.manager_link
                      ? WebApp.openTelegramLink(appConfig.manager_link)
                      : null
                  }
                  className='mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition duration-200 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 active:scale-95'
                >
                  <MessageSquare className='mr-2 h-4 w-4 text-white' />
                  Связаться с менеджером
                </button>
              </div>
            ) : (
              <div className='flex grow flex-col pb-4'>
                <div className='mb-4 flex max-w-full flex-col gap-0.5 overflow-hidden px-2'>
                  <div className='flex items-center gap-3 rounded-t-xl bg-zinc-800 py-3 pl-4 pr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      className='size-6 shrink-0 text-black'
                    >
                      <path
                        fill='#D80027'
                        d='M0 12C0 5.373 5.373-.001 12-.001S24 5.373 24 12s-5.373 12.001-12 12.001S0 18.627 0 12'
                      ></path>
                      <path
                        fill='#BBEB00'
                        d='M0 12C0 5.373 5.373-.001 12-.001S24 5.373 24 12s-5.373 12.001-12 12.001S0 18.627 0 12'
                      ></path>
                      <path
                        fill='currentColor'
                        d='M9.908 18a.36.36 0 0 1-.277-.12.46.46 0 0 1-.093-.291v-1.886H8.37a.34.34 0 0 1-.261-.12A.42.42 0 0 1 8 15.29v-.531a.42.42 0 0 1 .108-.291.34.34 0 0 1 .261-.12h1.17v-.909h-1.17a.34.34 0 0 1-.261-.12.45.45 0 0 1-.108-.309v-.925q0-.189.108-.292a.34.34 0 0 1 .261-.12h1.17V6.43q0-.189.092-.309A.36.36 0 0 1 9.908 6h4.107q1.215 0 2.108.429a3.02 3.02 0 0 1 1.385 1.268q.492.84.492 2.109q0 1.235-.492 2.04-.492.788-1.385 1.2-.892.394-2.108.394h-2.277v.909h2.508q.17 0 .262.12a.42.42 0 0 1 .107.291v.531a.42.42 0 0 1-.107.292.31.31 0 0 1-.262.12h-2.508v1.886a.42.42 0 0 1-.107.291.36.36 0 0 1-.277.12zm1.8-6.326h2.23q.893 0 1.37-.463.492-.48.492-1.405 0-.858-.446-1.372-.447-.531-1.415-.531h-2.231z'
                      ></path>
                    </svg>
                    <div className='flex shrink flex-col overflow-hidden break-words'>
                      <p className='mb-1 text-xs text-gray-400'>
                        Сумма перевода
                      </p>
                      <p className='text-sm font-semibold text-white'>
                        {adjustedAmount}
                      </p>
                    </div>
                    <div className='ml-auto shrink-0'>
                      <button
                        ref={amountButtonRef}
                        className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
                        onClick={() =>
                          copyToClipboard(adjustedAmount.toString(), 'amount')
                        }
                      >
                        {ripplesAmount.map((ripple, index) => (
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
                  <div className='relative -mt-2 rounded-b-md bg-zinc-800 pb-3 pl-4 pr-3'>
                    <div className='flex flex-row items-start rounded-md bg-blue-900 p-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='mr-3 h-6 w-6 shrink-0 text-blue-400'
                      >
                        <path
                          fill='currentColor'
                          d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m-.01 8H11a1 1 0 0 0-.117 1.993L11 12v4.99c0 .52.394.95.9 1.004l.11.006h.49a1 1 0 0 0 .596-1.803L13 16.134V11.01c0-.52-.394-.95-.9-1.004zM12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2'
                        />
                      </svg>
                      <div className='flex flex-col'>
                        <p className='mb-1 text-sm font-semibold text-white'>
                          Скопируйте сумму
                        </p>
                        <p className='text-xs text-white'>
                          Мы изменили сумму вашего перевода, чтобы убедиться,
                          что это ваш платёж и зачислить его автоматически.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 rounded-md bg-zinc-800 py-3 pl-4 pr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      className='h-6 w-6 shrink-0 text-gray-400'
                    >
                      {selectedCard?.card_number &&
                      /^\+\d{10,12}$/.test(
                        selectedCard.card_number.replace(/\s/g, ''),
                      ) ? (
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C9.93 21 3 14.07 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.02z'
                          clipRule='evenodd'
                        />
                      ) : (
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M21.5 8.79a.3.3 0 0 1-.3.3H2.8a.3.3 0 0 1-.3-.3v-.08c0-2.794 1.794-4.67 4.463-4.67h10.071c2.67 0 4.464 1.876 4.464 4.67zm-10.718 7.13h1.428a.75.75 0 0 0 0-1.5h-1.428a.75.75 0 0 0 0 1.5m-3.884 0h1.428a.75.75 0 0 0 0-1.5H6.898a.75.75 0 0 0 0 1.5m-4.397-5.03a.3.3 0 0 1 .3-.3h18.398a.3.3 0 0 1 .3.3v4.4c0 2.792-1.794 4.67-4.465 4.67H6.964c-2.669 0-4.463-1.878-4.463-4.67z'
                          clipRule='evenodd'
                        />
                      )}
                    </svg>
                    <div className='flex shrink flex-col overflow-hidden break-words'>
                      <p className='mb-1 text-xs text-gray-400'>
                        {selectedCard?.card_number &&
                        /^\+\d{10,12}$/.test(
                          selectedCard.card_number.replace(/\s/g, ''),
                        )
                          ? 'Номер телефона для перевода по СБП'
                          : 'Номер для перевода'}
                      </p>
                      <p className='text-sm font-semibold text-white'>
                        {selectedCard
                          ? selectedCard.card_number
                          : 'Карта не найдена'}
                      </p>
                    </div>
                    <div className='ml-auto shrink-0'>
                      <button
                        ref={cardButtonRef}
                        className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
                        onClick={() =>
                          selectedCard
                            ? copyToClipboard(selectedCard.card_number, 'card')
                            : showNotification(
                                'Ошибка',
                                'error',
                                'Нет подходящей карты для копирования',
                              )
                        }
                      >
                        {ripplesCard.map((ripple, index) => (
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
                  <div className='flex items-center gap-3 rounded-b-xl rounded-t-md bg-zinc-800 py-3 pl-4 pr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      className='h-6 w-6 shrink-0 text-gray-400'
                    >
                      <path
                        fill='currentColor'
                        fillRule='evenodd'
                        d='M21.5 8.79a.3.3 0 0 1-.3.3H2.8a.3.3 0 0 1-.3-.3v-.08c0-2.794 1.794-4.67 4.463-4.67h10.071c2.67 0 4.464 1.876 4.464 4.67zm-10.718 7.13h1.428a.75.75 0 0 0 0-1.5h-1.428a.75.75 0 0 0 0 1.5m-3.884 0h1.428a.75.75 0 0 0 0-1.5H6.898a.75.75 0 0 0 0 1.5m-4.397-5.03a.3.3 0 0 1 .3-.3h18.398a.3.3 0 0 1 .3.3v4.4c0 2.792-1.794 4.67-4.465 4.67H6.964c-2.669 0-4.463-1.878-4.463-4.67z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <div className='flex shrink flex-col overflow-hidden break-words'>
                      <p className='mb-1 text-xs text-gray-400'>Банк</p>
                      <p className='text-sm font-semibold text-white'>
                        {selectedCard
                          ? selectedCard.bank_name
                          : 'Банк не найден'}
                      </p>
                    </div>
                    <div className='ml-auto shrink-0'>
                      <button
                        ref={bankButtonRef}
                        className='relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-700 text-white transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-90'
                        onClick={() =>
                          selectedCard
                            ? copyToClipboard(selectedCard.bank_name, 'bank')
                            : showNotification(
                                'Ошибка',
                                'error',
                                'Нет подходящего банка для копирования',
                              )
                        }
                      >
                        {ripplesBank.map((ripple, index) => (
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
                  {selectedCard?.wallet_owner && (
                    <div className='flex items-center gap-3 rounded-md bg-zinc-800 py-3 pl-4 pr-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        className='h-6 w-6 shrink-0 text-gray-400'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 4a1 1 0 0 0-1 1v5.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L13 12.586V7a1 1 0 0 0-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <div className='flex shrink flex-col overflow-hidden break-words'>
                        <p className='mb-1 text-xs text-gray-400'>
                          Владелец кошелька
                        </p>
                        <p className='text-sm font-semibold text-white'>
                          {selectedCard.wallet_owner}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className='md:text-2lg mb-3 text-base font-semibold tracking-tight text-white'>
                  Помните об условиях платежа
                </p>
                <div className='flex gap-2'>
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
                      ></path>
                      <path
                        fill='currentColor'
                        fillRule='evenodd'
                        d='M13.492 4.7a6.345 6.345 0 0 0 7.313 6.272.303.303 0 0 1 .349.24q.142.8.143 1.64c0 5.238-4.262 9.5-9.5 9.5-5.24 0-9.5-4.262-9.5-9.5s4.26-9.5 9.5-9.5q.773.002 1.514.124a.303.303 0 0 1 .245.347c-.04.287-.064.58-.064.878m-1.475 4.31a.97.97 0 0 0-.582.204L8.7 11.34a.933.933 0 1 0 1.174 1.45l1.334-1.124-.085 6.421a.9.9 0 1 0 1.802.02l.067-8.124a.965.965 0 0 0-.975-.972'
                        clipRule='evenodd'
                      ></path>
                    </svg>
                    <p className='text-xs text-white'>
                      Совершайте платеж одной операцией
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
                      Не оставляйте комментарии к переводу
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
                      Реквизиты всегда меняются
                    </p>
                  </div>
                </div>
                <div className='my-4 flex items-center rounded-xl bg-zinc-800 p-3'>
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
                  <p className='text-sm text-gray-400'>Ожидаем ваш перевод</p>
                </div>
                <button
                  className={clsx(
                    'mb-10 mt-auto flex h-12 w-full items-center justify-center rounded-xl bg-violet-950 text-white transition-all duration-300',
                    isSubmitDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-blue-600 focus:bg-blue-600 focus:outline-transparent active:scale-90 active:bg-indigo-500',
                  )}
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  <span className='flex items-center gap-2 truncate text-sm font-semibold'>
                    {isSubmitting ? (
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
                    ) : (
                      'Я оплатил'
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
