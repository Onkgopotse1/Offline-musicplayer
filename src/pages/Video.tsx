import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import "./video.css"
import type { StoredFile } from "../type/media.ts";

interface VideoProps {
  files: StoredFile[];
  setFiles: React.Dispatch<React.SetStateAction<StoredFile[]>>;
  currentMediaId: string | null;
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentMediaType: React.Dispatch<
  React.SetStateAction<"audio" | "video" | null>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function Video({
  files,           
  setFiles,
  currentMediaId,
  setCurrentMediaId,
  setIsPlaying,
  setCurrentMediaType,
  videoRef
  
}: VideoProps) {

  // Add thumbnail state to store generated thumbnails for videos
   const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  
   const urlCache = useRef<Record<string, string>>({});

const getUrl = (item: StoredFile) => {
  if (!urlCache.current[item.id]) {
    const blob = new Blob([item.data], { type: item.type });
    urlCache.current[item.id] = URL.createObjectURL(blob);
  }
  return urlCache.current[item.id];
};


 // ============ Database Setup ============
   useEffect(() => { console.log("useEffect - Load from IndexedDB");
     // Initialize IndexedDB when component loads
     const request: IDBOpenDBRequest = indexedDB.open("MediaDB", 1);
 
     request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
       const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
       // Create storage for files if it doesn't exist
       if (!db.objectStoreNames.contains("media")) {
         db.createObjectStore("media", { keyPath: "id"});
       }
     };
 
     request.onsuccess = () => {console.log("📂 Database opened successfully");
       const db = request.result;
 
        // Load existing files from database when page loads
       const transaction = db.transaction(["media"], "readonly");
       const store = transaction.objectStore("media");
       const getRequest = store.getAll();
 
       getRequest.onsuccess = () => {
         const storedFiles = getRequest.result as StoredFile[];
        //at this point the data is in ArrayBuffer format//
 
         const fileObjects = storedFiles.map((item) => {
         // Create Blob from stored data
 
           const blob = new Blob([item.data], { type: item.type });// Convert stored data from ArrayBuffer back to File objects
           // Create File object from Blob
           return new File([blob], item.name, {
             type: item.type,
             lastModified: item.lastModified,
           });
         });
          
         // Add that fileObject to your existing files state
         if (fileObjects.length > 0) {
           setFiles(storedFiles);
         }
       };
     };
   }, []);  // Empty dependency array = run once on mount
   // ============ END DATABASE SETUP ============


   // Generate thumbnails for video files whenever the files state changes
      useEffect(() => {
        files.forEach(async (file) => {
          if (file.type.startsWith("video/") && !thumbnails[file.id]) {
            const thumb = await generateThumbnail(file);
            setThumbnails(prev => ({ ...prev, [file.id]: thumb }));
          }
        });
      }, [files]); // runs every time files array changes

      useEffect(() => {
  return () => {
    Object.values(urlCache.current).forEach(URL.revokeObjectURL);
  };
}, []);


   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);
 
     //the code below goes through each file selected and saves it to the database
 
     // ============: Save each file to IndexedDB ============
     selectedFiles.forEach((file) => {                    //Loop through selected files//
       const reader = new FileReader();                     //Read file content//
 
       reader.onload = (event: ProgressEvent<FileReader>) => {        //FileReader reads file into memory//
         const fileData: StoredFile = {                                //Prepare file object for database//
           id: crypto.randomUUID(),
           name: file.name,
           type: file.type,
           lastModified: file.lastModified,
           size: file.size,
           data: event.target?.result as ArrayBuffer,  // This is the file content as ArrayBuffer
           uploadedAt: new Date().toISOString(),
         }; // gets saved to indexedDB
          // at this moment this is NOT a File anymore, It’s just plain data (which IndexedDB loves)//
 
        

          // Open the same database and save the data
         const dbRequest: IDBOpenDBRequest = indexedDB.open("MediaDB", 1);
 
         dbRequest.onsuccess = () => {
           const db = dbRequest.result;
           const transaction = db.transaction(["media"], "readwrite");  //Open transaction so we can save the data//
           const store = transaction.objectStore("media");              //Get the object store bcos is where we gonna save our data//
           
           // Store the file data
           store.add(fileData);
           //SAVE TO STATE HERE
           setFiles(prev => [...prev, fileData]);
           
         };
       };

       // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);
       
     });
     // ============ END SAVE TO DATABASE ============
   };
  
    const handleplay = (id: string) => {
      setCurrentMediaId(id);
      setCurrentMediaType("video");
      setIsPlaying(true)
    };


// Helper function to generate thumbnail for a video file
const generateThumbnail = (file: StoredFile): Promise<string> => {
  return new Promise((resolve) => {
    const blob = new Blob([file.data], { type: file.type });
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => { video.currentTime = 1; };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };
  });
};

   return (
      <div className="right-main">

        <div className="topbar">
        <h1>Video Page</h1>

      <div className="upload-section">
        <h2 className="text-xl font-bold mb-2">Upload Media</h2>
        <input
          type="file"
          multiple
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
      </div>

        </div>

     <div className="video-main">{/*openning*/}

              {files.length === 0 && (
          <p className="text-gray-500">No files chosen yet</p>
        )}

{files.map((item) => {
  if (!item.type.startsWith("video/")) return null;

  const isActive = item.id === currentMediaId;
  const url = getUrl(item);

  
  return (
    <div key={item.id} className="cart-div">

      {/* 👇 SWAP: show video when active, thumbnail when not */}
      {isActive ? (
        <video
          ref={videoRef}
          src={url}
          width="300"
          className="video"
          autoPlay
          
        />
      ) : (
        <>
          <img
            src={thumbnails[item.id] || ""}
            width="300"
            className="video"
            alt={item.name}
          />
          <button
            className="video-play-btn"
            onClick={() => handleplay(item.id)}
          >▶</button>
        </>
      )}

      <p className="text">{item.name}</p>
    </div>
  );
})}
        
      </div>{/*closing*/}



     </div>


    )
}

export default Video;