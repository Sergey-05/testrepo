import { TRXIcon, TonIcon, BitcoinIcon } from '../images';

export type Tariff = {
  id: string;
  name: string;
  description: string;
  rate: number;
  icon: React.FC<{ className?: string }>;
  amountLimit?: number;
  amountMin?: number; // Optional minimum amount for the tariff
};

export const tariffs: Tariff[] = [
  {
    id: 'trx',
    name: 'TRX',
    description: 'Для новых пользователей',
    rate: 3.3,
    icon: TRXIcon,
    amountLimit: 10000,
    amountMin: 250,
  },
  {
    id: 'ton',
    name: 'TON',
    description: 'Рекомендован',
    rate: 3.8,
    icon: TonIcon,
    amountLimit: 100000,
    amountMin: 10000,
  },
  {
    id: 'btc',
    name: 'BITCOIN',
    description: 'Приватный',
    rate: 4.4,
    icon: BitcoinIcon,
    amountMin: 100000,
  },
];
