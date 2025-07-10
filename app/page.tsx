'use client';

import { BannerSlider } from './ui/banners/banner';
import { RecentTransactions } from './ui/main/RecentTransactions';
import TariffBlocks from './ui/main/TarifBlocks';
import PromoBanner from './ui/banners/PromoBanner';
import Footer from './ui/layout/footer';
import ButtonsMain from './ui/main/ButtonsMain';
import { motion } from 'framer-motion';
import FaqSection from './ui/main/FaqSection';

export default function Page() {
  return (
    <motion.div
      className='relative flex w-full flex-col p-2'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ButtonsMain />
      {/* Слайдер */}
      <BannerSlider />

      <TariffBlocks />

      {/* Транзакции */}
      <div className='relative z-10 mx-auto mb-4 w-full max-w-7xl'>
        <RecentTransactions />
      </div>

      <PromoBanner />

      <FaqSection />

      {/* Футер */}
      <Footer />
    </motion.div>
  );
}
