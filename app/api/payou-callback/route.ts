import { NextRequest } from 'next/server';
import { query } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const amount = form.get('AMOUNT')?.toString();
  const status = form.get('status')?.toString();
  const intid = form.get('intid')?.toString(); // ID операции
  const sign = form.get('SIGN')?.toString();
  const orderId = form.get('MERCHANT_ORDER_ID')?.toString(); // ID транзакции в нашей БД

  const merchantId = process.env.PAYOU_MERCHANT_ID;
  const secretKey = process.env.PAYOU_SECRET_KEY;

  if (!merchantId || !secretKey) {
    return new Response(`${orderId}|error`, { status: 500 });
  }

  if (!amount || !status || !intid || !sign || !orderId) {
    return new Response(`${orderId}|error`, { status: 400 });
  }

  const expectedHash = crypto
    .createHash('md5')
    .update(`${merchantId}:${amount}:${secretKey}:${status}:${intid}:${orderId}`)
    .digest('hex');

  if (sign !== expectedHash || status !== 'success') {
    return new Response(`${orderId}|error`, { status: 403 });
  }

  try {
    const { rows } = await query<{ status: string; amount: number }>(
      'SELECT status, amount FROM transactions WHERE id = $1',
      [orderId],
    );

    const transaction = rows[0];

    if (!transaction) {
      return new Response(`${orderId}|error`, { status: 404 });
    }

    if (transaction.status !== 'in_process') {
      return new Response(`${orderId}|success`);
    }

    if (parseFloat(amount) !== parseFloat(transaction.amount.toString())) {
      return new Response(`${orderId}|error`, { status: 409 });
    }

    await query(
      `
      UPDATE transactions 
      SET status = 'approved', review_time = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [orderId],
    );

    // await query(
    //   `
    //   UPDATE users 
    //   SET 
    //     balance = balance + $1, 
    //     deposit_amount = deposit_amount + $1, 
    //     last_deposit_at = CURRENT_TIMESTAMP 
    //   WHERE telegram_id = (
    //     SELECT telegram_id FROM transactions WHERE id = $2
    //   )
    // `,
    //   [amount, orderId],
    // );

    return new Response(`${orderId}|success`);
  } catch (error) {
    console.error('Payou webhook error:', error);
    return new Response(`${orderId}|error`, { status: 500 });
  }
}
