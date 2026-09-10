/**
 * RadjaOS Native IndexedDB Asset Storage
 * Used for storing RAW 4K / 8K wallpaper images directly on user's device
 * without compression or 5MB localStorage limitations.
 */

const DB_NAME = "radjaos_assets_db";
const DB_VERSION = 1;
const STORE_NAME = "wallpapers";

export async function openWallpaperDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in browser"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredWallpaper {
  id: string;
  blob: Blob;
  fileName: string;
  fileSize: number;
  fileType: string;
  updatedAt: number;
}

export async function saveWallpaperBlob(
  id: string,
  blob: Blob,
  fileName = "custom-wallpaper.raw"
): Promise<void> {
  const db = await openWallpaperDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: StoredWallpaper = {
      id,
      blob,
      fileName,
      fileSize: blob.size,
      fileType: blob.type || "image/png",
      updatedAt: Date.now(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getWallpaperBlob(
  id: string
): Promise<StoredWallpaper | null> {
  const db = await openWallpaperDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result as StoredWallpaper);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteWallpaperBlob(id: string): Promise<void> {
  const db = await openWallpaperDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
