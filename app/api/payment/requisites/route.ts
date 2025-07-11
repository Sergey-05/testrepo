import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, amount } = await req.json();

    if (!telegramId || !amount) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
    }

    const merchantId = process.env.PAYOU_MERCHANT_ID;
    const secret = process.env.PAYOU_SECRET_KEY;
    const baseUrl = 'https://payou.pro/api/new/api.php';
    const system = 'card_ru_rand_card';

    if (!merchantId || !secret) {
      return NextResponse.json({ error: 'PAYOU конфигурация не задана' }, { status: 500 });
    }

    const formattedAmount = Number(amount).toFixed(2);
    const orderId = `${Date.now()}_${telegramId}`; // Генерация уникального ID
    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}:${formattedAmount}:${secret}:${system}:${orderId}`)
      .digest('hex');

    const url = new URL(baseUrl);
    url.searchParams.set('id', merchantId);
    url.searchParams.set('sistems', system);
    url.searchParams.set('summ', formattedAmount);
    url.searchParams.set('order_id', orderId);
    url.searchParams.set('Coment', 'Пополнение баланса');
    url.searchParams.set('user_code', telegramId.toString());
    url.searchParams.set('user_email', 'no@email.com');
    url.searchParams.set('hash', hash);
    url.searchParams.set('api', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (data.status !== 'success') {
      return NextResponse.json({ error: 'Payou вернул ошибку', details: data }, { status: 400 });
    }

    return NextResponse.json({ requisites: data.data });
  } catch (err) {
    console.error('[Payou H2H Error]', err);
    return NextResponse.json({ error: 'Ошибка на сервере' }, { status: 500 });
  }
}
