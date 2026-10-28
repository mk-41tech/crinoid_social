/**
 * Object Storage Service for Crinoid Social
 * Uses browser-native IndexedDB ObjectStore to store large binary media files (Blobs/Files)
 * instead of storing large binary data in the main localStorage database.
 */

const DB_NAME = 'crinoid_object_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_objects';

interface StorageRecord {
  key: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
  updatedAt: string;
}

class ObjectStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeUrlCache: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a binary file/blob to object storage
   * Returns the unique storage key
   */
  async saveObject(key: string, blob: Blob, fileName: string = ''): Promise<string> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record: StorageRecord = {
        key,
        blob,
        mimeType: blob.type,
        fileName,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(record);

      request.onsuccess = () => {
        // Cache object URL for quick immediate retrieval
        const objectUrl = URL.createObjectURL(blob);
        this.activeUrlCache.set(key, objectUrl);
        resolve(key);
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to save object ${key}`));
      };
    });
  }

  /**
   * Retrieve a binary file/blob from object storage by key
   */
  async getObject(key: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const record = request.result as StorageRecord | undefined;
        resolve(record ? record.blob : null);
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to get object ${key}`));
      };
    });
  }

  /**
   * Get a usable object URL for viewing/streaming a media asset
   */
  async getObjectUrl(key: string): Promise<string | null> {
    // Check in-memory cache first
    if (this.activeUrlCache.has(key)) {
      return this.activeUrlCache.get(key)!;
    }

    const blob = await this.getObject(key);
    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    this.activeUrlCache.set(key, objectUrl);
    return objectUrl;
  }

  /**
   * Delete an object from storage
   */
  async deleteObject(key: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        if (this.activeUrlCache.has(key)) {
          URL.revokeObjectURL(this.activeUrlCache.get(key)!);
          this.activeUrlCache.delete(key);
        }
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to delete object ${key}`));
      };
    });
  }

  /**
   * Download the object as a file to user device
   */
  async downloadObject(key: string, downloadFileName: string, fallbackUrl?: string): Promise<void> {
    let blob = await this.getObject(key);
    let downloadUrl: string;

    if (blob) {
      downloadUrl = URL.createObjectURL(blob);
    } else if (fallbackUrl) {
      // If object was seeded from a remote URL, fetch the blob or open directly
      try {
        const response = await fetch(fallbackUrl);
        blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
      } catch {
        downloadUrl = fallbackUrl;
      }
    } else {
      throw new Error(`Media asset "${downloadFileName}" could not be located in object storage.`);
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (blob) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
    }
  }
}

export const objectStorage = new ObjectStorageService();

