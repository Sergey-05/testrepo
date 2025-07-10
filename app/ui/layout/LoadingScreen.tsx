// 'use client';

// import React, { useEffect, useState } from 'react';

// interface LoadingScreenProps {
//   progress: number;
//   isVisible: boolean;
// }

// const LoadingScreen: React.FC<LoadingScreenProps> = ({
//   progress,
//   isVisible,
// }) => {
//   const [displayedStatus, setDisplayedStatus] = useState('Запуск платформы...');
//   const [nextStatus, setNextStatus] = useState<string | null>(null);
//   const [isSwiping, setIsSwiping] = useState(false);

//   useEffect(() => {
//     const statuses = [
//       { threshold: 20, text: 'Подключение к блокчейну...' },
//       { threshold: 70, text: 'Анализ активов...' },
//       { threshold: 90, text: 'Формирование портфеля...' },
//     ];
//     const newStatus = statuses.reduce((acc, status) => {
//       if (progress >= status.threshold) return status.text;
//       return acc;
//     }, 'Запуск платформы...');

//     if (newStatus !== displayedStatus) {
//       setIsSwiping(true); // Запускаем свайп
//       setNextStatus(newStatus); // Устанавливаем новый текст
//       setTimeout(() => {
//         setDisplayedStatus(newStatus); // Обновляем после анимации
//         setIsSwiping(false); // Сбрасываем
//         setNextStatus(null); // Очищаем
//       }, 400); // Длительность анимации
//     }
//   }, [progress, displayedStatus]);

