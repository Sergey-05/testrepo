// utils/telegram.ts
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Укажите ваш токен бота в переменных окружения
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Интерфейс для инлайн-кнопки (уже есть)
interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

// Интерфейс для reply_markup (inline_keyboard)
interface ReplyMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

// Интерфейс для payload метода sendMessage
interface SendMessagePayload {
  chat_id: string | number;
  text: string;
  parse_mode?: string;
  reply_markup?: ReplyMarkup;
}

export async function sendTelegramMessage(
  chatId: string | number,
  message: string,
  inlineKeyboard?: InlineKeyboardButton[][]
) {
  try {
    const payload: SendMessagePayload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML', // Опционально, для форматирования текста
    };

    // Если передан inlineKeyboard, добавляем его в reply_markup
    if (inlineKeyboard) {
      // Преобразуем массив кнопок: каждая кнопка в отдельной строке
      const transformedKeyboard = inlineKeyboard.flat().map(button => [button]);
      payload.reply_markup = {
        inline_keyboard: transformedKeyboard,
      };
    }

    await axios.post(TELEGRAM_API_URL + '/sendMessage', payload);
  } catch (error) {
    console.error('Ошибка при отправке сообщения в Telegram:', error);
    throw new Error('Не удалось отправить сообщение в Telegram');
  }
}