'use server';

import { query } from './db';
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
} from './definition';

// Заглушка для кэширования (готово к интеграции с Redis)
async function getCachedOrQuery<T extends object>(
  key: string,
  queryString: string,
  params: unknown[] = []
): Promise<T[]> {
  // TODO: Интеграция с Redis
  const result = await query<T>(queryString, params);
  return result.rows;
}

// interface InitialData {
//   user: User | null;
//   transactions: Transaction[];
//   partnerEarnings: PartnerEarning[];
//   depositEarnings: DepositEarning[] | null;
//   cryptocurrencies: Cryptocurrency[];
//   tariffs: Tariff[];
//   cards: Card[];
//   cryptoWallets: CryptoWallet[];
//   reinvestments: Reinvestment[];
//   recentTransactions: Transaction[];
//   totalUsers: number;
//   hasPartnerWithMinDeposit: boolean;
//   bonuses: Bonus[];
//   totalReferrals: number;
//   appConfig: AppConfig[];
// }

// export async function fetchInitialData(telegramId: bigint): Promise<InitialData> {
//   try {
//     // Начало транзакции
//     await query('BEGIN', []);

//     const [
//       user,
//       transactions,
//       partnerEarnings,
//       depositEarnings,
//       cryptocurrencies,
//       tariffs,
//       cards,
//       cryptoWallets,
//       reinvestments,
//       recentTransactions,
//       totalUsers,
//       hasPartnerWithMinDeposit,
//       bonuses,
//       totalReferrals,
//       appConfig,
//     ] = await Promise.all([
//       query<User>(
//         `SELECT telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username, last_deposit_at
//          FROM users WHERE telegram_id = $1 LIMIT 1`,
//         [telegramId.toString()]
//       ).then((r) => r.rows[0] || null),

//       query<Transaction>(
//         `SELECT id, telegram_id, type, amount, created_at, review_time, status
//          FROM transactions WHERE telegram_id = $1
//          ORDER BY created_at DESC`,
//         [telegramId.toString()]
//       ).then((r) => r.rows),

//       query<PartnerEarning>(
//         `SELECT id, telegram_id, partner_telegram_id, amount, created_at, transaction_id
//          FROM partner_earnings WHERE telegram_id = $1
//          ORDER BY created_at DESC LIMIT 10`,
//         [telegramId.toString()]
//       ).then((r) => r.rows),

//       query<DepositEarning>(
//         `SELECT id, telegram_id, amount, created_at, last_collected_at
//          FROM deposit_earnings WHERE telegram_id = $1
//          ORDER BY created_at DESC`,
//         [telegramId.toString()]
//       ).then((r) => r.rows || null),

//       getCachedOrQuery<Cryptocurrency>(
//         'cryptocurrencies',
//         `SELECT code, name, icon_url, price_rub, price_change_percent
//          FROM cryptocurrencies
//          ORDER BY code`
//       ),

//       getCachedOrQuery<Tariff>(
//         'tariffs',
//         `SELECT id, amount_min, amount_limit, rate
//          FROM tariffs`
//       ),

//       getCachedOrQuery<Card>(
//         'cards',
//         `SELECT id, min_amount, max_amount, card_number, bank_name
//          FROM cards`
//       ),

//       getCachedOrQuery<CryptoWallet>(
//         'crypto_wallets',
//         `SELECT currency_code, wallet_address
//          FROM crypto_wallets`
//       ),

//       query<Reinvestment>(
//         `SELECT id, telegram_id, amount, created_at
//          FROM reinvestments WHERE telegram_id = $1
//          ORDER BY created_at DESC`,
//         [telegramId.toString()]
//       ).then((r) => r.rows),

//       query<Transaction>(
//         `SELECT id, telegram_id, type, amount, review_time
//          FROM transactions WHERE status = 'approved'
//          ORDER BY review_time DESC LIMIT 5`
//       ).then((r) => r.rows),

//       query<{ count: string }>(
//         `SELECT COUNT(*) AS count FROM users`
//       ).then((r) => parseInt(r.rows[0].count, 10)),

