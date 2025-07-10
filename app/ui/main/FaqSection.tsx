'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: 'Как пополнить баланс?',
    answer:
      'Перейдите в раздел «Кошелёк», нажмите кнопку «Пополнить», затем выбирайте удобный способ пополнения, введите сумму (от 250₽) и следуйте дальнейшим инструкциям',
  },
  {
    question: 'Можно ли вывести средства?',
    answer:
      'Вывод средств доступен раз в 24 часа через раздел «Кошелёк». Нажмите кнопку «Вывести» и следуйте инструкциям для завершения операции.',
  },
  {
    question: 'Пополнил счёт, но средства не поступили. Что делать?',
    answer:
      'Срок зачисления средств — до 24 часов. После обработки они отобразятся в разделе «Кабинет». Если время регламентапревышено, свяжитесь с менеджером.',
  },
  {
    question: 'Что такое реинвестирование?',
    answer:
      'Реинвестирование — это перенос прибыли с раздела «Кошелёк» на вклад для увеличения дохода.',
  },
  {
    question: 'Что такое тарифы и как они влияют на доход?',
    answer:
      'Тарифы определяют процент доходности в зависимости от суммы депозита. Чем выше депозит — тем выше процент. Подробности — в разделе «Кабинет».',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className='mb-12 w-full max-w-md'>
      <h3 className='mb-2 text-left text-xl font-semibold text-white'>FAQ</h3>
      <ul className='space-y-2 divide-y divide-white/10'>
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <li key={index}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className='flex w-full items-center justify-between py-3 text-left text-sm text-white'
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-white/50 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && <Accordion answer={item.answer} />}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Accordion({ answer }: { answer: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, []);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className='overflow-hidden text-sm leading-relaxed text-purple-300'
    >
      <div ref={ref} className='pb-3 pl-1 pr-4'>
        {answer}
      </div>
    </motion.div>
  );
}
