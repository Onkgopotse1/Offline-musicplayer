import { useState, useEffect } from "react";
import type { StoredFile } from "../type/media.ts";

export function useMediaDB() {

  const [files, setFiles] = useState<StoredFile[]>([]);

  // ── Open DB + load all files once on mount ──
  useEffect(() => {
    const request = indexedDB.open("MediaDB", 1); //name of the database and version number

//// If the database doesn't exist or version is upgraded, this event will fire
// this code creates an object store (like a table) named "media" with "id" as the primary key
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if 
      (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
    };

    // When DB is successfully opened, we read all stored files and put them in state so UI can display them
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readonly");
      const store = tx.objectStore("media");
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const storedFiles = getAll.result as StoredFile[];
        if (storedFiles.length > 0) {
          setFiles(storedFiles); // load files into state existing files in DB into state
        }
      };
    };
  }, []);// runs only once when component mounts
///////////////////end

  /// Helper function to save a new single file to IndexedDB and update state
  /// This function is called from the Music and Video pages when user uploads new media
  const saveFile = (file: StoredFile) => {
    const request = indexedDB.open("MediaDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["media"], "readwrite");
      const store = tx.objectStore("media");
      store.add(file);
    };

    setFiles(prev => [...prev, file]);
  };
//////////////end


  // We return the files state and the saveFile function so that other components can use them
  return { files, setFiles, saveFile };
}