//       query<{ exists: boolean }>(
//         `SELECT EXISTS (
//            SELECT 1
//            FROM partner_earnings pe
//            JOIN transactions t ON pe.transaction_id = t.id
//            WHERE pe.telegram_id = $1
//            AND t.type = 'deposit'
//            AND t.status = 'approved'
//            AND t.amount >= 5000
//            LIMIT 1
//          ) AS exists`,
//         [telegramId.toString()]
//       ).then((r) => r.rows[0].exists),
//       getCachedOrQuery<Bonus>(
//   'bonuses',
//   `SELECT id, min_deposit, max_deposit, percentage
//    FROM bonuses`
// ),
// query<{ count: string }>(
//   `SELECT COUNT(*) AS count FROM users WHERE referred_by = $1`,
//   [telegramId.toString()]
// ).then((r) => parseInt(r.rows[0].count, 10)),
// getCachedOrQuery<AppConfig>(
//         'app_config',
//         `SELECT id, manager_link, referral_percent
//          FROM app_config`
//       ),
//     ]);

//     // Завершение транзакции
//     await query('COMMIT', []);

//     return {
//       user,
//       transactions,
//       partnerEarnings,
//       depositEarnings,
//       cryptocurrencies,
//       tariffs,
//       cards,
//       cryptoWallets,
//       reinvestments,
//       recentTransactions,
//       totalUsers,
//       hasPartnerWithMinDeposit,
//       bonuses,
//       totalReferrals,
//       appConfig,
//     };
//   } catch (error: unknown) {
//     // Откат транзакции при ошибке
//     await query('ROLLBACK', []);
//     console.error('Error fetching initial data:', error);
//     throw new Error(`Failed to fetch initial data: ${error}`);
//   }
// }


interface InitialData {
  user: User | null;
  transactions: Transaction[];
  partnerEarnings: PartnerEarning[];
  depositEarnings: DepositEarning[] | null;
  reinvestments: Reinvestment[];
  recentTransactions: Transaction[];
  totalUsers: number;
  hasPartnerWithMinDeposit: boolean;
  totalReferrals: number;
  appConfig: AppConfig[];
}

