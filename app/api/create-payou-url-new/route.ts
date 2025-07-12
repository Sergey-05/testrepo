
import { NextRequest, NextResponse } from 'next/server';
import { createDepositTransaction } from '@/app/lib/actions';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, amount } = await req.json();

    if (!telegramId || !amount) {
      return NextResponse.json({ error: 'Данные не переданы' }, { status: 400 });
    }

    const transaction = await createDepositTransaction(telegramId, amount);

    const merchantId = process.env.PAYOU_MERCHANT_ID;
    const secret = process.env.PAYOU_SECRET_KEY;
    const baseUrl = process.env.PAYOU_BASE_URL;

    if (!merchantId || !secret || !baseUrl) {
      return NextResponse.json({ error: 'PAYOU переменные среды не заданы' }, { status: 500 });
    }

    const system = 'MoneyRUB_Cra_qr';
    const formattedAmount = Number(amount).toFixed(2);
    const orderId = transaction.id.toString();

    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}:${formattedAmount}:${secret}:${system}:${orderId}`)
      .digest('hex');

    const url = new URL(baseUrl);
    url.searchParams.set('id', merchantId);
    url.searchParams.set('sistems', system);
    url.searchParams.set('summ', formattedAmount);
    url.searchParams.set('order_id', orderId);
    url.searchParams.set('hash', hash);
    url.searchParams.set('user_code', telegramId.toString());
    url.searchParams.set('user_email', 'no@email.com');

    return NextResponse.json({ url: url.toString() });
  } catch (err) {
    console.error('[Create Payou URL]', err);
    return NextResponse.json({ error: 'Ошибка создания ссылки' }, { status: 500 });
  }
}
