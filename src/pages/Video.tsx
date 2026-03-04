import React, { useEffect, useState, useRef } from "react";
import "./video.css"
import type { StoredFile } from "../type/media.ts";

interface VideoProps {
  files: StoredFile[];
  setFiles: React.Dispatch<React.SetStateAction<StoredFile[]>>;
  saveFile: (file: StoredFile) => void;
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
  videoRef,
  saveFile
}: VideoProps) {

  // Add thumbnail state to store generated thumbnails for videos
   const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  
   const urlCache = useRef<Record<string, string>>({});

   // Helper function to get object URL for a file, with caching to avoid regenerating URLs
   // This is important for performance, especially when we have many files or large videos
    const getUrl = (item: StoredFile) => {
      if (!urlCache.current[item.id]) {
        const blob = new Blob([item.data], { type: item.type });
        urlCache.current[item.id] = URL.createObjectURL(blob);
      }
      return urlCache.current[item.id];
    };

   // Generate thumbnails for video files whenever the files state changes
      useEffect(() => {
        files.forEach(async (file) => {
          if (file.type.startsWith("video/") && !thumbnails[file.id]) {
            const thumb = await generateThumbnail(file);
            setThumbnails(prev => ({ ...prev, [file.id]: thumb }));
          }
        });
      }, [files]);

    // Revoke object URLs when component unmounts to free memory
    useEffect(() => {
      return () => {
        Object.values(urlCache.current).forEach(URL.revokeObjectURL);
      };
    }, []);

///------------- Helper Function to handle file uploads from the input element----------
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
           data: event.target?.result as ArrayBuffer,  
           uploadedAt: new Date().toISOString(),                     // gets saved to indexedDB
         }; 
          
         const dbRequest: IDBOpenDBRequest = indexedDB.open("MediaDB", 1); // Open the database

       // When DB is successfully opened, we save the file to the "media" object store
        reader.readAsArrayBuffer(file);
       };

       // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);
     });
   };
  //---------------------------end of file upload handler------------------------

// Handler for when user clicks play button on a video thumbnail
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

      {/* show video when active, thumbnail when not */}
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