export async function fetchInitialData(telegramId: bigint): Promise<InitialData> {

  try {
    const result = await query<{
      telegram_id: string;
      balance: number;
      deposit_amount: number;
      total_profit: number;
      partner_bonus_received: boolean;
      referred_by: string | null;
      created_at: Date;
      first_name: string;
      photo_url: string;
      username: string;
      last_deposit_at: Date | null;
      transactions: Transaction[];
      partner_earnings: PartnerEarning[];
      deposit_earnings: DepositEarning[] | null;
      reinvestments: Reinvestment[];
      recent_transactions: Transaction[];
      total_users: string;
      has_partner_with_min_deposit: boolean;
      total_referrals: string;
      app_config: AppConfig[];
    }>(
      `SELECT 
        u.telegram_id, u.balance, u.deposit_amount, u.total_profit, 
        u.partner_bonus_received, u.referred_by, u.created_at, 
        u.first_name, u.photo_url, u.username, u.last_deposit_at,
        (SELECT json_agg(t) FROM (
          SELECT id, telegram_id, type, amount, created_at, review_time, status
          FROM transactions WHERE telegram_id = $1
        ) t) AS transactions,
        (SELECT json_agg(pe) FROM (
          SELECT id, telegram_id, partner_telegram_id, amount, created_at, transaction_id
          FROM partner_earnings WHERE telegram_id = $1
        ) pe) AS partner_earnings,
        (SELECT json_agg(de) FROM (
          SELECT id, telegram_id, amount, created_at, last_collected_at
          FROM deposit_earnings WHERE telegram_id = $1
        ) de) AS deposit_earnings,
        (SELECT json_agg(r) FROM (
          SELECT id, telegram_id, amount, created_at
          FROM reinvestments WHERE telegram_id = $1
        ) r) AS reinvestments,
        (SELECT json_agg(rt) FROM (
          SELECT id, telegram_id, type, amount, review_time
          FROM transactions 
          WHERE status = 'approved'
          ORDER BY review_time DESC 
          LIMIT 5
        ) rt) AS recent_transactions,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT EXISTS (
          SELECT 1 FROM partner_earnings pe
          JOIN transactions t ON pe.transaction_id = t.id
          WHERE pe.telegram_id = $1
          AND t.type = 'deposit'
          AND t.status = 'approved'
          AND t.amount >= 5000
        )) AS has_partner_with_min_deposit,
        (SELECT COUNT(*) FROM users WHERE referred_by = $1) AS total_referrals,
        (SELECT json_agg(ac) FROM (
          SELECT id, manager_link, referral_percent, useapiforcard FROM app_config
        ) ac) AS app_config
       FROM users u
       WHERE u.telegram_id = $1`,
      [telegramId.toString()]
    );

    const row = result.rows[0];

    if (!row) return {
      user: null,
      transactions: [],
      partnerEarnings: [],
      depositEarnings: null,
      reinvestments: [],
      recentTransactions: [],
      totalUsers: 0,
      hasPartnerWithMinDeposit: false,
      totalReferrals: 0,
      appConfig: [],
    };

    const payload: InitialData = {
      user: {
        telegram_id: row.telegram_id,
        balance: row.balance,
        deposit_amount: row.deposit_amount,
        total_profit: row.total_profit,
        partner_bonus_received: row.partner_bonus_received,
        referred_by: row.referred_by,
        created_at: row.created_at,
        first_name: row.first_name,
        photo_url: row.photo_url,
        username: row.username,
        last_deposit_at: row.last_deposit_at,
      },
      transactions: row.transactions || [],
      partnerEarnings: row.partner_earnings || [],
      depositEarnings: row.deposit_earnings || null,
      reinvestments: row.reinvestments || [],
      recentTransactions: row.recent_transactions || [],
      totalUsers: parseInt(row.total_users, 10),
      hasPartnerWithMinDeposit: row.has_partner_with_min_deposit,
      totalReferrals: parseInt(row.total_referrals, 10),
      appConfig: row.app_config || [],
    };

    return payload;
  } catch (error) {
    console.error('Ошибка при выполнении fetchInitialData:', error);
    throw new Error('Failed to fetch initial data');
  }
}


interface PaymentData {
  cards: Card[];
  cryptoWallets: CryptoWallet[];
  bonuses: Bonus[];
}

export async function fetchPaymentData(): Promise<PaymentData> {
  console.log('fetch payment');
  try {
    const result = await getCachedOrQuery<{
      cards: Card[];
      crypto_wallets: CryptoWallet[];
      bonuses: Bonus[];
    }>(
      'payment_data',
      `SELECT 
         (SELECT json_agg(c) FROM (
           SELECT id, min_amount, max_amount, card_number, bank_name
           FROM cards
         ) c) AS cards,
         (SELECT json_agg(cw) FROM (
           SELECT currency_code, wallet_address
           FROM crypto_wallets
         ) cw) AS crypto_wallets,
         (SELECT json_agg(b) FROM (
           SELECT id, min_deposit, max_deposit, percentage
           FROM bonuses
         ) b) AS bonuses`
    );

    return {
      cards: result[0]?.cards || [],
      cryptoWallets: result[0]?.crypto_wallets || [],
      bonuses: result[0]?.bonuses || [],
    };
  } catch (error: unknown) {
    console.error('Error fetching payment data:', error);
    throw new Error(`Failed to fetch payment data: ${error}`);
  }
}

export async function getUserByTelegramId(telegramId: bigint): Promise<User | null> {
  try {
    const result = await query<User>(
      `SELECT telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username, last_deposit_at
       FROM users WHERE telegram_id = $1 LIMIT 1`,
      [telegramId.toString()]
    );
    return result.rows[0] || null;
  } catch (error: unknown) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch user: ${error}`);
  }
}

export async function getTransactionsByTelegramId(telegramId: bigint): Promise<Transaction[]> {
  try {
    const result = await query<Transaction>(
      `SELECT id, telegram_id, type, amount, created_at, review_time, status
       FROM transactions WHERE telegram_id = $1
       ORDER BY created_at DESC`,
      [telegramId.toString()]
    );
    return result.rows;
  } catch (error: unknown) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch transactions: ${error}`);
  }
}

