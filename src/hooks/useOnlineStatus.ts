'use client';

import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [online, setOnline] = useState(
    () => (typeof window === 'undefined' ? true : navigator.onLine)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return online;
};
