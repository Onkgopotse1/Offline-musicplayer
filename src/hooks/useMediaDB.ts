import { useState, useEffect } from "react";
import type { StoredFile } from "../type/media.ts";

export function useMediaDB() {

  const [files, setFiles] = useState<StoredFile[]>([]);

  // ── Open DB + load only metadata on mount (no ArrayBuffers) ──
  useEffect(() => {
    const request = indexedDB.open("MediaDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
    };

    // Load only metadata — skip the heavy data field
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readonly");
      const store = tx.objectStore("media");
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const storedFiles = getAll.result as StoredFile[];
        if (storedFiles.length > 0) {
          // Store metadata only — data is an empty ArrayBuffer as placeholder
          // actual data is fetched on demand in loadFileData()
          const metaOnly = storedFiles.map(f => ({
            ...f,
            data: new ArrayBuffer(0), // placeholder — not loaded yet
          }));
          setFiles(metaOnly);
        }
      };
    };
  }, []);

  // ── Load full data for a single file on demand ──
  // Called by Bottom.tsx when a file is actually played
  const loadFileData = (id: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MediaDB", 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(["media"], "readonly");
        const store = tx.objectStore("media");
        const get = store.get(id);

        get.onsuccess = () => {
          resolve(get.result.data as ArrayBuffer);
        };
        get.onerror = () => reject(get.error);
      };
    });
  };

  // ── Save a new file ──
  const saveFile = (file: StoredFile) => {
    // Update state immediately with the original file
    setFiles(prev => [...prev, file]);

    // Send a COPY to IndexedDB so the ArrayBuffer isn't transferred/detached
    const fileCopy = { ...file, data: file.data.slice(0) };

    const request = indexedDB.open("MediaDB", 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readwrite");
      tx.objectStore("media").add(fileCopy);
    };
  };

  return { files, setFiles, saveFile, loadFileData };
}