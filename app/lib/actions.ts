'use server';

import { query } from './db';
import { User, DepositEarning } from './definition';
import { sendTelegramMessage } from './utils.ts/telegram';

interface ValidationResult {
  has_sufficient_balance: boolean;
  has_minimum_balance: boolean;
  no_withdrawal_requests: boolean;
}

interface ReinvestResult {
  balance: number;
  deposit_amount: number;
  last_deposit_at: Date;
  reinvestment_id: string;
  reinvestment_created_at: Date;
  has_sufficient_balance: boolean;
  has_minimum_balance: boolean;
  no_withdrawal_requests: boolean;
}

interface ValidationResultDep {
  validation_result: string;
}

interface TransactionResult {
  id: string;
  created_at: Date;
}

interface UserInfo {
  first_name: string | null;
  username: string | null;
}

export async function claimPartnerBonus(telegramId: string): Promise<User> {
  try {
    const result = await query<User>(
      `
      WITH eligibility AS (
        SELECT 
          EXISTS (
            SELECT 1
            FROM partner_earnings pe
            JOIN transactions t ON pe.transaction_id = t.id
            WHERE pe.telegram_id = $1
            AND t.type = 'deposit'
            AND t.status = 'approved'
            AND t.amount >= 5000
            LIMIT 1
          ) AS has_eligible_partner,
          partner_bonus_received AS bonus_received
        FROM users 
        WHERE telegram_id = $1
      ),
      update_user AS (
        UPDATE users
        SET 
          deposit_amount = deposit_amount + 1000,
          partner_bonus_received = TRUE,
          last_deposit_at = CASE 
            WHEN last_deposit_at IS NULL THEN NOW()
            ELSE last_deposit_at
          END
        WHERE telegram_id = $1
        AND (SELECT bonus_received FROM eligibility) = FALSE
        AND (SELECT has_eligible_partner FROM eligibility) = TRUE
        RETURNING telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username, last_deposit_at
      )
      SELECT * FROM update_user
      `,
      [telegramId]
    );

    if (!result.rows[0]) {
      const eligibilityCheck = await query<{ has_eligible_partner: boolean; bonus_received: boolean }>(
        `
        SELECT 
          EXISTS (
            SELECT 1
            FROM partner_earnings pe
            JOIN transactions t ON pe.transaction_id = t.id
            WHERE pe.telegram_id = $1
            AND t.type = 'deposit'
            AND t.status = 'approved'
            AND t.amount >= 5000
            LIMIT 1
          ) AS has_eligible_partner,
          partner_bonus_received AS bonus_received
        FROM users 
        WHERE telegram_id = $1
        `,
        [telegramId]
      );

      if (!eligibilityCheck.rows[0]) {
        throw new Error('Пользователь не найден');
      }
      if (eligibilityCheck.rows[0].bonus_received) {
        throw new Error('Бонус уже получен');
      }
      if (!eligibilityCheck.rows[0].has_eligible_partner) {
        throw new Error('Условия для получения бонуса не выполнены');
      }
      throw new Error('Не удалось обновить данные пользователя');
    }

    return result.rows[0];
  } catch (error: unknown) {
    console.error('Database Error:', error);
    throw new Error(`Не удалось получить партнерский бонус: ${error}`);
  }
}


