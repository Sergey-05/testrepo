'use client';

import { useState } from 'react';
import Slider from 'react-slick';
import { Gift, ArrowRight, BookText } from 'lucide-react';
import { useWebApp } from '../../lib/hooks/useWebApp';
import useGlobalStore from '@/app/store/useGlobalStore';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const { appConfig } = useGlobalStore();

  const WebApp = useWebApp();

  // Проверяем наличие ссылки менеджера
  const managerLink = appConfig?.manager_link ?? null;

  // Функция открытия ссылки с проверкой
  const openLink = (url: string | null) => {
    if (!url) {
      console.warn('Ссылка менеджера не задана');
      return;
    }
    if (typeof window !== 'undefined' && WebApp?.openTelegramLink) {
      WebApp.openTelegramLink(url);
    } else {
      console.log('Open Telegram link:', url);
    }
  };

  // Формируем слайды с учётом наличия managerLink
  const slides = [
    {
      icon: (
        <Gift
          className='h-16 w-16 stroke-[0.8] text-purple-400'
          aria-hidden
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ),
      title: 'Ни один участник в 2025 году не останется без подарка от PLUS!',
      ctaText: 'Забрать подарок',
      ctaAction: () => openLink(managerLink),
    },
    {
      icon: (
        <BookText
          className='h-16 w-16 stroke-[0.8] text-purple-400'
          aria-hidden
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ),
      title: 'Не получается пополнить с помощью банковской карты?',
      bodyText: 'P2P менеджер',
      bodyLink: managerLink,
      ctaText: 'Подробнее',
      ctaAction: () => openLink(managerLink),
    },
  ];

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    adaptiveHeight: true,
    afterChange: (index: number) => setCurrent(index),
  };

  return (
    <section
      className='relative mb-4 max-w-full select-none overflow-hidden rounded-2xl bg-[#121212] text-white shadow-lg'
      aria-label='Промо баннер'
    >
      <Slider {...settings}>
        {slides.map(
          ({ icon, title, bodyText, bodyLink, ctaText, ctaAction }, i) => (
            <div key={i}>
              <div className='flex max-h-36 min-h-[100px]'>
                <div className='flex items-center justify-center rounded-2xl bg-gradient-to-tr from-black via-[#1a1a1a] to-[#2a2a2a] px-2'>
                  {icon}
                </div>
                <div className='flex w-3/4 flex-col justify-center px-4 py-2'>
                  <h3 className='text-xs leading-snug'>{title}</h3>
                  {bodyText && bodyLink && (
                    <button
                      onClick={() => openLink(bodyLink)}
                      className='mt-1 text-left text-xs font-semibold text-white hover:text-purple-300'
                      type='button'
                    >
                      {bodyText}
                    </button>
                  )}
                  <button
                    onClick={ctaAction}
                    className={`mt-3 inline-flex items-center text-xs font-semibold text-purple-400 transition-colors duration-200 hover:text-purple-300 ${
                      !managerLink ? 'pointer-events-none opacity-50' : ''
                    }`}
                    type='button'
                    disabled={!managerLink}
                  >
                    <span className='leading-none'>{ctaText}</span>
                    <ArrowRight
                      className='ml-1 h-4 w-4 flex-shrink-0'
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
      </Slider>
      <span className='absolute bottom-2 right-4 font-mono text-xs text-purple-400'>
        {current + 1}/{slides.length}
      </span>
    </section>
  );
}
