'use client';

import Image from 'next/image';
import { useWebApp } from '../../lib/hooks/useWebApp';
import { logo, support } from '../../lib/images';
import useGlobalStore from '@/app/store/useGlobalStore';

export default function Footer() {
  const { appConfig } = useGlobalStore();
  const currentYear = new Date().getFullYear();
  const WebApp = useWebApp();

  const openLink = (url: string) => {
    if (typeof window !== 'undefined' && WebApp) {
      WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <footer className='py-8 text-white'>
      <div className='mx-auto max-w-5xl'>
        {/* Лого и чёрно-фиолетовая полоса */}
        <div className='mb-6 flex items-center'>
          <Image
            src={logo}
            alt='Логотип'
            width={100}
            height={24}
            className='drop-shadow-[0_0_2px_rgba(255,255,255,0.1)]'
          />
          <div className='ml-4 h-[1px] w-full bg-gradient-to-r from-black to-purple-900' />
        </div>

        {/* Раздел Информация */}
        <div className='mb-6'>
          <h3 className='mb-2 text-lg font-medium text-white'>Информация</h3>
          <div className='flex gap-2'>
            <button
              onClick={() =>
                openLink('https://telegra.ph/Pravila-platformy-06-24')
              }
              className='max-w-[150px] truncate text-[11px] text-gray-400 transition-colors hover:text-[#00D4FF]'
            >
              Правила
            </button>
            <button
              onClick={() =>
                openLink('https://telegra.ph/Partnerskaya-programma-Plus-06-23')
              }
              className='max-w-[150px] truncate text-[11px] text-gray-400 transition-colors hover:text-[#00D4FF]'
            >
              Партнерская программа
            </button>
            <button
              onClick={() =>
                openLink('https://telegra.ph/Bonusy-i-akcii-06-24')
              }
              className='max-w-[150px] truncate text-[11px] text-gray-400 transition-colors hover:text-[#00D4FF]'
            >
              Бонусы и акции
            </button>
          </div>
        </div>

        {/* Блок поддержки */}
        <div className="relative mb-4 flex h-[164px] max-w-full shrink-0 overflow-hidden rounded-xl bg-zinc-800 p-4 before:absolute before:bottom-0 before:right-0 before:h-full before:w-[196px] before:bg-[url('data:image/png;base64,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')] before:bg-cover before:content-[''] lg:max-w-[277px] xl:max-w-[343px]">
          <div className='flex h-full max-w-36 flex-col items-start'>
            <div className='mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-white'>
              Поддержка
              <div className='flex items-center rounded-full bg-gradient-to-br from-purple-900 to-gray-800 px-2 py-1 text-xs font-semibold tracking-tight text-white'>
                24/7
              </div>
            </div>
            <p className='text-sm tracking-tight text-zinc-400'>
              Обратитесь к нам, если есть вопросы
            </p>
            <button
              className='mt-auto flex min-h-[32px] items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold tracking-tight text-white outline outline-2 outline-offset-2 outline-transparent transition-all hover:bg-zinc-800 focus-visible:bg-zinc-800'
              onClick={() =>
                WebApp && appConfig.manager_link
                  ? WebApp.openTelegramLink(appConfig.manager_link)
                  : null
              }
            >
              Написать
            </button>
          </div>
          <Image
            alt='support image'
            width={164}
            height={164}
            src={support.wSup}
            className='absolute bottom-0 right-0 h-[164px] w-[164px]'
            priority
          />
        </div>

        {/* Блок криптовалют и платежей */}
        <div className='mb-6 flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            {/* USDT */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='size-6'
            >
              <g clipPath='url(#usdt_svg__a)'>
                <path
                  fill='#53AE94'
                  d='M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12'
                />
                <path
                  fill='#fff'
                  fillRule='evenodd'
                  d='M17.081 9.448V7.2H6.966v2.248h3.975v1.76c-.652.018-1.508.058-2.345.148-.77.082-1.543.209-2.131.407-.293.098-.56.22-.76.38-.203.161-.366.385-.366.677 0 .104.048.208.122.3.078.096.197.197.378.304.335.198.822.378 1.43.53.973.243 2.247.412 3.672.47v4.223h2.29V14.42c1.373-.063 2.6-.23 3.545-.466.608-.151 1.096-.331 1.43-.529.181-.107.3-.208.378-.304a.5.5 0 0 0 .122-.3c0-.274-.197-.46-.352-.568a2.6 2.6 0 0 0-.584-.286 8 8 0 0 0-.91-.26l-.084-.02c-.944-.236-2.172-.403-3.546-.465V9.448zm-6.14 2.36c-.638.018-1.47.057-2.28.144-.76.082-1.48.203-2.005.38q-.396.134-.578.28a.4.4 0 0 0-.129.154c.03.03.089.079.196.142.263.155.687.318 1.27.463.92.23 2.143.395 3.526.452zm2.29 2.01V11.82c1.33.062 2.507.224 3.4.447l.1.024c.196.047.526.125.833.237.185.068.341.14.446.214a1 1 0 0 1 .06.047c-.035.03-.088.07-.17.118-.262.155-.687.318-1.269.463-.893.224-2.07.385-3.4.447'
                  clipRule='evenodd'
                />
              </g>
              <defs>
                <clipPath id='usdt_svg__a'>
                  <path fill='#fff' d='M0 0h24v24H0z' />
                </clipPath>
              </defs>
            </svg>
            {/* TON */}
            <svg
              viewBox='0 0 25 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='size-6'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M24.834 12.001c0 6.629-5.373 12.002-12 12.002S.834 18.63.834 12C.834 5.373 6.207 0 12.834 0s12 5.373 12 12.001Z'
                fill='#fff'
              />
              <path
                d='M12.085 15.774V8.196h-3.35a.464.464 0 0 0-.408.694l2.658 4.754 1.1 2.13ZM14.682 13.645l2.656-4.756a.464.464 0 0 0-.408-.694h-3.35v7.581l1.102-2.13Z'
                fill='#0098EA'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M24.834 12.001c0 6.629-5.373 12.002-12 12.002S.834 18.63.834 12C.834 5.373 6.207 0 12.834 0s12 5.373 12 12.001ZM8.736 6.698h8.196c1.506 0 2.461 1.628 1.704 2.94l-5.059 8.767a.859.859 0 0 1-1.487 0L7.032 9.638c-.758-1.314.197-2.94 1.704-2.94Z'
                fill='#0098EA'
              />
            </svg>
            {/* BNB */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 32 32'
              fill='none'
              className='size-6'
            >
              <ellipse cx='16' cy='16.004' fill='#EDF0F4' rx='16' ry='16.002' />
              <path
                fill='#343434'
                d='m15.956 6.403-.127.432v12.546l.127.127 5.823-3.442-5.823-9.663Z'
              />
              <path
                fill='#8C8C8C'
                d='m15.956 6.403-5.823 9.663 5.823 3.442V6.403Z'
              />
              <path
                fill='#3C3C3B'
                d='m15.956 20.61-.072.088v4.469l.072.21 5.827-8.207-5.827 3.44Z'
              />
              <path
                fill='#8C8C8C'
                d='M15.956 25.376V20.61l-5.823-3.44 5.823 8.206Z'
              />
              <path
                fill='#141414'
                d='m15.956 19.508 5.823-3.442-5.823-2.647v6.089Z'
              />
              <path
                fill='#393939'
                d='m10.133 16.066 5.823 3.442v-6.09l-5.823 2.648Z'
              />
            </svg>
            {/* BTC */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 32 32'
              className='size-6'
            >
              <path
                fill='#F6931A'
                d='M16 32.006c8.837 0 16-7.165 16-16.002C32 7.166 24.837.002 16 .002S0 7.166 0 16.004c0 8.837 7.163 16.002 16 16.002Z'
              />
              <path
                fill='#fff'
                fillRule='evenodd'
                d='m17.106 6.03-1.73-.432-.71 2.835-3.566-.836-.483 1.881 1.625.436s.276.16.376.326c.091.152.114.44.114.44l-2.056 8.11s-.085.211-.196.294c-.15.112-.473.082-.473.082L8.67 18.79l-.897 2.056 3.566.895-.707 2.828 1.732.433.706-2.826 1.346.338-.69 2.759 1.731.433.69-2.758.077.02s.99.247 1.618.274l.219.01c.833.037 1.397.063 2.21-.285.855-.365 1.302-.777 1.794-1.566.48-.769.66-1.33.62-2.235-.034-.784-.148-1.284-.62-1.91-.375-.496-1.256-.979-1.256-.979s.497-.111.783-.26c.624-.327.906-.702 1.207-1.339.324-.685.38-1.18.245-1.925-.172-.948-.63-1.42-1.338-2.072-.566-.522-1.544-.888-2.218-1.093l.713-2.853-1.731-.433-.714 2.856-1.351-.317.702-2.81Zm.247 5.235-1.42-.316-.864 3.435 1.347.39s1.008.236 1.636.113l.111-.022c.4-.077.69-.132 1-.428.323-.307.468-.58.5-1.024.043-.58-.233-.92-.624-1.35-.491-.537-1.686-.798-1.686-.798Zm-.776 5.42-1.96-.505-.986 3.917 2.172.422s1.112.258 1.786.075l.04-.01c.456-.125.772-.21 1.084-.577.307-.362.423-.674.4-1.149-.026-.513-.265-.786-.597-1.167l-.028-.032c-.55-.631-1.91-.974-1.91-.974Z'
                clipRule='evenodd'
              />
            </svg>
            <span className='flex items-center justify-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-semibold text-white'>
              +20
            </span>
          </div>
          <div className='h-6 w-[1px] bg-zinc-600/30' />
          <div className='flex items-center gap-2'>
            {/* MasterCard */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='size-6'
            >
              <rect width='24' height='24' fill='#fff' rx='12' />
              <path
                fill='#5B57A2'
                d='m6.787 8.83 1.55 2.813v1.717l-1.548 2.808z'
              />
              <path
                fill='#D90751'
                d='m12.735 10.62 1.452-.905 2.971-.002-4.423 2.753z'
              />
              <path fill='#FAB718' d='m12.727 8.813.008 3.726-1.553-.97V6z' />
              <path
                fill='#ED6F26'
                d='m17.158 9.713-2.971.002-1.46-.902L11.182 6z'
              />
              <path
                fill='#63B22F'
                d='M12.735 16.184v-1.808l-1.553-.95.001 5.574z'
              />
              <path
                fill='#1487C9'
                d='m14.183 15.288-5.847-3.645-1.50-2.813 10.366 6.454z'
              />
              <path
                fill='#017F36'
                d='m11.183 19 1.552-2.816 1.448-.896 2.969-.004z'
              />
              <path
                fill='#984995'
                d='m6.789 16.169 4.406-2.743-1.481-.924-1.378.858z'
              />
            </svg>
            {/* Visa */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='size-6'
            >
              <rect width='24' height='24' fill='#FFDD2D' rx='12' />
              <path
                fill='#fff'
                d='M4 5h16v8.047c0 2.063-1.1 3.969-2.887 5L12 21l-5.113-2.953a5.77 5.77 0 0 1-2.887-5z'
              />
              <path
                fill='#333'
                fillRule='evenodd'
                d='M8.391 9v2.503c.342-.387.965-.648 1.676-.648h.773v2.91c0 .773-.21 1.45-.522 1.823h3.363c-.311-.373-.521-1.05-.521-1.822v-2.911h.773c.711 0 1.334.261 1.676.648V9z'
                clipRule='evenodd'
              />
            </svg>
            {/* SberPay */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='size-6'
            >
              <rect width='24' height='24' fill='#fff' rx='12' />
              <path
                fill='url(#SberpPay_svg__a)'
                d='M3 12.256A4.256 4.256 0 0 1 7.256 8h9.269a4.256 4.256 0 1 1 0 8.513H7.256A4.256 4.256 0 0 1 3 12.256'
              />
              <path
                fill='#FEFEFE'
                d='M8.72 10.434c-.14.104-.275.2-.405.302-.075.06-.122.003-.177-.029-.542-.314-1.101-.332-1.661-.067A1.78 1.78 0 0 0 5.54 12.8c.285.894 1.24 1.448 2.173 1.18.673-.192 1.1-.646 1.285-1.326a.7.7 0 0 0 .027-.239c-.023-.209.108-.295.248-.386.088-.057.184-.197.258-.16.08.042.052.201.057.31.05 1.247-.91 2.305-2.188 2.409a2.3 2.3 0 0 1-1.224-.25 2.24 2.24 0 0 1-1.068-1.122c-.312-.692-.277-1.378.054-2.061.647-1.335 2.481-1.63 3.558-.722M13.73 11.948c-.103.381-.37.586-.734.69l-.126.035c-.208.036-.418.034-.627.033q-.33 0-.33.336c0 .166-.004.332.003.498.003.09-.017.134-.12.125-.14-.011-.321.043-.41-.027-.095-.075-.03-.265-.03-.404-.002-.834.002-1.668-.003-2.503 0-.116.03-.148.145-.144.428.015.858-.02 1.286.03.156.02.307.053.45.118.341.153.515.42.52.79.002.142.018.284-.024.423m-1.818-.301c0 .151.004.302 0 .453-.003.073.014.106.095.103.18-.007.361 0 .542-.01a.9.9 0 0 0 .367-.085c.197-.096.3-.312.268-.553-.031-.225-.16-.37-.354-.408-.269-.054-.54-.041-.811-.046-.082-.001-.112.022-.109.107.007.146.002.293.002.439M15.099 11.436c.114.024.228.047.335.098.207.101.323.273.339.495.036.512.009 1.024.017 1.536.002.08-.032.104-.105.098-.038-.004-.078 0-.117 0q-.279 0-.297-.27c-.024-.014-.036.006-.046.02-.205.287-.743.409-1.124.15-.151-.102-.227-.289-.227-.493 0-.398.156-.594.547-.667.242-.045.486-.03.73-.027.11.002.132-.04.123-.136-.024-.256-.141-.355-.446-.361a.88.88 0 0 0-.785.392v-.425c.007-.271.009-.274.275-.355.256-.078.518-.077.78-.055m-.153 1.276a1.4 1.4 0 0 0-.354.024c-.096.02-.173.072-.19.178-.016.098.01.185.091.248.217.168.67.036.76-.222.065-.18.034-.227-.151-.228z'
              />
              <path
                fill='#FEFEFE'
                d='M6.35 11.977q.002-.124-.001-.249c-.004-.094.031-.098.1-.053.213.138.43.266.636.411.112.079.19.08.301-.008.362-.285.726-.569 1.104-.833q.267-.188.532-.378c.063-.044.086-.04.133.026.27.373.269.367-.094.631q-.852.623-1.696 1.256c-.087.065-.149.074-.242.01a7 7 0 0 0-.612-.38c-.131-.07-.184-.159-.162-.302.006-.043 0-.087 0-.131M18.249 11.47l-.529 1.46q-.18.495-.356.988a1.8 1.8 0 0 1-.189.377c-.181.274-.517.29-.77.188-.053-.021-.07-.06-.069-.115.003-.127.001-.253.001-.389.025.008.044.01.06.02.132.075.265.102.392-.008a.38.38 0 0 0 .11-.438q-.409-.99-.824-1.978c-.013-.032-.034-.06-.02-.105.162 0 .327.004.492-.002.066-.002.082.038.1.081l.47 1.175c.019.046.017.124.076.12.06-.004.076-.076.095-.134.123-.375.25-.748.37-1.125.028-.087.064-.125.162-.118.135.01.272.003.428.003'
              />
              <defs>
                <linearGradient
                  id='SberpPay_svg__a'
                  x1='4.063'
                  x2='11.553'
                  y1='8.904'
                  y2='19.538'
                  gradientUnits='userSpaceOnUse'
                >
                  <stop stopColor='#F5EB00' />
                  <stop offset='0.658' stopColor='#00D116' />
                  <stop offset='0.985' stopColor='#00A7F5' />
                </linearGradient>
              </defs>
            </svg>
            <span className='flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white'>
              Переводы на карту
            </span>
          </div>
        </div>

        {/* Копирайт */}
        <div className='text-sm text-white/60'>
          © {currentYear} PLUS. Все права защищены
        </div>
      </div>
    </footer>
  );
}
