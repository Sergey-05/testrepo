// 'use client';

// import clsx from 'clsx';
// import { PaymentMethod } from '../../lib/definition';

// interface Props {
//   method: PaymentMethod;
//   onSelect: (method: PaymentMethod) => void;
//   isDisabled?: boolean;
// }

// export const PaymentMethodCard = ({ method, onSelect, isDisabled }: Props) => {
//   return (
//     <button
//       onClick={() => !isDisabled && onSelect(method)}
//       disabled={isDisabled}
//       className={clsx(
//         'relative flex h-[100px] w-full basis-[calc(50%_-_6px)] flex-col items-start rounded-3xl bg-zinc-900 p-3 transition-all',
//         isDisabled
//           ? 'cursor-not-allowed opacity-50'
//           : 'cursor-pointer hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:opacity-75',
//         'md:basis-[calc(100%_/_3_-_8px)]',
//       )}
//       style={{
//         backgroundImage: `url(${method.bgImageUrl})`,
//         backgroundPosition: 'right',
//         backgroundSize: 'contain',
//         backgroundRepeat: 'no-repeat',
//       }}
//       type='button'
//     >
//       <p className='line-clamp-2 max-w-[96px] text-left text-sm font-semibold tracking-tight text-white'>
//         {method.title}
//         <br />
//         {method.id != 'card-transfer' &&
//           method.id != 'mir' &&
//           method.id != 'sbp' &&
//           `(${method.network})`}
//       </p>
//       {method.minAmount && (
//         <p className='mt-auto max-w-[calc(100%-50px)] text-left text-xs tracking-tight text-zinc-400'>
//           {method.id != 'card-transfer' &&
//             method.id != 'mir' &&
//             method.id != 'sbp' &&
//             'от 50₽'}
//           {(method.id == 'card-transfer' ||
//             method.id == 'mir' ||
//             method.id == 'sbp') &&
//             `${method.minAmount}`}
//         </p>
//       )}
//     </button>
//   );
// };

'use client';

import clsx from 'clsx';
import { PaymentMethod } from '../../lib/definition';

interface Props {
  method: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  isDisabled?: boolean;
  activeTab: 'Депозит' | 'Вывод' | 'История';
}

export const PaymentMethodCard = ({
  method,
  onSelect,
  isDisabled,
  activeTab,
}: Props) => {
  return (
    <button
      onClick={() => !isDisabled && onSelect(method)}
      disabled={isDisabled}
      className={clsx(
        'relative flex h-[100px] w-full basis-[calc(50%_-_6px)] flex-col items-start rounded-3xl bg-zinc-900 p-3 transition-all',
        isDisabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:opacity-75',
        'md:basis-[calc(100%_/_3_-_8px)]',
      )}
      style={{
        backgroundImage: `url(${method.bgImageUrl})`,
        backgroundPosition: 'right',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
      type='button'
    >
      <p className='line-clamp-2 max-w-[96px] text-left text-sm font-semibold tracking-tight text-white'>
        {method.title}
        <br />
        {method.id != 'card-transfer' &&
          method.id != 'mir' &&
          method.id != 'sbp' &&
          `(${method.network})`}
      </p>
      {/* {method.minAmount && (
        <p className='mt-auto max-w-[calc(100%-50px)] text-left text-xs tracking-tight text-zinc-400'>
          {(method.id == 'card-transfer' ||
            method.id == 'mir' ||
            method.id == 'sbp') &&
            `${method.minAmount}`}
        </p>
      )} */}
      {method.minAmount && (
        <p className='mt-auto max-w-[calc(100%-50px)] text-left text-xs tracking-tight text-zinc-400'>
          {(method.id === 'card-transfer' ||
            method.id === 'mir' ||
            method.id === 'sbp') &&
            (activeTab === 'Вывод' ? `от 50₽` : `${method.minAmount}`)}
        </p>
      )}
    </button>
  );
};