//   return (
//     <>
//       <style jsx global>{`
//         .logo-path {
//           filter: drop-shadow(0 0 12px #9333ea);
//           animation: logoPulse 2.5s ease-in-out infinite alternate;
//         }
//         @keyframes logoPulse {
//           from {
//             filter: drop-shadow(0 0 6px #a855f7);
//           }
//           to {
//             filter: drop-shadow(0 0 20px #c084fc);
//           }
//         }
//         @keyframes gradientMove {
//           0% {
//             background-position: 0% 50%;
//           }
//           100% {
//             background-position: 200% 50%;
//           }
//         }
//         @keyframes shimmer {
//           0% {
//             background-position: -100% 0;
//           }
//           100% {
//             background-position: 200% 0;
//           }
//         }
//         .status-text {
//           background: linear-gradient(90deg, #a855f7, #7c3aed, #9333ea);
//           background-size: 200% 100%;
//           background-clip: text;
//           -webkit-background-clip: text;
//           color: transparent;
//           -webkit-text-fill-color: transparent;
//           animation: shimmer 2s ease-in-out infinite;
//         }
//         .loading-logo {
//           animation: logoPulse 2.5s ease-in-out infinite alternate;
//         }
//         .progress-bar {
//           background: linear-gradient(90deg, #a855f7, #9333ea, #7c3aed);
//           background-size: 200% 100%;
//           animation: gradientMove 2s linear infinite;
//         }
//         .text-wrapper {
//           position: relative;
//           height: 1.25rem; /* Высота для text-sm (~14px) */
//           width: 100%;
//           text-align: center;
//         }
//         .status-text-swipe-up {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           animation: swipeUp 0.4s ease-in-out forwards;
//         }
//         .status-text-swipe-in {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           animation: swipeIn 0.4s ease-in-out forwards;
//         }
//         @keyframes swipeUp {
//           0% {
//             transform: translateY(0);
//             opacity: 1;
//           }
//           100% {
//             transform: translateY(-100%);
//             opacity: 0;
//           }
//         }
//         @keyframes swipeIn {
//           0% {
//             transform: translateY(100%);
//             opacity: 0;
//           }
//           100% {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
//       `}</style>
//       <div
//         className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
//           isVisible ? 'opacity-100' : 'opacity-0'
//         }`}
//       >
//         <svg
//           xmlns='http://www.w3.org/2000/svg'
//           x='0'
//           y='0'
//           baseProfile='basic'
//           version='1.1'
//           viewBox='0 0 1920 1080'
//           preserveAspectRatio='xMidYMid meet'
//           className='loading-logo mb-12 h-auto w-60'
//         >
//           <path
//             d='M1526.3 609.4h99.9c1.4 19 15 25.7 30.7 29.1 27 5.9 54.2 5.7 81.3.5 4.6-.9 9.3-2.8 13.3-5.3 10.6-6.7 9.9-20.4-1.7-24.7-10.5-3.9-21.7-6-32.8-7.9-36.9-6.3-73.9-11.6-110.8-18.4-11.8-2.2-23.3-6.9-34.4-11.7-23.2-10.1-36.1-28.2-38.6-53.4-1.5-15.2-1.1-30.3 4.6-44.8 7.8-20 22.8-32.8 41.6-41.7 19.8-9.4 41-13.6 62.6-15.9 29.9-3.1 59.9-3.3 89.8 0 26 2.8 51.3 8.3 74 22.1 22.4 13.6 35.2 33.4 37.7 59.7.2 2.5 0 4.9 0 7.8h-97.1c-1.8-16.7-14.4-21.7-28.1-24.3-23.6-4.6-47.4-4.3-71 .6-4 .8-8 2.4-11.5 4.5-11 6.7-11 20.4.5 26 7.8 3.7 16.6 6.2 25.2 7.4 24.4 3.3 49 5.4 73.4 8.3 26.3 3 52.7 5.7 77.8 14.8 6.2 2.3 12.3 5.1 18.1 8.4 19.9 11.7 29.5 29.9 30.6 52.4.5 10.7-.2 21.8-2.5 32.2-5.7 25.8-23 42.1-46.2 52.9-22.2 10.3-45.9 14.6-70 17-28.2 2.8-56.6 3.1-84.9 1-30.4-2.2-60.2-7.1-87.5-21.9-26.9-14.6-42.1-37-44.3-67.9.2-2.2.3-4.4.3-6.8M1184.1 418.2h95.9v5.8c0 51.3-.2 102.7.3 154 .1 10.2 1.6 20.6 3.9 30.6 4.2 17.7 15.7 28.6 33.8 31.8 16.4 2.9 32.9 3.1 49.2-.5 19.2-4.2 30.7-17.9 33.8-40.3 1.3-9.2 1.9-18.6 2-27.9.2-49.2.1-98.3.1-147.5v-5.8h95.9v165.5c0 15.9-1.7 31.6-6.3 46.9-11.2 37.2-37.1 58.9-73.8 67.9-16.9 4.1-34.4 6.5-51.7 7.6-31.8 2-63.6 1.6-95-5.4-21.5-4.7-41.3-12.9-57.3-28.6-19.4-19.2-27.3-43.4-29.6-69.7-.9-10.4-1-21-1-31.4-.1-48.8 0-97.7 0-146.5-.2-2.1-.2-4.1-.2-6.5M522.2 483.7v-65.5c1.6-.1 3.2-.2 4.8-.2 67.5 0 135 0 202.4.2 20.5.1 40.5 3.5 59.2 12.1 32.1 14.7 48.5 40.4 51.1 75.2 1.2 16.1-.3 31.9-5.9 47.2-10.3 28-31.7 43.6-59 52.2-18.2 5.7-37.1 8-56.1 8.1-31.5.1-63 .1-94.5.1h-6v87.7h-95.7V548.4h6.1c56.1 0 112.3.1 168.4-.1 7.6 0 15.4-.5 22.7-2.4 20.2-5.1 30-30.2 19.3-48.2-4.8-8-12.6-11.3-21.2-12.5-6.9-1-13.9-1.3-20.9-1.4-56-.1-112-.1-167.9-.1zM872.5 418.1h95.4v217.7h183.3v64.8H872.6c-.1-93.9-.1-187.9-.1-282.5M316 628c1.3-2.1 2.4-4.3 3.9-6.3 19.1-25.6 38.3-51.2 57.5-76.8 1.1-1.5 2.1-3 3.7-5.2H251.9V412.9c-.4-.1-.7-.3-1.1-.4-20.8 27.7-41.6 55.4-63.2 84.1V367.5c1.5-.1 2.8-.3 4.1-.3 40 0 80 .1 120-.1 4.1 0 5.2 1.5 5.2 5.2 0 39.7 0 79.3-.1 119 0 1.5-.1 2.9-.3 5.1h127.9V626h-5.6c-38.3 0-76.7 0-115 .1-2.5 0-5.1 1.2-7.8 1.9'
//             fill='#fff'
//             className='logo-path'
//           />
//           <path
//             d='M316 628c.2 1.3.5 2.6.5 3.9v119.5c0 1.1-.2 2.3-.3 3.8-1.6.1-3 .3-4.5.3-39.5 0-79-.1-118.5.1-4.9 0-5.7-1.6-5.7-6 .1-39.2 0-78.3.2-117.5 0-5-1.2-6.5-6.4-6.5-39 .2-78 .1-117 .1h-5.8V497.2H187c-21.4 28.5-42.4 56.5-64.1 85.4h128.9v128.2c.3.1.6.2 1 .3 6.3-8.3 12.5-16.7 18.8-25 13.8-18.4 27.5-36.8 41.3-55.2.9-1 2.1-1.9 3.1-2.9'
//             fill='#fff'
//             className='logo-path'
//           />
//         </svg>

