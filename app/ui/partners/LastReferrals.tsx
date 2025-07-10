import Image from 'next/image';
import { RefreshCw, X } from 'lucide-react';
import useGlobalStore from '@/app/store/useGlobalStore';
import { useNotification } from '@/app/context/NotificContext';
import { useState } from 'react';
import { getPartnerEarningsByTelegramId } from '@/app/lib/dataQuery';
import clsx from 'clsx';

const logoBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABDCAYAAAAlFqMKAAAAAXNSR0IArs4c6QAABChJREFUeF7tmknIFEcUx38vmqgxxgXjSQkIogYEFdSTiB5cUEkQNSEu8SCCKKgIbrgveFE86CV6CEriinpISA4GxLvmEFFIDh7EDT0EkbhEzbMf1MDMONNdPf11f9rV7zQwVUW9X7/616t6JVTWQEAqHo0EKiBNEVEBqYDEi0QVIUVHiKoOBkYBPTMI+P/AAxH5O8MYXl1zjxBV/RI4AXzqNaPWjV4APwErROR1hnESuxYB5CvgeEYg5shFYImI/JvoVYYG7xuQxSLyNIO/iV3fJyAXXIRUQNxnLQ2QJFE1wfwP6JcQzwbElsyzxLjP0KCIJWNATFT7t5in7Rg3gFuAiW+cnXdAnmfwN7FrdwO5BxwB7ritOWggT4CzwFZgSpS8nQ4pQpoTM9ON34EdInJNVb8OGYjpxp/AfhE5Z1ERMhB1emG6cUhEXjogC12ExGlaqUS1tmQeAyfdUnlU0wxVXQCcAnrE6Ihtu4tEpDS7TO963ah3PMQl8wNw2+nGmeYoCBHIfuDHKBs9KCK2wzRYaECmAXOAAyJiidhblgKIachbQBPTzxQN2qq6qg6ILmVGAH1TjNfc1M4d5sBrEbnebhxPIFeiW7e9USL3KsN8bFe7LyJ2VGhpcUCmurT6iw4nYBO/CuwTkV/ixvAE0uE0Grr9A3wfRdnm7gBiImrL5HCSJyEAqZ1TtonI/dCBmG5cAnbbOSUJRorU3WeopDaFLxlv3eggMUty1uf/woF460YTEBPw7T4exbTpBQwDhsa0KRRIKt3I6HxDd1W1M9AYYBNgVwntrDAgqXWjq4CoqqUOFhWrgHXAR90NpCPd6EIglkB+G423E/gsYdxCIqQj3egKIKpqJ+jpwC5grMeYuQPpTt2w4vn4qISxBbCbfR/LHchfwFHgD5/ZxLR5KCI3fcdwuvE5sNZph+/LgtyB+PqQ1O6MiHyT1Kj2v6oOimo5S91WPdC3H1A+IKraB5htmTAwOgUMa1ouIKr6ITDB1XJmpYRRLiBON4YD64GVHcAoHRDTjWVON1rViX0YZVoy46I1twYwNc9iQ6KSZdIlU6yoquonwERgfge6UT93SxN+FpFj7RwqotjtU6ZsC0RVLRW32q+dVY6IiD2dyM3eaSCq+oGLiI12RkmzNXdK7F0HYmeT5e4U+1vQQFTVbvvnRl/aDm0jo0hJlbyVKkKcbkyOyhfbnH6Yf2ECcbphL583AN/VfelggdhTcMs3TEjtd83CA6KqHwMznW7YNltvYQGxR7ku+TLdmNFCFIMDYkvEzimroxuwVulAUEB+Bey92Z6YMkJQQOyd6l1gUkz+EBQQnzyqAhLyLlNFiA+BskbIPPfgzi6Hs1hpNMSKSVZzjavK+4C6LCJ2056r5X4fkuvscxi8AtIEtQJSAYlfZ1WEVBESHyFvANHHIWJcS1L4AAAAAElFTkSuQmCC';
export const LastReferrals = () => {
  const [loading, setLoading] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const { partnerEarnings, setPartnerEarnings, user } = useGlobalStore();
  const { showNotification } = useNotification();

  const handleRefresh = async () => {
    if (loading || !user?.telegram_id) return;
    setLoading(true);
    setFadingOut(true);

    try {
      const updatedPartnerEarnings = await getPartnerEarningsByTelegramId(
        BigInt(user.telegram_id),
      );
      setPartnerEarnings(updatedPartnerEarnings);
      setFadingOut(false);
    } catch {
      showNotification('Ошибка', 'error', 'Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full overflow-hidden rounded-xl border border-zinc-800 bg-black/40 shadow-lg backdrop-blur'>
      <div className='flex items-center justify-between border-b border-zinc-800 px-4 py-3'>
        <h2 className='text-sm font-semibold text-white'>
          Последние отчисления
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading || !user?.telegram_id}
          className='relative'
          aria-label='Обновить транзакции'
        >
          <RefreshCw
            className={clsx(
              'h-5 w-5 text-gray-500 transition-transform duration-500',
              loading && 'animate-spin',
            )}
          />
        </button>
      </div>
      <ul
        className={clsx(
          'divide-y divide-zinc-800 text-xs transition-opacity duration-300',
          fadingOut ? 'opacity-0' : 'opacity-100',
        )}
      >
        {partnerEarnings.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8'>
            <X className='h-12 w-12 text-gray-500' strokeWidth={4} />
            <p className='mt-2 text-lg font-semibold text-zinc-500'>
              Пока пусто
            </p>
          </div>
        ) : (
          partnerEarnings.slice(0, 10).map((ref) => (
            <li
              key={ref.id}
              className='flex items-center justify-between px-4 py-3'
            >
              <div className='flex items-center gap-3'>
                <div className='relative h-6 w-6 overflow-hidden shadow-inner'>
                  <Image
                    src={logoBase64}
                    alt='avatar'
                    fill
                    className='object-cover'
                  />
                </div>
                <span className='text-zinc-400'>
                  ID {ref.partner_telegram_id}
                </span>
              </div>
              <span className='bg-gradient-to-r from-white to-purple-300 bg-clip-text font-medium text-transparent'>
                {ref.amount.toLocaleString('ru-RU')} ₽
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
