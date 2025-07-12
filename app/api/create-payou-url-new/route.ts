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

    const merchantId = process.env.PAYOU_MERCHANT_ID!;
    const secret = process.env.PAYOU_SECRET_KEY!;
    const system = 'MoneyRUB_Cra_qr';

    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}:${amount}:${secret}:${system}:${transaction.id}`)
      .digest('hex');

    const url = new URL(process.env.PAYOU_BASE_URL!);
    url.searchParams.set('id', merchantId);
    url.searchParams.set('sistems', system);
    url.searchParams.set('summ', amount.toFixed(2));
    url.searchParams.set('order_id', transaction.id.toString());
    url.searchParams.set('hash', hash);
    url.searchParams.set('user_code', telegramId.toString());

    return NextResponse.json({ url: url.toString() });
  } catch (err) {
    console.error('[Create Payou URL]', err);
    return NextResponse.json({ error: 'Ошибка создания ссылки' }, { status: 500 });
  }
}
