'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  User,
  Transaction,
  PartnerEarning,
  DepositEarning,
  Cryptocurrency,
  Tariff,
  Card,
  CryptoWallet,
  Reinvestment,
  Bonus,
  AppConfig,
} from '../lib/definition';

interface GlobalState {
  user: User | null;
  transactions: Transaction[];
  partnerEarnings: PartnerEarning[];
  depositEarnings: DepositEarning[] | null;
  cryptocurrencies: Cryptocurrency[];
  tariffs: Tariff[];
  cards: Card[];
  cryptoWallets: CryptoWallet[];
  reinvestments: Reinvestment[];
  recentTransactions: Transaction[];
  totalUsers: number;
  hasPartnerWithMinDeposit: boolean;
  bonuses: Bonus[];
  totalReferrals: number;
  appConfig: AppConfig;
  setUser: (user: User) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPartnerEarnings: (earnings: PartnerEarning[]) => void;
  setDepositEarnings: (earnings: DepositEarning[] | null) => void;
  setCryptocurrencies: (cryptos: Cryptocurrency[]) => void;
  setTariffs: (tariffs: Tariff[]) => void;
  setCards: (cards: Card[]) => void;
  setCryptoWallets: (wallets: CryptoWallet[]) => void;
  setReinvestments: (reinvestments: Reinvestment[]) => void;
  setRecentTransactions: (transactions: Transaction[]) => void;
  setTotalUsers: (count: number) => void;
  setHasPartnerWithMinDeposit: (value: boolean) => void;
  setBonuses: (bonuses: Bonus[]) => void;
  setTotalReferrals: (value: number) => void;
  setAppConfig: (value: AppConfig) => void;
}

const useGlobalStore = create<GlobalState>()(
  devtools(
    (set) => ({
      user: null,
      transactions: [],
      partnerEarnings: [],
      depositEarnings: [],
      cryptocurrencies: [],
      tariffs: [],
      cards: [],
      cryptoWallets: [],
      reinvestments: [],
      recentTransactions: [],
      totalUsers: 0,
      hasPartnerWithMinDeposit: false,
      bonuses: [],
      totalReferrals: 0,
      appConfig: null,
      setUser: (user) => set({ user }),
      setTransactions: (transactions) => set({ transactions }),
      setPartnerEarnings: (earnings) => set({ partnerEarnings: earnings }),
      setDepositEarnings: (earnings) => set({ depositEarnings: earnings }),
      setCryptocurrencies: (cryptos) => set({ cryptocurrencies: cryptos }),
      setTariffs: (tariffs) => set({ tariffs }),
      setCards: (cards) => set({ cards }),
      setCryptoWallets: (wallets) => set({ cryptoWallets: wallets }),
      setReinvestments: (reinvestments) => set({ reinvestments }),
      setRecentTransactions: (transactions) => set({ recentTransactions: transactions }),
      setTotalUsers: (count) => set({ totalUsers: count }),
      setHasPartnerWithMinDeposit: (value) => set({ hasPartnerWithMinDeposit: value }),
      setBonuses: (value) => set({ bonuses: value}),
      setTotalReferrals: (value) => set({ totalReferrals: value}),
      setAppConfig: (value) => set({ appConfig: value}),
    }),
    { name: 'globalStore', enabled: process.env.NODE_ENV !== 'production' }
  )
);

export default useGlobalStore;