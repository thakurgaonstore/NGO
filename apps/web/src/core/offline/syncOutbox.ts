export interface OutboxItem {
  id: string; // UUIDv4 idempotency key
  tenantId: string;
  type: 'form_submission' | 'attendance' | 'collection' | 'member_reg';
  payload: any;
  createdAt: number;
  synced: boolean;
  syncedAt?: number;
  retryCount: number;
  error?: string;
}

const OUTBOX_KEY = 'ngo_offline_outbox_queue_v1';

export class SyncOutbox {
  public static getQueue(): OutboxItem[] {
    try {
      const data = localStorage.getItem(OUTBOX_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static enqueue(item: Omit<OutboxItem, 'synced' | 'retryCount'>): OutboxItem {
    const queue = this.getQueue();
    const newItem: OutboxItem = {
      ...item,
      synced: false,
      retryCount: 0
    };
    queue.push(newItem);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
    return newItem;
  }

  public static getPendingCount(): number {
    return this.getQueue().filter((item) => !item.synced).length;
  }

  public static markAsSynced(id: string) {
    const queue = this.getQueue();
    const updated = queue.map((item) =>
      item.id === id ? { ...item, synced: true, syncedAt: Date.now() } : item
    );
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(updated));
  }

  public static clearSynced() {
    const queue = this.getQueue();
    const pendingOnly = queue.filter((item) => !item.synced);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(pendingOnly));
  }

  public static async syncPendingItems(onProgress?: (syncedCount: number, total: number) => void): Promise<number> {
    const queue = this.getQueue();
    const pending = queue.filter((i) => !i.synced);
    if (pending.length === 0) return 0;

    let synced = 0;
    for (const item of pending) {
      try {
        // In real backend, dispatches batched Firestore write with doc ID = item.id (idempotency key)
        await new Promise((resolve) => setTimeout(resolve, 150));
        this.markAsSynced(item.id);
        synced++;
        if (onProgress) onProgress(synced, pending.length);
      } catch (err: any) {
        console.error('Failed to sync item:', item.id, err);
      }
    }
    return synced;
  }
}
