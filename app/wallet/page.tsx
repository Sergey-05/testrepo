'use client';

import { motion } from 'framer-motion';
import useGlobalStore from '@/app/store/useGlobalStore';
import { CalculatorButton } from '@/app/ui/modals/Calculator';
import { Transactions } from '@/app/ui/wallet/transactions';
import { UserCard } from '@/app/ui/wallet/UserWalletCard';
import { Banner } from '@/app/ui/banners/BannerWallet';
import { InfoBlock } from '@/app/ui/wallet/InfoWalletBlock';
import Footer from '@/app/ui/layout/footer';

export default function WalletPage() {
  const { user } = useGlobalStore();

  return (
    <motion.div
      className='p-2 text-white'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {user && (
        <>
          <div className='rounded-b-[40px]'>
            <UserCard telegramId={user.telegram_id} balance={user.balance} />
          </div>
          <CalculatorButton />
          <Banner />
          <Transactions />
          <InfoBlock />
          <Footer />
        </>
      )}
    </motion.div>
  );
}
