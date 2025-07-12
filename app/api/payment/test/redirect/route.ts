import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    // Получение id из query-параметров
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'test_order_001';

    // Данные из переменных окружения и параметров
    const merchantId = process.env.PAYOU_MERCHANT_ID || '582';
    const secret = process.env.PAYOU_SECRET || 'e9ed3b532d2bd8112a22a3b2cc077556';
    const system = 'MoneyRUB_Cra_qr';
    const amount = '100.00';
    const telegramId = '5707577690';
    const email = 'no@email.com';
    const comment = 'Test from remote server';

    // Формирование подписи
    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}:${amount}:${secret}:${system}:${id}`)
      .digest('hex');

    // Формирование URL
    const url = new URL('https://payou.pro/api/new/api.php');
    url.searchParams.set('id', merchantId);
    url.searchParams.set('sistems', system);
    url.searchParams.set('summ', amount);
    url.searchParams.set('order_id', id);
    url.searchParams.set('Coment', comment);
    url.searchParams.set('user_code', telegramId);
    url.searchParams.set('user_email', email);
    url.searchParams.set('hash', hash);

    // Редирект на URL Payou
    return NextResponse.redirect(url.toString());
  } catch (err) {
    console.error('[Payou Redirect API Error]', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}