//         {/* Прогресс-бар */}
//         <div
//           className='mt-6 h-3 w-60 overflow-hidden rounded-full'
//           style={{
//             backgroundColor: '#1a1a1a',
//             boxShadow: '0 0 10px rgba(168, 85, 247, 0.25)',
//           }}
//         >
//           <div
//             className='progress-bar h-full'
//             style={{
//               width: `${Math.min(Math.max(progress, 0), 100)}%`,
//               transition: 'width 0.3s ease-out',
//             }}
//           />
//         </div>

//         {/* Текст статуса */}
//         <div className='text-wrapper mt-6 text-sm font-medium'>
//           <div
//             className={`status-text ${isSwiping ? 'status-text-swipe-up' : ''}`}
//           >
//             {displayedStatus}
//           </div>
//           {nextStatus && (
//             <div className='status-text status-text-swipe-in'>{nextStatus}</div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default LoadingScreen;

'use client';

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress: number;
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  isVisible,
}) => {
  const [displayedStatus, setDisplayedStatus] = useState('Запуск платформы...');
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const statuses = [
      { threshold: 15, text: 'Подключение к блокчейну...' },
      { threshold: 40, text: 'Анализ активов...' },
      { threshold: 70, text: 'Анализ активов...' },
      { threshold: 90, text: 'Формирование портфеля...' },
    ];
    const newStatus = statuses.reduce((acc, status) => {
      if (progress >= status.threshold) return status.text;
      return acc;
    }, 'Запуск платформы...');

    if (newStatus !== displayedStatus) {
      setIsSwiping(true); // Запускаем свайп
      setNextStatus(newStatus); // Устанавливаем новый текст
      setTimeout(() => {
        setDisplayedStatus(newStatus); // Обновляем после анимации
        setIsSwiping(false); // Сбрасываем
        setNextStatus(null); // Очищаем
      }, 400); // Длительность анимации
    }
  }, [progress, displayedStatus]);

  return (
    <>
      <style jsx global>{`
        .logo-path {
          filter: drop-shadow(0 0 12px #9333ea);
          animation: logoPulse 2.5s ease-in-out infinite alternate;
        }
        @keyframes logoPulse {
          from {
            filter: drop-shadow(0 0 6px #a855f7);
          }
          to {
            filter: drop-shadow(0 0 20px #c084fc);
          }
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .status-text {
          background: linear-gradient(90deg, #a855f7, #7c3aed, #9333ea);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s ease-in-out infinite;
        }
        .loading-logo {
          animation: logoPulse 2.5s ease-in-out infinite alternate;
        }
        .progress-bar {
          background: linear-gradient(90deg, #a855f7, #9333ea, #7c3aed);
          background-size: 200% 100%;
          animation: gradientMove 2s linear infinite;
        }
        .text-wrapper {
          position: relative;
          height: 1.25rem; /* Высота для text-sm (~14px) */
          width: 100%;
          text-align: center;
        }
        .status-text-swipe-up {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          animation: swipeUp 0.4s ease-in-out forwards;
        }
        .status-text-swipe-in {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          animation: swipeIn 0.4s ease-in-out forwards;
        }
        @keyframes swipeUp {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        @keyframes swipeIn {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          x='0'
          y='0'
          baseProfile='basic'
          version='1.1'
          viewBox='0 0 1920 1080'
          preserveAspectRatio='xMidYMid meet'
          className='loading-logo mb-12 h-auto w-60'
        >
          <path
            d='M1526.3 609.4h99.9c1.4 19 15 25.7 30.7 29.1 27 5.9 54.2 5.7 81.3.5 4.6-.9 9.3-2.8 13.3-5.3 10.6-6.7 9.9-20.4-1.7-24.7-10.5-3.9-21.7-6-32.8-7.9-36.9-6.3-73.9-11.6-110.8-18.4-11.8-2.2-23.3-6.9-34.4-11.7-23.2-10.1-36.1-28.2-38.6-53.4-1.5-15.2-1.1-30.3 4.6-44.8 7.8-20 22.8-32.8 41.6-41.7 19.8-9.4 41-13.6 62.6-15.9 29.9-3.1 59.9-3.3 89.8 0 26 2.8 51.3 8.3 74 22.1 22.4 13.6 35.2 33.4 37.7 59.7.2 2.5 0 4.9 0 7.8h-97.1c-1.8-16.7-14.4-21.7-28.1-24.3-23.6-4.6-47.4-4.3-71 .6-4 .8-8 2.4-11.5 4.5-11 6.7-11 20.4.5 26 7.8 3.7 16.6 6.2 25.2 7.4 24.4 3.3 49 5.4 73.4 8.3 26.3 3 52.7 5.7 77.8 14.8 6.2 2.3 12.3 5.1 18.1 8.4 19.9 11.7 29.5 29.9 30.6 52.4.5 10.7-.2 21.8-2.5 32.2-5.7 25.8-23 42.1-46.2 52.9-22.2 10.3-45.9 14.6-70 17-28.2 2.8-56.6 3.1-84.9 1-30.4-2.2-60.2-7.1-87.5-21.9-26.9-14.6-42.1-37-44.3-67.9.2-2.2.3-4.4.3-6.8M1184.1 418.2h95.9v5.8c0 51.3-.2 102.7.3 154 .1 10.2 1.6 20.6 3.9 30.6 4.2 17.7 15.7 28.6 33.8 31.8 16.4 2.9 32.9 3.1 49.2-.5 19.2-4.2 30.7-17.9 33.8-40.3 1.3-9.2 1.9-18.6 2-27.9.2-49.2.1-98.3.1-147.5v-5.8h95.9v165.5c0 15.9-1.7 31.6-6.3 46.9-11.2 37.2-37.1 58.9-73.8 67.9-16.9 4.1-34.4 6.5-51.7 7.6-31.8 2-63.6 1.6-95-5.4-21.5-4.7-41.3-12.9-57.3-28.6-19.4-19.2-27.3-43.4-29.6-69.7-.9-10.4-1-21-1-31.4-.1-48.8 0-97.7 0-146.5-.2-2.1-.2-4.1-.2-6.5M522.2 483.7v-65.5c1.6-.1 3.2-.2 4.8-.2 67.5 0 135 0 202.4.2 20.5.1 40.5 3.5 59.2 12.1 32.1 14.7 48.5 40.4 51.1 75.2 1.2 16.1-.3 31.9-5.9 47.2-10.3 28-31.7 43.6-59 52.2-18.2 5.7-37.1 8-56.1 8.1-31.5.1-63 .1-94.5.1h-6v87.7h-95.7V548.4h6.1c56.1 0 112.3.1 168.4-.1 7.6 0 15.4-.5 22.7-2.4 20.2-5.1 30-30.2 19.3-48.2-4.8-8-12.6-11.3-21.2-12.5-6.9-1-13.9-1.3-20.9-1.4-56-.1-112-.1-167.9-.1zM872.5 418.1h95.4v217.7h183.3v64.8H872.6c-.1-93.9-.1-187.9-.1-282.5M316 628c1.3-2.1 2.4-4.3 3.9-6.3 19.1-25.6 38.3-51.2 57.5-76.8 1.1-1.5 2.1-3 3.7-5.2H251.9V412.9c-.4-.1-.7-.3-1.1-.4-20.8 27.7-41.6 55.4-63.2 84.1V367.5c1.5-.1 2.8-.3 4.1-.3 40 0 80 .1 120-.1 4.1 0 5.2 1.5 5.2 5.2 0 39.7 0 79.3-.1 119 0 1.5-.1 2.9-.3 5.1h127.9V626h-5.6c-38.3 0-76.7 0-115 .1-2.5 0-5.1 1.2-7.8 1.9'
            fill='#fff'
            className='logo-path'
          />
          <path
            d='M316 628c.2 1.3.5 2.6.5 3.9v119.5c0 1.1-.2 2.3-.3 3.8-1.6.1-3 .3-4.5.3-39.5 0-79-.1-118.5.1-4.9 0-5.7-1.6-5.7-6 .1-39.2 0-78.3.2-117.5 0-5-1.2-6.5-6.4-6.5-39 .2-78 .1-117 .1h-5.8V497.2H187c-21.4 28.5-42.4 56.5-64.1 85.4h128.9v128.2c.3.1.6.2 1 .3 6.3-8.3 12.5-16.7 18.8-25 13.8-18.4 27.5-36.8 41.3-55.2.9-1 2.1-1.9 3.1-2.9'
            fill='#fff'
            className='logo-path'
          />
        </svg>

        {/* Прогресс-бар */}
        <div
          className='mt-6 h-3 w-60 overflow-hidden rounded-full'
          style={{
            backgroundColor: '#1a1a1a',
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.25)',
          }}
        >
          <div
            className='progress-bar h-full'
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>

        {/* Текст статуса */}
        <div className='text-wrapper mt-6 text-sm font-medium'>
          <div
            className={`status-text ${isSwiping ? 'status-text-swipe-up' : ''}`}
          >
            {displayedStatus}
          </div>
          {nextStatus && (
            <div className='status-text status-text-swipe-in'>{nextStatus}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
