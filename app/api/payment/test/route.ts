// /app/api/payment/test/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    // Тестовые данные — можно заменить на любые другие
    const merchantId = '582';
    const secret = 'e9ed3b532d2bd8112a22a3b2cc077556';
    const system = 'card_ru_rand_card';
    const orderId = 'test_order_001';
    const amount = '100.00';
    const telegramId = '5707577690';
    const email = 'no@email.com';
    const comment = 'Test from remote server';

    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}:${amount}:${secret}:${system}:${orderId}`)
      .digest('hex');

    const url = new URL('https://payou.pro/api/new');
    url.searchParams.set('id', merchantId);
    url.searchParams.set('sistems', system);
    url.searchParams.set('summ', amount);
    url.searchParams.set('order_id', orderId);
    url.searchParams.set('Coment', comment);
    url.searchParams.set('user_code', telegramId);
    url.searchParams.set('user_email', email);
    url.searchParams.set('hash', hash);
    url.searchParams.set('api', '1');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.text(); // иногда приходит кривой json
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { raw: data, error: 'Некорректный JSON от Payou' },
        { status: 502 }
      );
    }

    return NextResponse.json({ requisites: parsed });
  } catch (err) {
    console.error('[Payou Test API Error]', err);
    return NextResponse.json({ error: 'Ошибка на сервере' }, { status: 500 });
  }
}
