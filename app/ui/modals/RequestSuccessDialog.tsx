'use client';

import { useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import Image from 'next/image';
import { support } from '../../lib/images';
import { ModalProps } from '@/app/context/ModalContext';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useWebApp } from '@/app/lib/hooks/useWebApp';

type RequestSuccessDialogProps = ModalProps['RequestSuccessDialog'] & {
  isOpen: boolean;
  onClose: () => void;
  isClosing?: boolean; // Добавляем isClosing
};

export function RequestSuccessDialog({
  isOpen,
  onClose,
  requestType,
  isClosing,
}: RequestSuccessDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const { appConfig } = useGlobalStore();
  const WebApp = useWebApp();

  // Обработка Escape для доступности
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

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen && !isClosing}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-40 bg-black/80' />
        <Drawer.Content
          ref={dialogRef}
          role='dialog'
          aria-modal='true'
          className='fixed inset-x-0 bottom-0 z-50 flex h-[95vh] flex-col rounded-t-2xl bg-zinc-900 outline-none'
          style={{ pointerEvents: 'auto' }}
          aria-describedby={undefined}
        >
          <div className='relative flex min-w-0 max-w-full grow flex-col overflow-y-auto p-4'>
            <Drawer.Title className='mb-3 text-xl font-semibold tracking-tight text-white md:text-2xl'>
              Успешно
            </Drawer.Title>
            <Drawer.Close
              onClick={onClose}
              className='z-200 absolute right-4 top-4 flex items-center gap-1 text-sm font-semibold text-gray-400 focus:outline-none active:scale-90'
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
            <div className='flex grow flex-col pb-4'>
              <div className='mb-4 flex max-w-full flex-col gap-0.5 overflow-hidden'>
                <div className='flex flex-row items-start rounded-xl bg-blue-900 p-3'>
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
                      {requestType === 'deposit'
                        ? 'Запрос на пополнение успешно создан'
                        : 'Запрос на вывод средств успешно создан'}
                    </p>
                    <p className='text-xs text-white'>
                      Ваш запрос на{' '}
                      {requestType === 'deposit' ? 'пополнение' : 'вывод'}{' '}
                      успешно создан. Обработка займет{' '}
                      <span className='font-semibold text-blue-400'>
                        до 24 часов
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex h-[164px] max-w-full shrink-0 overflow-hidden rounded-xl bg-zinc-800 p-4 before:absolute before:bottom-0 before:right-0 before:h-full before:w-[196px] before:bg-[url('data:image/png;base64,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')] before:bg-cover before:content-[''] lg:max-w-[277px] xl:max-w-[343px]">
                <div className='flex h-full max-w-36 flex-col items-start'>
                  <div className='mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-white'>
                    Поддержка
                    <div className='flex items-center rounded-full bg-gradient-to-br from-purple-900 to-gray-800 p-0.5 px-2 py-1 text-xs font-semibold tracking-tight text-white'>
                      24/7
                    </div>
                  </div>
                  <p className='text-sm tracking-tight text-zinc-400'>
                    Обратитесь к нам, если есть вопросы
                  </p>
                  <button
                    className='mt-auto flex min-h-8 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold tracking-tight text-white outline outline-2 outline-offset-2 outline-transparent transition-all hover:bg-zinc-800 focus-visible:bg-zinc-800'
                    onClick={() =>
                      WebApp && appConfig.manager_link
                        ? WebApp.openTelegramLink(appConfig.manager_link)
                        : null
                    }
                  >
                    Написать
                  </button>
                </div>
                <Image
                  alt='support image'
                  width={164}
                  height={164}
                  src={support.wSup}
                  className='absolute bottom-0 right-0 h-[164px] w-[164px]'
                  priority
                />
              </div>
              <button
                className='mb-10 mt-auto flex h-12 w-full items-center justify-center rounded-xl bg-violet-950 text-white transition-all duration-300 hover:bg-blue-600 focus-visible:outline-transparent active:scale-90 active:bg-indigo-500'
                onClick={onClose}
              >
                <span className='truncate text-sm font-semibold'>Понятно</span>
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
