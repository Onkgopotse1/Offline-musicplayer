import { useState, useEffect } from "react";
import type { StoredFile } from "../type/media.ts";

export function useMediaDB() {

const [loaded, setLoaded] = useState(false);

// ── Open DB + load only metadata on mount (no ArrayBuffers)-----------------------------------

//files starts as empty untill it gets data from setFiles
// this state only hold metadata
  const [files, setFiles] = useState<StoredFile[]>([]);


  useEffect(() => {
    const request = indexedDB.open("MediaDB", 3); // 

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
      // new store for thumbnails — key is file id, value is a jpeg dataURL string
      if (!db.objectStoreNames.contains("thumbnails")) {
        db.createObjectStore("thumbnails", { keyPath: "id" });
      }
    };

    //each file metadata is loaded from DB then to be renderd in UI horizontal-divs 
    // Load only metadata — skip the heavy data field
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readonly");
      const store = tx.objectStore("media");
      const getAll = store.getAll();

getAll.onsuccess = () => {
  const storedFiles = getAll.result as StoredFile[];
  if (storedFiles.length > 0) {
    const metaOnly = storedFiles.map(f => ({
      ...f,
      data: new ArrayBuffer(0), // placeholder — not loaded yet
    }));
    setFiles(metaOnly); //this updates files with new metadata of the audio
  }
  setLoaded(true); // signals that DB read is done whether or not there are files
};
    };
  }, []);
//----------------------------------end-----------------------------

  //so at the end loadFileData give us an ArrayBuffer thats all-------------
  // ── Load ArrayBuffer for a single file on demand 
  const loadFileData = (id: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MediaDB", 3);
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
//------------------end-----------------------------

  // ── Load all saved thumbnails from IndexedDB on startup ──
  // returns a Record<id, dataUrl> so App.tsx can set thumbnails state instantly
  const loadThumbnails = (): Promise<Record<string, string>> => {
    return new Promise((resolve) => {
      const request = indexedDB.open("MediaDB", 3);
      request.onsuccess = () => {
        const db = request.result;
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
      };
    });
  };
//------------------end-----------------------------


  // ── Save a generated thumbnail to IndexedDB so we never regenerate it again ──
  const saveThumbnail = (id: string, dataUrl: string) => {
    const request = indexedDB.open("MediaDB", 3);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["thumbnails"], "readwrite");
      tx.objectStore("thumbnails").put({ id, dataUrl });
    };
  };
//------------------end-----------------------------

//// this handles file from file upload ----------------------------------------------------
  // ── saveFile give it's new data that it got from fileData and then give it to (file)
  const saveFile = (file: StoredFile) => {
    // Update state immediately
    setFiles(prev => [...prev, file]);

    // Send a COPY to IndexedDB so the ArrayBuffer isn't transferred/detached
    const fileCopy = { ...file, data: file.data.slice(0) };

    const request = indexedDB.open("MediaDB", 3);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readwrite");
      tx.objectStore("media").add(fileCopy);
    };
  };
//----------------------------------end--------------------------------

  return { files, setFiles, saveFile, loadFileData, loadThumbnails, saveThumbnail, loaded };

}