'use client';

import { useEffect } from 'react';

export default function ClientEvents() {
  useEffect(() => {
    const preventGesture = (e: Event) => e.preventDefault();
    const preventTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    document.addEventListener('gesturestart', preventGesture, {
      passive: false,
    });
    document.addEventListener('dblclick', preventGesture, {
      passive: false,
    });
    document.addEventListener('touchstart', preventTouchStart, {
      passive: false,
    });

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('dblclick', preventGesture);
      document.removeEventListener('touchstart', preventTouchStart);
    };
  }, []);

  return null;
}
