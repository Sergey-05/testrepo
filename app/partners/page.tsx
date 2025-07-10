'use client';

import { motion } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Users, Copy, Check, Share2 } from 'lucide-react';
import { LastReferrals } from '../ui/partners/LastReferrals';
import { useWebApp } from '../lib/hooks/useWebApp';
import Footer from '../ui/layout/footer';
import { useNotification } from '@/app/context/NotificContext';
import { useState } from 'react';
import useGlobalStore from '../store/useGlobalStore';
import { claimPartnerBonus } from '../lib/actions';

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className='h-[90px] w-full max-w-[200] rounded-[10px] bg-[radial-gradient(circle_120px_at_0%_0%,#27272a,#0a0a0a)] p-[1px]'>
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[8px] border border-zinc-800 bg-[radial-gradient(circle_140px_at_0%_0%,#18181b,#000)] text-white'>
      <div className='absolute z-10 h-[4px] w-[4px] animate-moveDot rounded-full bg-purple-500 shadow-[0_0_6px_#a78bfa]' />
      <div className='absolute left-0 top-0 h-5 w-[100px] rotate-[40deg] rounded-full bg-purple-500/30 opacity-30 blur-[8px]' />
      <div className='absolute left-0 top-[10px] h-px w-full bg-gradient-to-r from-violet-900 to-transparent' />
      <div className='absolute bottom-[10px] left-0 h-px w-full bg-zinc-800' />
      <div className='absolute left-[10px] top-0 h-full w-px bg-gradient-to-b from-violet-900 to-transparent' />
      <div className='absolute right-[10px] top-0 h-full w-px bg-zinc-800' />
      <p className='bg-gradient-to-br from-white via-purple-400 to-white bg-clip-text text-[13px] font-semibold leading-none text-transparent'>
        {value}
      </p>
      <p className='mt-0.5 text-[9px] text-zinc-500'>{label}</p>
    </div>
  </div>
);

export default function PartnersPage() {
  const {
    user,
    partnerEarnings,
    totalUsers,
    hasPartnerWithMinDeposit,
    setUser,
    totalReferrals,
  } = useGlobalStore();

  const WebApp = useWebApp();
  const { showNotification } = useNotification();
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);

  // Формируем реферальную ссылку на основе telegram_id пользователя
  const referralLink = user
    ? `https://t.me/PlusAppRobot?start=${user.telegram_id}`
    : '';

  // Сумма реферальных начислений
  const referralEarnings = partnerEarnings.reduce(
    (sum, earning) =>
      sum + (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
    0,
  );

  const formattedReferralEarnings = Number(referralEarnings.toFixed(2));

  // Партнеры с депозитами (подсчет уникальных partner_telegram_id с транзакциями депозита)
  const partnersWithDeposit = [
    ...new Set(
      partnerEarnings
        .filter((earning) => earning.transaction_id !== null)
        .map((earning) => earning.partner_telegram_id),
    ),
  ].length;

  // Право на бонус (1 партнер с депозитом >= 5000)
  const bonusEligible = partnersWithDeposit >= 1 && hasPartnerWithMinDeposit;

  // Статус бонуса из user.partner_bonus_received
  const bonusStatus = user?.partner_bonus_received || false;

  const handleInviteFriend = () => {
    if (WebApp && referralLink) {
      WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(
          referralLink,
        )}&text=${encodeURIComponent(
          '☝️ Переходи по ссылке в лучший Telegram трейдинг. Зарабатывай ежедневно от 5000₽ до 50000₽, нужны только интернет и смартфон 📱',
        )}`,
      );
    } else {
      showNotification('Ошибка', 'error', 'Попробуйте снова.');
    }
  };

  const handleCopy = () => {
    showNotification(
      'Успешно скопировано!',
      'success',
      'Теперь поделитесь ею с друзьями',
    );
  };

  const handleClaimBonus = async () => {
    if (!user || !bonusEligible || bonusStatus) return;

    setIsClaimingBonus(true);
    try {
      const updatedUser = await claimPartnerBonus(user.telegram_id);
      setUser(updatedUser);
      showNotification(
        'Бонус успешно получен!',
        'success',
        '1000 ₽ перечислено на депозит',
      );
    } catch {
      showNotification(
        'Ошибка получения бонуса',
        'error',
        'Попробуйте снова позже',
      );
    } finally {
      setIsClaimingBonus(false);
    }
  };

  const declineWord = (
    number: number,
    words: [string, string, string],
  ): string => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return words[2];
    if (n1 > 1 && n1 < 5) return words[1];
    if (n1 === 1) return words[0];
    return words[2];
  };

  return (
    <motion.div
      className='flex w-full flex-col items-center p-2'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style jsx>{`
        .stepper-box {
          background-color: #1a1a1d;
          border-radius: 14px;
          padding: 20px;
          border: 1px solid #2e2e30;
        }

        .stepper-step {
          display: flex;
          position: relative;
        }

        .stepper-line {
          position: absolute;
          left: 18px;
          top: 18px;
          height: 100%;
          width: 1.5px;
          background-color: #2e2e30;
          z-index: 0;
        }

        .stepper-step:last-child .stepper-line {
          display: none;
        }

        .stepper-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          font-size: 14px;
          z-index: 1;
          position: relative;
          background-color: #1a1a1d;
        }

        .stepper-completed .stepper-circle {
          background-color: #8b5cf6;
          color: white;
        }

        .stepper-active .stepper-circle {
          border: 2px solid #8b5cf6;
          color: #8b5cf6;
        }

        .stepper-pending .stepper-circle {
          border: 1.5px solid #3f3f46;
          color: #52525b;
        }

        .stepper-content {
          flex: 1;
          margin-bottom: 10px;
        }

        .stepper-title {
          font-weight: 500;
          color: #e5e5e5;
          font-size: 14px;
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .stepper-status {
          font-size: 11px;
          display: inline-block;
          padding: 2px 6px;
          border-radius: 8px;
        }

        .stepper-completed .stepper-status,
        .stepper-active .stepper-status {
          background-color: #27272a;
          color: #8b5cf6;
        }

        .stepper-pending .stepper-status {
          background-color: #232326;
          color: #52525b;
        }

        .stepper-desc {
          font-size: 11px;
          color: #6b7280;
        }
      `}</style>

      <div className='mb-4 w-full text-center'>
        <h1 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
          Пассивный доход без усилий
        </h1>
        <p className='mt-2 text-sm text-zinc-400 sm:text-base'>
          Приглашайте участников по личной ссылке и получайте{' '}
          <span className='bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text font-semibold text-transparent'>
            12% от их депозитов
          </span>{' '}
          напрямую на баланс.
        </p>
      </div>

      <div className='relative mx-auto mb-6 w-full max-w-xs rounded-xl border border-zinc-800 bg-black/40 p-4 text-center shadow-[0_0_5px_#8b5cf640]'>
        <div className='absolute left-0 top-5 h-10 w-52 rotate-[15deg] rounded-full bg-purple-500/20 blur-md'></div>
        <p className='mt-1 text-3xl font-bold text-white'>
          {totalUsers.toLocaleString('ru-RU')}
        </p>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>
          {declineWord(totalUsers, ['участник', 'участника', 'участников'])}
        </p>
        <p className='mt-1 text-xs text-zinc-400'>доверяют нашей системе</p>
      </div>

      <div className='mb-4 w-full max-w-md'>
        <h2 className='mb-4 text-xl font-bold text-white'>
          Бонус до <span className='text-purple-400'>1000 ₽</span>
        </h2>
        <div className='stepper-box'>
          <div
            className={`stepper-step ${
              totalReferrals >= 1 ? 'stepper-completed' : 'stepper-pending'
            }`}
          >
            <div className='stepper-circle'>
              {totalReferrals >= 1 ? <Check className='h-5 w-5' /> : '1'}
            </div>
            <div className='stepper-line'></div>
            <div className='stepper-content'>
              <div className='stepper-title'>Пригласите первого партнёра</div>
              <div className='stepper-status'>
                {totalReferrals >= 1 ? 'Выполнено' : 'Ожидается'}
              </div>
              <div className='stepper-desc'>
                Приглашайте друзей по реферальной ссылке
              </div>
            </div>
          </div>
          <div
            className={`stepper-step ${
              partnersWithDeposit >= 1 && hasPartnerWithMinDeposit
                ? 'stepper-completed'
                : totalReferrals >= 1
                  ? 'stepper-active'
                  : 'stepper-pending'
            }`}
          >
            <div className='stepper-circle'>
              {partnersWithDeposit >= 1 && hasPartnerWithMinDeposit ? (
                <Check className='h-5 w-5' />
              ) : (
                '2'
              )}
            </div>
            <div className='stepper-line'></div>
            <div className='stepper-content'>
              <div className='stepper-title'>Депозит от 5000 ₽</div>
              <div className='stepper-status'>
                {partnersWithDeposit >= 1 && hasPartnerWithMinDeposit
                  ? 'Выполнено'
                  : totalReferrals >= 1
                    ? 'В процессе'
                    : 'Ожидается'}
              </div>
              <div className='stepper-desc'>
                Дождитесь депозита вашего партнера
              </div>
            </div>
          </div>
          <div
            className={`stepper-step ${
              bonusStatus
                ? 'stepper-completed'
                : bonusEligible
                  ? 'stepper-active'
                  : 'stepper-pending'
            }`}
          >
            <div className='stepper-circle'>
              {bonusStatus ? (
                <Check className='h-5 w-5' />
              ) : bonusEligible ? (
                <Check className='h-5 w-5' />
              ) : (
                '3'
              )}
            </div>
            <div className='stepper-content'>
              <div className='stepper-title'>Заберите бонус</div>
              <div className='stepper-status'>
                {bonusStatus
                  ? 'Выполнено'
                  : bonusEligible
                    ? 'Доступно'
                    : 'Ожидается'}
              </div>
              <div className='stepper-desc'>
                После выполнения условий получите 1000 ₽ на свой депозит
              </div>
            </div>
          </div>
          {bonusEligible && !bonusStatus && (
            <button
              onClick={handleClaimBonus}
              disabled={isClaimingBonus}
              className='group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {isClaimingBonus ? (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 17 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 animate-spin text-white'
                  >
                    <path
                      d='M8.5 0C10.0823 1.88681e-08 11.617 0.469192 12.9446 1.34824C14.2602 2.22728 15.2855 3.47672 15.891 4.93853C16.4965 6.40034 16.655 8.00887 16.3463 9.56072C16.0376 11.1126 15.2757 12.538 14.1569 13.6569C13.038 14.7757 11.6126 15.5376 10.0607 15.8463C8.50887 16.155 6.90034 15.9965 5.43853 15.391C3.97672 14.7855 2.72729 13.7602 1.84824 12.4446C0.969192 11.129 0.5 9.58225 0.5 8H2.5C2.5 9.18669 2.85189 10.3467 3.51118 11.3334C4.17047 12.3201 5.10754 13.0892 6.2039 13.5433C7.30026 13.9974 8.50666 14.1162 9.67054 13.8847C10.8344 13.6532 11.9035 13.0818 12.7426 12.2426C13.5818 11.4035 14.1532 10.3344 14.3847 9.17054C14.6162 8.00666 14.4974 6.80026 14.0433 5.7039C13.5892 4.60754 12.8201 3.67047 11.8334 3.01118C10.8467 2.35189 9.68669 2 8.5 2V0Z'
                      fill='currentColor'
                    />
                  </svg>
                ) : (
                  'Забрать бонус'
                )}
              </span>
              <div className='absolute inset-0 z-0 rounded-xl bg-purple-400 opacity-20 blur-lg transition-all duration-300 group-hover:opacity-30'></div>
            </button>
          )}
        </div>
      </div>

      <div className='mb-4 w-full max-w-md'>
        <div className='relative mb-4 flex items-center justify-between gap-4'>
          <div className='absolute inset-0 rounded-xl bg-purple-500/10 opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-70'></div>
          <button
            onClick={handleInviteFriend}
            className='group relative flex-1 rounded-lg border border-purple-700/50 bg-gradient-to-tr from-purple-900/50 via-black/30 to-black/40 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-black/50 transition-all duration-300 hover:bg-gradient-to-tr hover:from-purple-800 hover:via-purple-700/80 hover:to-purple-800 hover:shadow-lg hover:shadow-purple-900/50'
          >
            <div className='absolute inset-0 rounded-lg bg-purple-400/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30'></div>
            <span className='relative z-10 flex items-center justify-center gap-2'>
              <Share2 className='h-4 w-4 text-purple-400' />
              Пригласить друга
            </span>
          </button>
          <CopyToClipboard text={referralLink} onCopy={handleCopy}>
            <button className='group relative flex h-12 w-12 items-center justify-center rounded-full border border-purple-700/50 bg-gradient-to-tr from-purple-900/50 via-black/30 to-black/40 shadow-md shadow-black/50 transition-all duration-500 active:bg-gradient-to-tr active:from-purple-800 active:via-purple-700/80 active:to-purple-800 active:shadow-lg active:shadow-purple-900/50'>
              <div className='absolute inset-0 rounded-full bg-purple-400/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30'></div>
              <Copy className='relative z-10 h-5 w-5 text-white' />
            </button>
          </CopyToClipboard>
        </div>

        <div className='relative rounded-lg border border-zinc-700/50 bg-gradient-to-br from-black/50 via-black/40 to-black/50 px-5 py-4 text-center shadow-[0_0_10px_rgba(139,92,246,0.2)] backdrop-blur-sm'>
          <div className='absolute inset-0 rounded-lg bg-purple-500/10 opacity-50 blur-md'></div>
          <p className='mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-400'>
            Ваша реферальная ссылка
          </p>
          <CopyToClipboard text={referralLink} onCopy={handleCopy}>
            <div className='relative flex cursor-pointer items-center justify-center gap-2'>
              <p className='break-words text-sm font-semibold text-white'>
                {referralLink}
              </p>
            </div>
          </CopyToClipboard>
        </div>
      </div>

      <div className='mb-4 flex w-full max-w-md justify-between gap-2'>
        <StatCard
          value={totalReferrals.toLocaleString()}
          label={declineWord(totalReferrals, [
            'Партнер',
            'Партнера',
            'Партнеров',
          ])}
        />
        <StatCard
          value={`${formattedReferralEarnings.toLocaleString('ru-RU')} ₽`}
          label='Заработано'
        />
      </div>

      <div className='mb-4 w-full max-w-md rounded-lg border border-zinc-700/50 bg-gradient-to-br from-black/50 via-black/40 to-black/50 p-5 shadow-[0_0_10px_rgba(139,92,246,0.2)] backdrop-blur-sm'>
        <div className='absolute inset-0 rounded-lg bg-purple-500/10 opacity-50 blur-md'></div>
        <div className='relative flex items-center gap-2'>
          <div>
            <Users className='h-5 w-5 text-purple-400' />
          </div>
          <h2 className='text-base font-semibold text-white'>
            Правила реферальной программы
          </h2>
        </div>
        <div className='relative mt-3 border-l-2 border-purple-700/50 pl-4'>
          <ul className='list-inside list-none space-y-2 text-[11px] text-zinc-400'>
            <li>Приглашайте партнеров по уникальной ссылке</li>
            <li>
              После активации их депозита в стейкинге вы получите{' '}
              <span className='font-semibold text-purple-400'>
                12% от суммы
              </span>{' '}
              на ваш баланс
            </li>
            <li>Начисления происходят автоматически</li>
          </ul>
        </div>
      </div>

      <LastReferrals />

      <Footer />
    </motion.div>
  );
}
