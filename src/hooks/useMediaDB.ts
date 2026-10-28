import { useState, useEffect, useCallback } from "react";
import type { StoredFile } from "../type/media.ts";

export function useMediaDB() {

const [loaded, setLoaded] = useState(false);
const [databaseError, setDatabaseError] = useState<string | null>(null);

// Store the DB reference to reuse it
const [db, setDb] = useState<IDBDatabase | null>(null);

// ── Open DB + load file handles on mount -----------------------------------

//files starts as empty untill it gets data from setFiles
// this state only hold metadata
  const [files, setFiles] = useState<StoredFile[]>([]);


  useEffect(() => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open("MediaDB", 6);
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : "Unable to open the media database.");
      setLoaded(true);
      return;
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
      // new store for thumbnails — key is file id, value is a jpeg dataURL string
      if (!db.objectStoreNames.contains("thumbnails")) {
        db.createObjectStore("thumbnails", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("userAudio")) {
        db.createObjectStore("userAudio", { keyPath: "id" });
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
      setDatabaseError(null);
      try {
        const tx = dbInstance.transaction(["media"], "readonly");
        const getAll = tx.objectStore("media").getAll();

        getAll.onsuccess = () => {
          setFiles(getAll.result as StoredFile[]);
          setLoaded(true);
        };
        getAll.onerror = () => {
          setDatabaseError(getAll.error?.message ?? "Unable to read media from the database.");
          setLoaded(true);
        };
      } catch (error) {
        setDatabaseError(error instanceof Error ? error.message : "Unable to read media from the database.");
        setLoaded(true);
      }
    };
    request.onerror = () => {
      setDatabaseError(request.error?.message ?? "Unable to open the media database.");
      setLoaded(true);
    };
    request.onblocked = () => {
      setDatabaseError("The media database is blocked by another open app window. Close the other window and reload.");
      setLoaded(true);
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
        const data = record.data as unknown;
        if (data instanceof Blob) {
          resolve(data);
        } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          resolve(new Blob([data as BlobPart], { type: record.type }));
        } else {
          reject(new Error(`Media data for "${record.name}" is missing or invalid. Re-import this file to restore playback.`));
        }
      };
      get.onerror = () => reject(get.error);
    });
  };
//------------------end-----------------------------

  // ── Load all saved thumbnails from IndexedDB on startup ──
  // returns a Record<id, dataUrl> so App.tsx can set thumbnails state instantly
  const loadThumbnails = useCallback((): Promise<Record<string, string>> => {
    return new Promise((resolve) => {
      if (!db) {
        resolve({});
        return;
      }
      try {
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
      } catch {
        resolve({});
      }
    });
  }, [db]);
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

  return { files, setFiles, saveFile, loadFileData, loadThumbnails, saveThumbnail, loaded, databaseError };

}