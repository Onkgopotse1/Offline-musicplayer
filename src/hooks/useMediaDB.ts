import { useState, useEffect } from "react";
import type { StoredFile } from "../type/media.ts";

export function useMediaDB() {

const [loaded, setLoaded] = useState(false);

// Store the DB reference to reuse it
const [db, setDb] = useState<IDBDatabase | null>(null);

// ── Open DB + load file handles on mount -----------------------------------

//files starts as empty untill it gets data from setFiles
// this state only hold metadata
  const [files, setFiles] = useState<StoredFile[]>([]);


  useEffect(() => {
    const request = indexedDB.open("MediaDB", 4);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
      // new store for thumbnails — key is file id, value is a jpeg dataURL string
      if (!db.objectStoreNames.contains("thumbnails")) {
        db.createObjectStore("thumbnails", { keyPath: "id" });
      }
      if (event.oldVersion > 0 && event.oldVersion < 4) {
        const store = request.transaction!.objectStore("media");
        store.openCursor().onsuccess = (cursorEvent) => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (!cursor) return;
          const record = cursor.value as StoredFile;
          if (!(record.data instanceof Blob)) {
            cursor.update({ ...record, data: new Blob([record.data as unknown as ArrayBuffer], { type: record.type }) });
          }
          cursor.continue();
        };
      }
    };

    //each file metadata is loaded from DB then to be renderd in UI horizontal-divs 
    // Blob records keep their bytes out of the JavaScript heap until read.
    request.onsuccess = () => {
      const dbInstance = request.result;
      setDb(dbInstance); // Store the DB reference
      const tx = dbInstance.transaction(["media"], "readonly");
      const store = tx.objectStore("media");
      const getAll = store.getAll();

getAll.onsuccess = () => {
  const storedFiles = getAll.result as StoredFile[];
  if (storedFiles.length > 0) setFiles(storedFiles);
  setLoaded(true); // signals that DB read is done whether or not there are files
};
    };
  }, []);

  // Cleanup DB connection on unmount
  useEffect(() => {
    return () => {
      if (db) {
        db.close();
      }
    };
  }, [db]);
//----------------------------------end-----------------------------

  // ── Load a Blob handle for a single file on demand
  const loadFileData = (id: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"));
        return;
      }
      const tx = db.transaction(["media"], "readonly");
      const store = tx.objectStore("media");
      const get = store.get(id);

      get.onsuccess = () => {
        if (!get.result) {
          reject(new Error('File not found'));
          return;
        }
        const record = get.result as StoredFile;
        resolve(record.data instanceof Blob
          ? record.data
          : new Blob([record.data as unknown as ArrayBuffer], { type: record.type }));
      };
      get.onerror = () => reject(get.error);
    });
  };
//------------------end-----------------------------

  // ── Load all saved thumbnails from IndexedDB on startup ──
  // returns a Record<id, dataUrl> so App.tsx can set thumbnails state instantly
  const loadThumbnails = (): Promise<Record<string, string>> => {
    return new Promise((resolve) => {
      if (!db) {
        resolve({});
        return;
      }
      const tx = db.transaction(["thumbnails"], "readonly");
      const getAll = tx.objectStore("thumbnails").getAll();
      getAll.onsuccess = () => {
        const result: Record<string, string> = {};
        for (const entry of getAll.result) {
          result[entry.id] = entry.dataUrl;
        }
        resolve(result);
      };
      getAll.onerror = () => resolve({});
    });
  };
//------------------end-----------------------------


  // ── Save a generated thumbnail to IndexedDB so we never regenerate it again ──
  const saveThumbnail = (id: string, dataUrl: string) => {
    if (!db) return;
    const tx = db.transaction(["thumbnails"], "readwrite");
    tx.objectStore("thumbnails").put({ id, dataUrl });
  };
//------------------end-----------------------------

//// this handles file from file upload ----------------------------------------------------
  // ── saveFile give it's new data that it got from fileData and then give it to (file)
  const saveFile = (file: StoredFile) => {
    // Update state immediately
    setFiles(prev => [...prev, file]);

    if (!db) return;

    const tx = db.transaction(["media"], "readwrite");
    tx.objectStore("media").add(file);
  };
//----------------------------------end--------------------------------

  return { files, setFiles, saveFile, loadFileData, loadThumbnails, saveThumbnail, loaded };

}