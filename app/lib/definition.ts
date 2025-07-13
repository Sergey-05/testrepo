// types/payment.ts
export interface PaymentMethod {
  id: string
  title: string
  minAmount?: string // только для банковских
  bgImageUrl: string
  network?: string
  icon?: React.FC<{ className?: string }>; // Тип для компонента иконки
availability: {
    deposit: boolean; // Доступен для депозита
    withdrawal: boolean; // Доступен для вывода
  };
}



export interface User {
  telegram_id: string;
  balance: number;
  deposit_amount: number;
  total_profit: number;
  partner_bonus_received: boolean;
  referred_by: string | null;
  created_at: Date;
  first_name: string | null;
  photo_url: string | null;
  username: string | null;
  last_deposit_at: Date | null; // Новое поле
}

export interface Transaction {
  id: string;
  telegram_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  created_at: Date;
  review_time: Date | null;
  status: 'canceled' | 'in_process' | 'approved';
}
export interface AppConfig {
  id: number;
  manager_link: string;
  referral_percent: number;
  useApiForCard: boolean;
}

export interface PartnerEarning {
  id: string;
  telegram_id: string;
  partner_telegram_id: string;
  amount: number;
  created_at: Date;
  transaction_id: string | null;
}

export interface DepositEarning {
  id: string;
  telegram_id: string;
  amount: number;
  created_at: Date;
  last_collected_at: Date | null;
}

export interface Cryptocurrency {
  code: string;
  name: string;
  icon_url: string | null;
  price_rub: number;
  price_change_percent: number;
}

export interface Tariff {
  id: string;
  amount_min: number;
  amount_limit: number | null;
  rate: number;
}

export interface Card {
  id: string;
  min_amount: number;
  max_amount: number;
  card_number: string;
  bank_name: string;
}

export interface CryptoWallet {
  currency_code: string;
  wallet_address: string;
}

export interface Reinvestment {
  id: string;
  telegram_id: string;
  amount: number;
  created_at: Date;
}

export interface Bonus {
  id: number;
  min_deposit: number;
  max_deposit?: number;
  percentage: number;
}

export interface UserDataTg {
  id: number;
  first_name?: string;
  photo_url?: string;
  username?: string;
}