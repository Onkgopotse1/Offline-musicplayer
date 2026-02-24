import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
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

  // State holds actual File objects for rendering
  

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
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);
 
     //the code below goes through each file selected and saves it to the database
 
     // ============ ADD THIS: Save each file to IndexedDB ============
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
         const blob = new Blob([item.data], { type: item.type });
         const fileURL = URL.createObjectURL(blob);
        

         const currentfile = files.find(f => f.id === currentMediaId);
          if (item.type.startsWith("video/")) {
            return (
              <div key={item.id} className="cart-div">
                <video
                  ref={item.id === currentMediaId ? videoRef : null}
                  src={fileURL}
                  width="300"
                  className="video"
                />

                <button className="video-play-btn" onClick={() => handleplay(item.id)}>▶</button>
                <p className="text">{item.name}</p>
              </div>
            );
          }

          return null;
        })}
      </div>{/*closing*/}
     </div>


    )
}

export default Video;