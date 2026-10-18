import { useState, useEffect } from 'react';
import { SyncOutbox } from './syncOutbox';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => SyncOutbox.getPendingCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger auto-sync when network returns
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setPendingSyncCount(SyncOutbox.getPendingCount());
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await SyncOutbox.syncPendingItems();
      setPendingSyncCount(SyncOutbox.getPendingCount());
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    syncNow: handleSync
  };
}
