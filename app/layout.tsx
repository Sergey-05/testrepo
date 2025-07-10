import HeaderMain from './ui/layout/header';
import { NavLinks } from './ui/layout/nav_links';
import { ModalProvider } from './context/ModalContext';
import { ModalManager } from './ui/layout/ModalManager';
import { NotificationProvider } from './context/NotificContext';
import ClientEvents from './ui/layout/ClientEvents';
import './globals.css';
import DataLoader from './ui/layout/DataLoader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ru'
      style={
        {
          '--tg-viewport-height': '100vh',
          '--tg-viewport-stable-height': '100vh',
        } as React.CSSProperties
      }
    >
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
        <title>PLUS</title>
      </head>
      <body className='flex h-screen flex-col text-white'>
        <NotificationProvider>
          <ModalProvider>
            <DataLoader />
            <ClientEvents />
            <header className='flex-shrink-0'>
              <HeaderMain />
            </header>
            <main className='flex-1 overflow-y-auto overflow-x-hidden pb-[120px]'>
              {children}
              <div id='qr-portal' />
            </main>
            <div className='flex-shrink-0 bg-gradient-to-b from-gray-950 to-purple-900/50'>
              <NavLinks />
            </div>
            <ModalManager />
          </ModalProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
