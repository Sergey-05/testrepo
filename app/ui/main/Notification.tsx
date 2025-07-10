'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  message: string;
  description?: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

const colorMap = {
  success: {
    gradientFrom: '#34D399',
    gradientTo: '#059669',
    shadowColor: 'rgba(52, 211, 153, 0.15)',
    textColor: 'text-white',
    textSubColor: 'text-emerald-400/80',
    iconGradientFrom: '#34D399',
    iconGradientTo: '#059669',
    iconBlur: 'rgba(16, 185, 129, 0.4)',
    dotColors: ['#34D399', '#34D39980', '#34D3994D'],
  },
  info: {
    gradientFrom: '#FACC15',
    gradientTo: '#B45309',
    shadowColor: 'rgba(250, 204, 21, 0.15)',
    textColor: 'text-white',
    textSubColor: 'text-yellow-400/80',
    iconGradientFrom: '#FBBF24',
    iconGradientTo: '#B45309',
    iconBlur: 'rgba(234, 179, 8, 0.4)',
    dotColors: ['#FBBF24', '#FBBF2480', '#FBBF2430'],
  },
  error: {
    gradientFrom: '#EF4444',
    gradientTo: '#B91C1C',
    shadowColor: 'rgba(239, 68, 68, 0.15)',
    textColor: 'text-white',
    textSubColor: 'text-red-400/80',
    iconGradientFrom: '#F87171',
    iconGradientTo: '#B91C1C',
    iconBlur: 'rgba(220, 38, 38, 0.4)',
    dotColors: ['#EF4444', '#EF444480', '#EF444430'],
  },
};

const Notification: React.FC<NotificationProps> = ({
  message,
  description = '',
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const colors = colorMap[type] || colorMap.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={onClose}
        className='relative w-full max-w-md cursor-pointer rounded-xl p-[1px]'
        style={{
          background: `linear-gradient(to bottom left, ${colors.gradientFrom}, ${colors.gradientTo})`,
          boxShadow: `0 10px 15px -5px ${colors.shadowColor}, 0 5px 6px -5px ${colors.shadowColor}`,
        }}
      >
        <div
          className='relative flex items-center gap-3 rounded-xl bg-[#1a1a1a] px-4 py-2.5'
          style={{ userSelect: 'none' }}
        >
          <div
            className='relative flex h-9 w-9 items-center justify-center rounded-lg'
            style={{
              background: `linear-gradient(to bottom right, ${colors.iconGradientFrom}, ${colors.iconGradientTo})`,
              aspectRatio: '1 / 1', // сохраняем квадратность
              minWidth: '36px',
            }}
          >
            {type === 'success' && (
              <svg
                stroke='currentColor'
                viewBox='0 0 24 24'
                fill='none'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5 text-white'
                style={{ width: 20, height: 20 }}
              >
                <path d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
              </svg>
            )}
            {type === 'info' && (
              <svg
                stroke='currentColor'
                viewBox='0 0 24 24'
                fill='none'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5 text-white'
                style={{ width: 20, height: 20 }}
              >
                <path d='M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
              </svg>
            )}
            {type === 'error' && (
              <svg
                stroke='currentColor'
                viewBox='0 0 24 24'
                fill='none'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5 text-white'
                style={{ width: 20, height: 20 }}
              >
                <path d='M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.01' />
              </svg>
            )}

            <div
              className='absolute inset-0 rounded-lg blur-sm'
              style={{ backgroundColor: colors.iconBlur }}
            />
          </div>

          <div className='flex flex-col items-start overflow-hidden'>
            <span
              className={`truncate text-sm font-semibold ${colors.textColor}`}
            >
              {message}
            </span>
            {description && (
              <span
                className={`truncate text-[10px] font-medium opacity-80 ${colors.textSubColor}`}
              >
                {description}
              </span>
            )}
          </div>

          <div className='ml-auto flex items-center'>
            <button
              onClick={(e) => {
                e.stopPropagation(); // чтобы не срабатывал onClick на всем уведомлении
                onClose();
              }}
              className='rounded-md p-1 transition-opacity duration-200 hover:opacity-80'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 text-white/70'
                viewBox='0 0 20 20'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='4' y1='4' x2='16' y2='16' />
                <line x1='16' y1='4' x2='4' y2='16' />
              </svg>
            </button>
          </div>
        </div>

        <div
          className='absolute inset-0 rounded-xl opacity-20'
          style={{
            background: `linear-gradient(to bottom right, ${colors.gradientFrom}, ${colors.gradientTo})`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
