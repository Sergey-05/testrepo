// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import useGlobalStore from '@/app/store/useGlobalStore';
// import {
//   fetchInitialData,
//   createUser,
//   updateUserTgData,
// } from '@/app/lib/dataQuery';
// import LoadingScreen from '@/app/ui/layout/LoadingScreen';
// import { UserDataTg } from '@/app/lib/definition';
// import { useNotification } from '@/app/context/NotificContext';
// import { useWebApp } from '@/app/lib/hooks/useWebApp';

// export default function DataLoader() {
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [isVisible, setIsVisible] = useState(true);
//   const [webAppReady, setWebAppReady] = useState(false);

//   const { showNotification } = useNotification();
//   const WebApp = useWebApp();

//   const {
//     setUser,
//     setTransactions,
//     setPartnerEarnings,
//     setDepositEarnings,
//     setReinvestments,
//     setRecentTransactions,
//     setTotalUsers,
//     setHasPartnerWithMinDeposit,
//     setTotalReferrals,
//     setAppConfig,
//   } = useGlobalStore();

//   useEffect(() => {
//     if (WebApp && WebApp.initDataUnsafe?.user) {
//       setWebAppReady(true);
//     }
//   }, [WebApp]);

//   const animationFrameRef = useRef<number | null>(null);

//   function animateProgress(
//     target: number,
//     duration: number = 500,
//   ): Promise<void> {
//     return new Promise((resolve) => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current); // отмена предыдущей анимации
//       }

//       let start: number | null = null;
//       const initial = progress;
//       const delta = target - initial;

//       const step = (timestamp: number) => {
//         if (!start) start = timestamp;
//         const elapsed = timestamp - start;
//         const progressRatio = Math.min(elapsed / duration, 1);
//         const current = Math.round(initial + delta * progressRatio);

//         // Гарантия движения только вперед
//         setProgress((prev) => (current > prev ? current : prev));

//         if (progressRatio < 1) {
//           animationFrameRef.current = requestAnimationFrame(step);
//         } else {
//           animationFrameRef.current = null;
//           resolve();
//         }
//       };

//       animationFrameRef.current = requestAnimationFrame(step);
//     });
//   }

//   useEffect(() => {
//     let isMounted = true;

//     const loadData = async () => {
//       const user = WebApp?.initDataUnsafe?.user;
//       if (!user) {
//         showNotification(
//           'Ошибка инициализации Telegram',
//           'error',
//           'Не удалось получить данные пользователя Telegram',
//         );
//         return;
//       }

//       const telegramId = BigInt(user.id);

//       WebApp.lockOrientation();
//       WebApp.disableVerticalSwipes();
//       WebApp.expand();
//       WebApp.setHeaderColor('#000000');
//       WebApp.setBottomBarColor('#000000');

//       try {
//         await animateProgress(15, 300); // 300ms до 15%
//         await new Promise((res) => setTimeout(res, 100));
//         const data = await fetchInitialData(telegramId);
//         if (!isMounted) return;
//         await animateProgress(40, 400); // 400ms до 40%
//         await new Promise((res) => setTimeout(res, 100));

//         const tgUser = user as UserDataTg;

//         if (data.user) {
//           const updatedUser = await updateUserTgData(
//             data.user.telegram_id.toString(),
//             tgUser.first_name,
//             tgUser.photo_url,
//             tgUser.username,
//           );
//           setUser(updatedUser);
//         } else {
//           const newUser = await createUser(
//             telegramId,
//             tgUser.first_name,
//             tgUser.photo_url,
//             tgUser.username,
//           );
//           setUser(newUser);
//         }

//         await animateProgress(70, 400); // 400ms до 70%
//         await new Promise((res) => setTimeout(res, 100));

//         setTransactions(data.transactions || []);
//         setPartnerEarnings(data.partnerEarnings || []);
//         setDepositEarnings(data.depositEarnings || []);
//         setReinvestments(data.reinvestments || []);
//         setRecentTransactions(data.recentTransactions || []);
//         setTotalUsers(data.totalUsers || 0);
//         setHasPartnerWithMinDeposit(data.hasPartnerWithMinDeposit);
//         setTotalReferrals(data.totalReferrals || 0);
//         setAppConfig(
//           data.appConfig?.[0] || {
//             id: 1,
//             manager_link: 'manager_link',
//             referral_percent: 12,
//           },
//         );

//         await animateProgress(90, 300); // 300ms до 90%
//         await new Promise((res) => setTimeout(res, 100));
//         await animateProgress(100, 200); // 200ms до 100%
//         await new Promise((res) => setTimeout(res, 100));

//         if (isMounted) {
//           setIsVisible(false);
//           setTimeout(() => setIsDataLoaded(true), 500);
//         }
//       } catch (error) {
//         console.error('Ошибка загрузки данных:', error);
//         if (isMounted) {
//           showNotification(
//             'Ошибка загрузки',
//             'error',
//             'Попробуйте перезапустить приложение',
//           );
//         }
//       }
//     };