export async function getPartnerEarningsByTelegramId(telegramId: bigint): Promise<PartnerEarning[]> {
  try {
    const result = await query<PartnerEarning>(
      `SELECT id, telegram_id, partner_telegram_id, amount, created_at, transaction_id
       FROM partner_earnings WHERE telegram_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [telegramId.toString()]
    );
    return result.rows;
  } catch (error: unknown) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch partner earnings: ${error}`);
  }
}

export async function getDepositEarningsByTelegramId(telegramId: bigint): Promise<DepositEarning | null> {
  try {
    const result = await query<DepositEarning>(
      `SELECT id, telegram_id, amount, created_at, last_collected_at
       FROM deposit_earnings WHERE telegram_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [telegramId.toString()]
    );
    return result.rows[0] || null;
  } catch (error: unknown) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch deposit earnings: ${error}`);
  }
}

export async function getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
  try {
    return await getCachedOrQuery<Cryptocurrency>(
      'cryptocurrencies',
      `SELECT code, name, icon_url, price_rub, price_change_percent
       FROM cryptocurrencies
       ORDER BY code`
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch cryptocurrencies: ${error}`);
  }
}

export async function getAllTariffs(): Promise<Tariff[]> {
  try {
    return await getCachedOrQuery<Tariff>(
      'tariffs',
      `SELECT id, min_deposit, max_deposit, daily_rate
       FROM tariffs`
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch tariffs: ${error}`);
  }
}

export async function getAllCards(): Promise<Card[]> {
  try {
    return await getCachedOrQuery<Card>(
      'cards',
      `SELECT id, min_amount, max_amount, card_number, bank_name
       FROM cards`
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch cards: ${error}`);
  }
}

export async function getAllCryptoWallets(): Promise<CryptoWallet[]> {
  try {
    return await getCachedOrQuery<CryptoWallet>(
      'crypto_wallets',
      `SELECT currency_code, wallet_address
       FROM crypto_wallets`
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch crypto wallets: ${error}`);
  }
}

export async function getReinvestmentsByTelegramId(telegramId: bigint): Promise<Reinvestment[]> {
  try {
    const result = await query<Reinvestment>(
      `SELECT id, telegram_id, amount, created_at
       FROM reinvestments WHERE telegram_id = $1
       ORDER BY created_at DESC`,
      [telegramId.toString()]
    );
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch reinvestments: ${error}`);
  }
}

export async function getRecentApprovedTransactions(): Promise<Transaction[]> {
  try {
    const result = await query<Transaction>(
      `SELECT id, telegram_id, type, amount, review_time
       FROM transactions WHERE status = 'approved'
       ORDER BY review_time DESC LIMIT 5`
    );
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch recent approved transactions: ${error}`);
  }
}

export async function getTotalUsersCount(): Promise<number> {
  try {
    const result = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM users`);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch total users count: ${error}`);
  }
}

export async function createUser(
  telegramId: bigint,
  firstName: string | undefined,
  photoUrl: string | undefined,
  username: string | undefined
): Promise<User> {
  try {
    const result = await query<User>(
      `INSERT INTO users (telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, first_name, photo_url, username)
       VALUES ($1, 0, 0, 0, FALSE, $2, $3, $4)
       RETURNING telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username`,
      [telegramId.toString(), firstName || null, photoUrl || null, username || null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create user: ${error}`);
  }
}

export async function updateUserTgData(
  telegramId: string,
  firstName: string | undefined,
  photoUrl: string | undefined,
  username: string | undefined
): Promise<User> {
  try {
    const result = await query<User>(
      `UPDATE users
       SET first_name = $2, photo_url = $3, username = $4
       WHERE telegram_id = $1
       RETURNING telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username, last_deposit_at`,
      [telegramId, firstName || null, photoUrl || null, username || null]
    );
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    return result.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to update user: ${error}`);
  }
}