'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import Notification from '../ui/main/Notification';

interface NotificationContextProps {
  showNotification: (
    message: string,
    type: 'success' | 'info' | 'error',
    description?: string,
  ) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined,
);

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<
    {
      message: string;
      type: 'success' | 'info' | 'error';
      id: number;
      description?: string;
    }[]
  >([]);
  const [notificationId, setNotificationId] = useState(0);

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'error',
    description?: string,
  ) => {
    const id = notificationId;
    setNotificationId((prev) => prev + 1);

    setNotifications((prev) => [...prev, { message, type, id, description }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 2000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.length > 0 && (
        <div className='fixed left-0 right-0 top-5 z-50 flex flex-col items-center space-y-2 p-2'>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              message={notification.message}
              description={notification.description}
              type={notification.type}
              onClose={() =>
                setNotifications((prev) =>
                  prev.filter((notif) => notif.id !== notification.id),
                )
              }
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