//     if (webAppReady) {
//       loadData();
//     }

//     return () => {
//       isMounted = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [webAppReady]); // Пустой массив зависимостей для однократного вызова

//   if (!isDataLoaded) {
//     return <LoadingScreen progress={progress} isVisible={isVisible} />;
//   }

//   return null;
// }
'use client';

import { useEffect, useRef, useState } from 'react';
import useGlobalStore from '@/app/store/useGlobalStore';
import {
  fetchInitialData,
  createUser,
  updateUserTgData,
} from '@/app/lib/dataQuery';
import LoadingScreen from '@/app/ui/layout/LoadingScreen';
import { UserDataTg } from '@/app/lib/definition';
import { useNotification } from '@/app/context/NotificContext';
import { useWebApp } from '@/app/lib/hooks/useWebApp';
import DepositEarningsModal from '@/app/ui/modals/DepositEarningsModal';

export default function DataLoader() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [webAppReady, setWebAppReady] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  const { showNotification } = useNotification();
  const WebApp = useWebApp();

  const {
    setUser,
    setTransactions,
    setPartnerEarnings,
    setDepositEarnings,
    setReinvestments,
    setRecentTransactions,
    setTotalUsers,
    setHasPartnerWithMinDeposit,
    setTotalReferrals,
    setAppConfig,
  } = useGlobalStore();

  useEffect(() => {
    if (WebApp && WebApp.initDataUnsafe?.user) {
      setWebAppReady(true);
    }
  }, [WebApp]);

  const animationFrameRef = useRef<number | null>(null);

  function animateProgress(
    target: number,
    duration: number = 500,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      let start: number | null = null;
      const initial = progress;
      const delta = target - initial;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progressRatio = Math.min(elapsed / duration, 1);
        const current = Math.round(initial + delta * progressRatio);

        setProgress((prev) => (current > prev ? current : prev));

        if (progressRatio < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
          resolve();
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    });
  }

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const user = WebApp?.initDataUnsafe?.user;
      if (!user) {
        showNotification(
          'Ошибка инициализации Telegram',
          'error',
          'Не удалось получить данные пользователя Telegram',
        );
        return;
      }

      const telegramId = BigInt(user.id);

      WebApp.lockOrientation();
      WebApp.disableVerticalSwipes();
      WebApp.expand();
      WebApp.setHeaderColor('#000000');
      WebApp.setBottomBarColor('#000000');

      try {
        await animateProgress(15, 300);
        await new Promise((res) => setTimeout(res, 100));
        const data = await fetchInitialData(telegramId);
        if (!isMounted) return;
        await animateProgress(40, 400);
        await new Promise((res) => setTimeout(res, 100));

        const tgUser = user as UserDataTg;

        if (data.user) {
          const updatedUser = await updateUserTgData(
            data.user.telegram_id.toString(),
            tgUser.first_name,
            tgUser.photo_url,
            tgUser.username,
          );
          setUser(updatedUser);
        } else {
          const newUser = await createUser(
            telegramId,
            tgUser.first_name,
            tgUser.photo_url,
            tgUser.username,
          );
          setUser(newUser);
        }

        await animateProgress(70, 400);
        await new Promise((res) => setTimeout(res, 100));

        setTransactions(data.transactions || []);
        setPartnerEarnings(data.partnerEarnings || []);
        setDepositEarnings(data.depositEarnings || []);
        setReinvestments(data.reinvestments || []);
        setRecentTransactions(data.recentTransactions || []);
        setTotalUsers(data.totalUsers || 0);
        setHasPartnerWithMinDeposit(data.hasPartnerWithMinDeposit);
        setTotalReferrals(data.totalReferrals || 0);
        setAppConfig(
          data.appConfig?.[0] || {
            id: 1,
            manager_link: 'manager_link',
            referral_percent: 12,
          },
        );

        await animateProgress(90, 300);
        await new Promise((res) => setTimeout(res, 100));
        await animateProgress(100, 200);
        await new Promise((res) => setTimeout(res, 100));

        if (isMounted) {
          setIsVisible(false);
          setTimeout(() => {
            setIsDataLoaded(true);
          }, 500);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        if (isMounted) {
          showNotification(
            'Ошибка загрузки',
            'error',
            'Попробуйте перезапустить приложение',
          );
        }
      }
    };

    if (webAppReady) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webAppReady]);

  // Устанавливаем hasShownModal после первого рендера модального окна
  useEffect(() => {
    if (isDataLoaded && !hasShownModal) {
      setHasShownModal(true);
    }
  }, [isDataLoaded, hasShownModal]);

  if (!isDataLoaded) {
    return <LoadingScreen progress={progress} isVisible={isVisible} />;
  }

  return hasShownModal ? null : <DepositEarningsModal />;
}
