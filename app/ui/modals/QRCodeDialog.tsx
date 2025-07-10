'use client';

import { useRef, useEffect } from 'react';
import { Drawer } from 'vaul';
import { QRCodeCanvas } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  isClosing?: boolean; // Добавляем isClosing
}

export function QRCodeDialog({
  isOpen,
  onClose,
  walletAddress,
  isClosing,
}: QRCodeDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  // Обработка фокуса и Escape
  useEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    setTimeout(() => el?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, walletAddress]);

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen && !isClosing}
      onOpenChange={(open) => !open && onClose()}
      key='qr-code-dialog'
    >
      <Drawer.Portal container={document.getElementById('qr-portal')}>
        <Drawer.Overlay className='fixed inset-0 z-[100] w-full bg-black/40 backdrop-blur-sm' />
        <Drawer.Content
          ref={dialogRef}
          role='dialog'
          aria-modal='true'
          aria-describedby={undefined}
          className='fixed inset-x-0 bottom-0 z-[110] flex h-[60vh] w-full flex-col rounded-t-2xl border border-zinc-700 bg-zinc-900 text-white outline-none'
          style={{ pointerEvents: 'auto' }}
        >
          <div className='relative flex w-full grow flex-col items-center overflow-y-auto px-4 md:px-6'>
            <Drawer.Close
              onClick={onClose}
              className='absolute right-4 top-4 flex items-center gap-1 text-sm font-semibold text-gray-400 transition-transform hover:text-gray-200 active:scale-90 md:right-6 md:top-6'
            >
              <X size={30} />
            </Drawer.Close>
            <Drawer.Title className='mt-4 text-lg font-semibold tracking-tight text-white md:text-2xl'>
              Криптовалютный платеж
            </Drawer.Title>
            <div className='flex w-full grow flex-col items-center justify-center'>
              <QRCodeCanvas
                ref={qrRef}
                value={walletAddress}
                size={200}
                bgColor='#ffffff'
                fgColor='black'
                level='H'
                marginSize={2}
                className='mb-3 rounded-xl'
              />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