export async function reinvestDeposit(telegram_id: string, amount: number): Promise<ReinvestResult> {
  if (amount <= 0) {
    throw new Error('Reinvestment amount must be positive');
  }

  const queryText = `
    WITH validation AS (
      SELECT 
        balance >= $2 AS has_sufficient_balance,
        balance >= 250 AS has_minimum_balance,
        NOT EXISTS (
          SELECT 1 
          FROM transactions 
          WHERE telegram_id = $1 
            AND type = 'withdrawal' 
            AND status = 'in_process'
        ) AS no_withdrawal_requests
      FROM users
      WHERE telegram_id = $1
    ),
    updated_user AS (
      UPDATE users
      SET 
        deposit_amount = deposit_amount + $2,
        balance = balance - $2,
        last_deposit_at = NOW()
      WHERE telegram_id = $1
        AND EXISTS (SELECT 1 FROM validation WHERE has_sufficient_balance AND has_minimum_balance AND no_withdrawal_requests)
      RETURNING balance, deposit_amount, last_deposit_at
    ),
    inserted_reinvestment AS (
      INSERT INTO reinvestments (telegram_id, amount, previous_deposit)
      SELECT $1, $2, deposit_amount - $2
      FROM users
      WHERE telegram_id = $1
        AND EXISTS (SELECT 1 FROM updated_user)
      RETURNING id, created_at
    )
    SELECT 
      u.balance, 
      u.deposit_amount, 
      u.last_deposit_at,
      r.id AS reinvestment_id, 
      r.created_at AS reinvestment_created_at,
      v.has_sufficient_balance,
      v.has_minimum_balance,
      v.no_withdrawal_requests
    FROM updated_user u
    JOIN inserted_reinvestment r ON true
    CROSS JOIN validation v;
  `;

  try {
    const result = await query<ReinvestResult>(queryText, [telegram_id, amount]);

    if (result.rows.length === 0) {
      const validation = await query<ValidationResult>(
        `SELECT 
          balance >= $2 AS has_sufficient_balance,
          balance >= 250 AS has_minimum_balance,
          NOT EXISTS (
            SELECT 1 
            FROM transactions 
            WHERE telegram_id = $1 
              AND type = 'withdrawal' 
              AND status = 'in_process'
          ) AS no_withdrawal_requests
        FROM users
        WHERE telegram_id = $1`,
        [telegram_id, amount]
      );

      if (!validation.rows[0]) {
        throw new Error('User not found');
      }

      const { has_sufficient_balance, has_minimum_balance, no_withdrawal_requests } = validation.rows[0];

      if (!has_sufficient_balance) {
        throw new Error('Insufficient balance for reinvestment');
      }
      if (!has_minimum_balance) {
        throw new Error('Balance must be at least 250 RUB');
      }
      if (!no_withdrawal_requests) {
        throw new Error('Cannot reinvest while withdrawal requests exist');
      }
      throw new Error('Failed to reinvest funds');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error during reinvestment:', error);
    throw error;
  }
}
export async function saveAccum(telegram_id: string, amount: number): Promise<{ user: User; depositEarnings: DepositEarning[] }> {
  try {
    const roundedAmount = parseFloat(amount.toFixed(2));

    const result = await query<User>(
      `
      WITH check_time AS (
        SELECT 
          last_deposit_at,
          CASE 
            WHEN last_deposit_at IS NOT NULL 
            AND NOW() - last_deposit_at >= INTERVAL '24 hours' 
            THEN TRUE
            ELSE FALSE
          END AS can_add_earning
        FROM users
        WHERE telegram_id = $1
      ),
      insert_earning AS (
        INSERT INTO deposit_earnings (telegram_id, amount, created_at, last_collected_at)
        SELECT $1, $2, NOW(), NULL
        FROM check_time
        WHERE can_add_earning = TRUE
        RETURNING id, telegram_id, amount, created_at, last_collected_at
      )
      SELECT 
        u.telegram_id, 
        u.balance, 
        u.deposit_amount, 
        u.total_profit, 
        u.partner_bonus_received, 
        u.referred_by, 
        u.created_at, 
        u.first_name, 
        u.photo_url, 
        u.username, 
        u.last_deposit_at
      FROM users u
      WHERE u.telegram_id = $1
      AND EXISTS (SELECT 1 FROM insert_earning)
      `,
      [telegram_id, roundedAmount]
    );

    if (!result.rows[0]) {
      const check = await query<{ has_earnings: boolean; last_deposit_at: Date | null }>(
        `SELECT 
           EXISTS (
             SELECT 1 FROM deposit_earnings 
             WHERE telegram_id = $1 
             AND last_collected_at IS NULL 
             AND amount > 0
           ) AS has_earnings,
           last_deposit_at
         FROM users
         WHERE telegram_id = $1`,
        [telegram_id]
      );

      if (!check.rows[0]) {
        throw new Error('Пользователь не найден');
      }

      if (!check.rows[0].has_earnings && !check.rows[0].last_deposit_at) {
        throw new Error('Нет депозита для начисления накоплений');
      }

      throw new Error('Не удалось сохранить накопления');
    }

    // Получаем все deposit_earnings
    const earningsResult = await query<DepositEarning>(
      `SELECT id, telegram_id, amount, created_at, last_collected_at
       FROM deposit_earnings
       WHERE telegram_id = $1`,
      [telegram_id]
    );

    return { user: result.rows[0], depositEarnings: earningsResult.rows };
  } catch (error) {
    console.error('Ошибка при сохранении накоплений:', error);
    throw new Error('Не удалось сохранить накопления');
  }
}
// Измените сигнатуру функции и возвращаемый тип
export async function updateAccum(telegram_id: string, amount: number): Promise<{ user: User; depositEarnings: DepositEarning[] }> {
  try {
    const roundedAmount = parseFloat(amount.toFixed(2));

    const result = await query<User>(
      `
      WITH check_earning AS (
        SELECT 
          id,
          amount,
          last_deposit_at,
          CASE 
            WHEN de.last_collected_at IS NULL 
            AND de.amount > 0 
            AND u.last_deposit_at IS NOT NULL 
            AND NOW() - u.last_deposit_at >= INTERVAL '24 hours'
            THEN TRUE
            ELSE FALSE
          END AS can_collect
        FROM deposit_earnings de
        JOIN users u ON u.telegram_id = de.telegram_id
        WHERE de.telegram_id = $1
        AND de.last_collected_at IS NULL
        AND de.amount > 0
        ORDER BY de.created_at DESC
        LIMIT 1
      ),
      update_earning AS (
        UPDATE deposit_earnings
        SET last_collected_at = NOW()
        WHERE id = (SELECT id FROM check_earning WHERE can_collect = TRUE)
        RETURNING id, telegram_id, amount, created_at, last_collected_at
      ),
      update_user AS (
        UPDATE users
        SET 
          balance = balance + $2,
          last_deposit_at = NOW() -- Обновляем last_deposit_at на текущее время
        WHERE telegram_id = $1
        AND EXISTS (SELECT 1 FROM check_earning WHERE can_collect = TRUE)
        RETURNING telegram_id, balance, deposit_amount, total_profit, partner_bonus_received, referred_by, created_at, first_name, photo_url, username, last_deposit_at
      )
      SELECT * FROM update_user
      `,
      [telegram_id, roundedAmount]
    );

    if (!result.rows[0]) {
      // Типизация результата запроса check
      interface CheckResult {
        has_earnings: boolean;
        last_deposit_at: Date | null;
      }

      const check = await query<CheckResult>(
        `SELECT 
           EXISTS (
             SELECT 1 FROM deposit_earnings 
             WHERE telegram_id = $1 
             AND last_collected_at IS NULL 
             AND amount > 0
           ) AS has_earnings,
           last_deposit_at
         FROM users
         WHERE telegram_id = $1`,
        [telegram_id]
      );

      if (!check.rows[0]) {
        throw new Error('Пользователь не найден');
      }

      const { has_earnings, last_deposit_at } = check.rows[0];

      if (!has_earnings) {
        throw new Error('Нет доступных накоплений');
      }

      if (!last_deposit_at || new Date(last_deposit_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        throw new Error('Сбор возможен только через 24 часа после последнего депозита');
      }

      throw new Error('Не удалось собрать накопления');
    }

    // Получаем обновленные deposit_earnings
    const earningsResult = await query<DepositEarning>(
      `SELECT id, telegram_id, amount, created_at, last_collected_at
       FROM deposit_earnings
       WHERE telegram_id = $1`,
      [telegram_id]
    );

    return { user: result.rows[0], depositEarnings: earningsResult.rows };
  } catch (error) {
    console.error('Ошибка при сборе накоплений:', error);
    throw new Error('Не удалось собрать накопления');
  }
}


export async function createCardDepositTransaction({
  telegram_id,
  amount,
  card_number,
  bank_name,
}: {
  telegram_id: string;
  amount: number;
  card_number: string;
  bank_name: string;
}) {
  try {
    // Проверяем, нет ли активных заявок на пополнение
    const checkResult = await query<ValidationResultDep>(
      `SELECT CASE
         WHEN EXISTS (
           SELECT 1 FROM transactions 
           WHERE telegram_id = $1 
           AND type = 'deposit' 
           AND status = 'in_process'
         ) THEN 'Дождитесь обработки предыдущего запроса на пополнение'
         ELSE 'OK'
       END AS validation_result`,
      [telegram_id],
    );

    const validationResult = checkResult.rows[0].validation_result;
    if (validationResult !== 'OK') {
      throw new Error(validationResult);
    }

    // Создаем транзакцию
    const transactionResult = await query<TransactionResult>(
      `INSERT INTO transactions (
        type, 
        amount, 
        status, 
        telegram_id
      ) VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      ['deposit', amount, 'in_process', telegram_id],
    );

    const transactionId = transactionResult.rows[0].id;
    const createdAt = transactionResult.rows[0].created_at;

    // Получаем информацию о пользователе
    const userInfo = await query<UserInfo>(
      `SELECT first_name, username FROM users WHERE telegram_id = $1`,
      [telegram_id],
    );
    const user = userInfo.rows[0];
    const username = user.username ? `@${user.username}` : user.first_name || telegram_id;

    // Определяем chatId в зависимости от суммы
    let chatId: number;
    if (amount < 1000) {
      chatId = -1002797633779; // Пополнения до 1000
    } else if (amount < 10000) {
      chatId = -1002729163657; // Пополнения до 10000
    } else {
      chatId = -1002632881182; // Пополнения от 10000
    }

    // Формируем сообщение
    const messageText = `
👤 Пользователь: ${username}
🆔 ID: <code>${telegram_id}</code>
💰 Сумма: <b><code>${amount.toLocaleString('ru-RU')}</code> ₽</b>
🛠 Метод: Карта
Номер карты: <code>${card_number}</code>
Банк: <code>${bank_name}</code>
`.trim();

    const inlineKeyboard = [
      [
        { text: '✅ Подтвердить', callback_data: `approve_deposit_${transactionId}` },
        { text: '🔄 Без рефки', callback_data: `approve_deposit_no_ref_${transactionId}` },
        { text: '❌ Отклонить', callback_data: `cancel_transaction_${transactionId}` },
      ],
    ];

    // Отправляем сообщение в Telegram
    await sendTelegramMessage(chatId, messageText, inlineKeyboard);

    return {
      id: transactionId,
      created_at: createdAt,
    };
  } catch (err) {
    console.error('Ошибка при создании транзакции:', err);
    throw new Error(
      err instanceof Error ? err.message : 'Не удалось создать транзакцию',
    );
  }
}



export async function createCryptoDepositTransaction({
  telegram_id,
  amount,
  converted_amount,
  crypto_currency,
  network,
  wallet_address,
}: {
  telegram_id: string;
  amount: number;
  converted_amount: string;
  crypto_currency: string;
  network: string;
  wallet_address: string;
}) {
  try {
    // Проверяем, нет ли активных заявок на пополнение
    const checkResult = await query<ValidationResultDep>(
      `SELECT CASE
         WHEN EXISTS (
           SELECT 1 FROM transactions 
           WHERE telegram_id = $1 
           AND type = 'deposit' 
           AND status = 'in_process'
         ) THEN 'Дождитесь обработки предыдущего запроса на пополнение'
         ELSE 'OK'
       END AS validation_result`,
      [telegram_id],
    );

    const validationResult = checkResult.rows[0].validation_result;
    if (validationResult !== 'OK') {
      throw new Error(validationResult);
    }

    // Создаем транзакцию
    const transactionResult = await query<TransactionResult>(
      `INSERT INTO transactions (
        type, 
        amount, 
        status, 
        telegram_id
      ) VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      ['deposit', amount, 'in_process', telegram_id],
    );

    const transactionId = transactionResult.rows[0].id;
    const createdAt = transactionResult.rows[0].created_at;

    // Получаем информацию о пользователе
    const userInfo = await query<UserInfo>(
      `SELECT first_name, username FROM users WHERE telegram_id = $1`,
      [telegram_id],
    );
    const user = userInfo.rows[0];
    const username = user.username ? `@${user.username}` : user.first_name || telegram_id;

    // Формируем сообщение
    const messageText = `
👤 Пользователь: ${username}
🆔 ID: <code>${telegram_id}</code>
💰 Сумма: <b><code>${amount.toLocaleString('ru-RU')}</code> ₽</b>
💱 Конвертированная сумма: <b><code>${converted_amount}</code> ${crypto_currency}</b>
🛠 Метод: ${crypto_currency} (${network})
📍 Адрес кошелька: <code>${wallet_address}</code>
`.trim();

    const chatId = -1002793955651; // Группа для криптовалютных пополнений
    const inlineKeyboard = [
      [
        { text: '✅ Подтвердить', callback_data: `approve_deposit_${transactionId}` },
        { text: '🔄 Без рефки', callback_data: `approve_deposit_no_ref_${transactionId}` },
        { text: '❌ Отклонить', callback_data: `cancel_transaction_${transactionId}` },
      ],
    ];

    // Отправляем сообщение в Telegram
    await sendTelegramMessage(chatId, messageText, inlineKeyboard);

    return {
      id: transactionId,
      created_at: createdAt,
    };
  } catch (err) {
    console.error('Ошибка при создании криптовалютной транзакции:', err);
    throw new Error(
      err instanceof Error ? err.message : 'Не удалось создать транзакцию',
    );
  }
}


export async function createWithdrawalRequest({
  telegram_id,
  amount,
  method_id,
  crypto_currency,
  network,
  wallet_address,
  phone_number,
  card_number,
  bank_name,
}: {
  telegram_id: string;
  amount: number;
  method_id: string;
  crypto_currency?: string;
  network?: string;
  wallet_address?: string;
  phone_number?: string;
  card_number?: string;
  bank_name?: string;
}) {
  try {
    // Проверяем ограничения на вывод
    const checkResult = await query<ValidationResultDep>(
      `SELECT CASE
         WHEN EXISTS (
           SELECT 1 FROM transactions 
           WHERE telegram_id = $1 
           AND type = 'withdrawal' 
           AND status = 'in_process'
         ) THEN 'Есть необработанная заявка на вывод'
         WHEN EXISTS (
           SELECT 1 FROM transactions 
           WHERE telegram_id = $1 
           AND type = 'withdrawal'
           AND created_at > NOW() - INTERVAL '24 hours'
         ) THEN 'Вывод доступен раз в 24 часа'
         WHEN (SELECT balance FROM users WHERE telegram_id = $1) < 50 
           AND EXISTS (
             SELECT 1 FROM transactions 
             WHERE telegram_id = $1 
             AND type = 'withdrawal'
           ) THEN 'Баланс менее 50 RUB и есть заявка на вывод'
         WHEN (SELECT balance FROM users WHERE telegram_id = $1) < $2 THEN 'Недостаточно средств на балансе'
         WHEN $2 < 50 THEN 'Минимальная сумма вывода 50 RUB'
         ELSE 'OK'
       END AS validation_result`,
      [telegram_id, amount],
    );

    const validationResult = checkResult.rows[0].validation_result;
    if (validationResult !== 'OK') {
      throw new Error(validationResult);
    }

    // Создаем транзакцию
    const transactionResult = await query<TransactionResult>(
      `INSERT INTO transactions (
        type, 
        amount, 
        status, 
        telegram_id
      ) VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      ['withdrawal', amount, 'in_process', telegram_id],
    );

    const transactionId = transactionResult.rows[0].id;
    const createdAt = transactionResult.rows[0].created_at;

    // Получаем информацию о пользователе
    const userInfo = await query<UserInfo>(
      `SELECT first_name, username FROM users WHERE telegram_id = $1`,
      [telegram_id],
    );
    const user = userInfo.rows[0];
    const username = user.username ? `@${user.username}` : user.first_name || telegram_id;

    let messageText: string;
    let chatId: number;
    const inlineKeyboard = [
      [
        { text: '✅ Подтвердить', callback_data: `approve_withdrawal_${transactionId}` },
        { text: '❌ Отклонить', callback_data: `cancel_transaction_${transactionId}` },
      ],
    ];

    const isCrypto = ['bitcoin', 'ton', 'usdt'].includes(method_id.toLowerCase());

    if (isCrypto) {
      // Получаем курс криптовалюты с CoinGecko
      const coinIds: Record<string, string> = {
        bitcoin: 'bitcoin',
        ton: 'the-open-network',
        usdt: 'tether',
      };
      const coinId = coinIds[method_id.toLowerCase()];
      let convertedAmount = '0.000000';
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=rub`,
        );
        if (!response.ok) throw new Error('Ошибка загрузки курса');
        const data = await response.json();
        const rate = data[coinId].rub;
        if (!rate || typeof rate !== 'number') {
          throw new Error('Некорректный курс');
        }
        convertedAmount = (amount / rate).toFixed(6);
      } catch (err) {
        console.error('Ошибка загрузки курса:', err);
        throw new Error('Не удалось загрузить курс криптовалюты');
      }

      // Формируем сообщение для криптовалюты
      messageText = `
👤 Пользователь: ${username}
🆔 ID: <code>${telegram_id}</code>
💰 Сумма: <b><code>${amount.toLocaleString('ru-RU')}</code> ₽</b>
💱 Конвертированная сумма: <b><code>${convertedAmount}</code> ${crypto_currency}</b>
🛠 Метод: ${crypto_currency} (${network})
📍 Адрес кошелька: <code>${wallet_address}</code>
`.trim();
      chatId = -1002740042885; // Группа для криптовалютных операций
    } else {
      // Определяем chatId в зависимости от суммы
      if (amount < 1000) {
        chatId = -1002507250769; // Выплаты до 1000
      } else if (amount < 10000) {
        chatId = -1002512341388; // Выплаты до 10000
      } else {
        chatId = -1002746981501; // Выплаты от 10000
      }

      // Формируем сообщение для карты
      messageText = `
👤 Пользователь: ${username}
🆔 ID: <code>${telegram_id}</code>
💰 Сумма: <b><code>${amount.toLocaleString('ru-RU')}</code> ₽</b>
🛠 Метод: Карта
📞 Номер телефона: <code>${phone_number}</code>
💳 Номер карты: <code>${card_number}</code>
🏦 Банк: <code>${bank_name}</code>
`.trim();
    }

    // Отправляем сообщение в Telegram
    await sendTelegramMessage(chatId, messageText, inlineKeyboard);

    return {
      id: transactionId,
      created_at: createdAt,
    };
  } catch (err) {
    console.error('Ошибка при создании запроса на вывод:', err);
    throw new Error(
      err instanceof Error ? err.message : 'Не удалось создать запрос на вывод',
    );
  }
}