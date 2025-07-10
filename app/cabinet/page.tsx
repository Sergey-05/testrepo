'use client';

import { useMemo } from 'react';
import { tariffs } from '@/app/lib/constants/tariffs';
import { TariffCard } from '../ui/cabinet/TariffCard';
import { TotalEarnedCard } from '../ui/cabinet/TotalEarnedCard';
import { ProfitChart } from '../ui/cabinet/ProfitChart';
import Footer from '../ui/layout/footer';
import { motion } from 'framer-motion';
import useGlobalStore from '@/app/store/useGlobalStore';
import {
  Transaction,
  PartnerEarning,
  DepositEarning,
} from '@/app/lib/definition';

export default function InvestmentDashboard() {
  const {
    user,
    transactions,
    partnerEarnings,
    depositEarnings,
    reinvestments,
    totalReferrals,
  } = useGlobalStore();

  const deposit = user?.deposit_amount || 0;

  const totalIncome = useMemo(() => {
    const depositProfit =
      depositEarnings && Array.isArray(depositEarnings)
        ? depositEarnings
            .filter((earning: DepositEarning) => earning?.last_collected_at)
            .reduce(
              (sum: number, earning: DepositEarning) =>
                sum +
                (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
              0,
            )
        : 0;
    const partnerProfit =
      partnerEarnings && Array.isArray(partnerEarnings)
        ? partnerEarnings.reduce(
            (sum: number, earning: PartnerEarning) =>
              sum +
              (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
            0,
          )
        : 0;
    const total = Number(depositProfit + partnerProfit);
    return Number(total.toFixed(2));
  }, [depositEarnings, partnerEarnings]);

  const profitPercentage = useMemo(() => {
    if (deposit <= 0) return 0.0;
    return Number(((totalIncome / deposit) * 100).toFixed(2));
  }, [totalIncome, deposit]);

  const referralProfit = useMemo(() => {
    const profit =
      partnerEarnings && Array.isArray(partnerEarnings)
        ? partnerEarnings.reduce(
            (sum: number, earning: PartnerEarning) =>
              sum +
              (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
            0,
          )
        : 0;
    return Number(profit.toFixed(2));
  }, [partnerEarnings]);

  const depositCount = useMemo(() => {
    if (!transactions || !reinvestments) return 0;
    const depositTransactions = transactions.filter(
      (tx: Transaction) => tx.type === 'deposit' && tx.status === 'approved',
    ).length;
    const reinvestmentCount = reinvestments.length;
    return depositTransactions + reinvestmentCount;
  }, [transactions, reinvestments]);

  const lastCollectedAt = user?.last_deposit_at || null;

  const profitData = useMemo(() => {
    const today = new Date();
    const data: { name: string; value: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date
        .toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        })
        .replace(/(\d{2})\.(\d{2})\.\d{4}/, '$1.$2');

      const depositProfit =
        depositEarnings
          ?.filter(
            (earning: DepositEarning) =>
              earning.last_collected_at &&
              new Date(earning.last_collected_at).toLocaleDateString(
                'ru-RU',
              ) === date.toLocaleDateString('ru-RU'),
          )
          .reduce(
            (sum: number, earning: DepositEarning) =>
              sum +
              (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
            0,
          ) || 0;

      const partnerProfit =
        partnerEarnings
          ?.filter(
            (earning: PartnerEarning) =>
              earning.created_at &&
              new Date(earning.created_at).toLocaleDateString('ru-RU') ===
                date.toLocaleDateString('ru-RU'),
          )
          .reduce(
            (sum: number, earning: PartnerEarning) =>
              sum +
              (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
            0,
          ) || 0;

      data.push({
        name: formattedDate,
        value: Number((depositProfit + partnerProfit).toFixed(2)),
      });
    }
    return data;
  }, [depositEarnings, partnerEarnings]);

  const currentTariff = useMemo(() => {
    return (
      tariffs
        .filter((t) => deposit >= (t.amountMin ?? 0))
        .sort((a, b) => b.rate - a.rate)[0] || null
    );
  }, [deposit]);

  const nextTariff = useMemo(() => {
    return tariffs
      .filter((t) => (t.amountMin ?? 0) > deposit)
      .sort((a, b) => (a.amountMin ?? 0) - (b.amountMin ?? 0))[0];
  }, [deposit]);

  const accumulation = useMemo(() => {
    if (
      !depositEarnings ||
      !Array.isArray(depositEarnings) ||
      !user ||
      !currentTariff ||
      user.deposit_amount <= 0
    ) {
      return 0.0;
    }
    const total = depositEarnings
      .filter((earning: DepositEarning) => !earning?.last_collected_at)
      .reduce(
        (sum: number, earning: DepositEarning) =>
          sum + (isNaN(Number(earning?.amount)) ? 0 : Number(earning.amount)),
        0,
      );
    return Number(total.toFixed(2));
  }, [depositEarnings, user, currentTariff]);

  return (
    <motion.div
      className='w-full space-y-4 p-2'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TariffCard
        nextTariff={nextTariff}
        tariff={currentTariff}
        deposit={deposit}
        accumulation={accumulation}
        profitPercentage={profitPercentage}
      />
      <TotalEarnedCard deposit={deposit} totalIncome={totalIncome} />
      <ProfitChart
        profitData={profitData}
        deposit={deposit}
        depositCount={depositCount}
        referralProfit={referralProfit}
        totalReferrals={totalReferrals}
        lastCollectedAt={lastCollectedAt}
        currentTariff={currentTariff}
      />
      <Footer />
    </motion.div>
  );
}
