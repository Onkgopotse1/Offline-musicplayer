import React, { useEffect, useState, useRef } from "react";
import './Music.css';
import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";

interface MusicProps {
  files: StoredFile[];
  setFiles: React.Dispatch<React.SetStateAction<StoredFile[]>>;
  saveFile: (file: StoredFile) => void;
  currentMediaId: string | null;
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentMediaType: React.Dispatch<
  React.SetStateAction<"audio" | "video" | null>>;
  addToRecent: (id: string) => void;
}

function MyMusic({
  files,           
  setFiles,
  saveFile,
  currentMediaId,
  setCurrentMediaId,
  setIsPlaying,
  setCurrentMediaType,
  addToRecent
}: MusicProps){
 
 //////// Helper Function /////////////////
    const parseFileName = (file: any) => {
    // Split on the first dash
    const parts = file.name.split("-");
    if (parts.length < 2) {
      // No dash found → fallback
      return { artist: "Unknown Artist", song: file.name };
    }

    const firstPart = parts[0].trim();//
    const secondPart = parts[1].replace(/\.[^/.]+$/, "").trim(); // remove extension

    // Logic: if first part looks like a word/letters, treat as artist
    // if first part looks like numbers, treat as song
    if (/^[A-Za-z]/.test(firstPart)) {
      return { artist: firstPart, song: secondPart };
    } else {
      return { song: firstPart, artist: secondPart };
    }
  };
 ///////🛠️ END Helper Function/////////////////

   //
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

  // Revoke object URLs when component unmounts to free memory
  useEffect(() => {
    return () => {
      Object.values(urlCache.current).forEach(URL.revokeObjectURL);
    };
  }, []);

 ///------------- Helper Function to handle file uploads from the input element---------
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);
 
     //the code below goes through each file selected and saves it to the database
     // ============ Save each file to IndexedDB ============
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

          // When DB is successfully opened, we save the file to the "media" object store
          
           saveFile(fileData);

       };
       // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);
     });
   };
//-----------------------end of file upload handler------------------------


   // Handler for when user clicks play button on a music track
    const handleplay = (id: string) => {
      setCurrentMediaId(id);
      setCurrentMediaType("audio");
      setIsPlaying(true);
      addToRecent(id);
    };
      
    

    return (
    <div className="right-main">
      <div className="topbar">
       <h1>Music Page</h1>

       <div className="upload-section">
        <h2 className="text-xl font-bold mb-2">Upload Media</h2>
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          className="border p-2 rounded"
         />
        </div>
      </div>

      <ErrorBoundary>
      <div className="music-main">
       {/*///////it checks if no file have been uploaded. if no then it display a text/////////////////*/}
              {files.length === 0 && (
          <p className="text-gray-500">No files chosen yet</p>
        )}
        
    {/* ── Column headers ── */}
<div className="music-header">
  <div></div> {/* checkbox */}
  <div></div> {/* play */}
  <div className="header-text">Title</div>
  <div className="header-text">Artist</div>
  <div className="header-text">Album</div>
  <div className="header-text">Genre</div>
  <div className="header-text">Time</div>
</div>

        {files.map((item) => {
         const fileURL = getUrl(item);
         const { artist, song } = parseFileName(item); //Parse artist and song from filename//

         const currentfile = files.find(f => f.id === currentMediaId);

          if (item.type.startsWith("audio/")) {
            return (
              <div key={`${item.id}`} className="horizontal-divs">
                <div className="check-box">
                <input type="checkbox" className="checkbox" />
                </div>
                <div className="play">
                <button onClick={() => handleplay(item.id)} className="play-buttons">
                  ▶
                </button> 
                </div> 
                <div className="song-name">
                <p className="text">{song}</p> 
                </div>
                <div className="artist-name">
                <p className="text">{artist}</p>
                </div>
                <div className="album-name">
                <p className="text">album's name</p>
                </div>
                <div className="genre">
                <p className="text">genre name</p>
                </div>
                <div className="time">
                <p className="text">time</p>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>{/*closing*/}
      </ErrorBoundary>
     </div>

    );
  };
  

export default MyMusic;