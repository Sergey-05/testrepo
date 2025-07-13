import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { telegram_id, amount } = await request.json();

    const merchant_id = process.env.PAYOU_MERCHANT_ID;
    const secret = process.env.PAYOU_SECRET_KEY;
    const system = 'card_ru_rand_tg';
    const order_id = `${telegram_id}_${new Date().toISOString().replace(/[^0-9]/g, '')}`;
    const email = 'no@email.com';
    const comment = '';

    if (!merchant_id || !secret) {
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    // Формирование хэша
    const hash_input = `${merchant_id}:${amount}:${secret}:${system}:${order_id}`;
    const hash = crypto.createHash('md5').update(hash_input).digest('hex');

    // Кодирование параметров
    const encoded_comment = encodeURIComponent(comment);
    const encoded_email = encodeURIComponent(email);

    // Формирование URL
    const full_url = `https://payou.pro/api/new/api.php?id=${merchant_id}&sistems=${system}&summ=${amount}&order_id=${order_id}&Coment=${encoded_comment}&user_code=${telegram_id}&user_email=${encoded_email}&hash=${hash}`;

    // Отправка запроса
    const response = await fetch(full_url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Ошибка при получении реквизитов' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка API:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}