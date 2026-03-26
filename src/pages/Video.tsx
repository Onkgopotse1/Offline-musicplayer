import React, { useEffect, useState, useRef } from "react";
import "./video.css"
import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";

import { useMedia } from "../MediaContext/MediaContext.tsx";
import { usePlayer } from "../MediaContext/MediaContext.tsx";

interface VideoProps {
  thumbnails: Record<string, string>;
  setThumbnails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

function Video({ thumbnails, setThumbnails }: VideoProps) {
  const { files, setFiles, saveFile, loadFileData, saveThumbnail } = useMedia();
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, videoRef } = usePlayer();

  //sub menu
const [sortBy, setSortBy] = useState("date");

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
   const [activeVideoName, setActiveVideoName] = useState<string>("");

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
/////

   // Generate thumbnails for video files whenever the files state changes
    const generateThumbnails = (file: StoredFile, data: ArrayBuffer): Promise<string> => {
      return new Promise((resolve) => {
        const blob = new Blob([data], { type: file.type });
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
          canvas.getContext("2d")?.drawImage(video, 0, 0, 320, 180);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
          URL.revokeObjectURL(url);
          resolve(thumbnail);
        };
      });
    };

    //this gets the id of a file then tells generateThumbnails to create thumbnails
    //after that it save the thumbnails to setThumbnails. Generate thumbnails one at a time using loadFileData in useMediaDB.ts
    useEffect(() => {
      const generate = async () => {
        for (const file of files) {
          if (file.type.startsWith("video/") && !thumbnails[file.id]) {
           //loadFileData has an id of a file from indexedDB which we use to generate a thumbnaing of the id's file
            const data = await loadFileData(file.id); //it waits for a id's of a file(video)
            const thumb = await generateThumbnails(file, data); //this has generateThumbnail which creates thumbnails 
            const sender = setThumbnails(prev => ({ ...prev, [file.id]: thumb })); //then save thumbnail to state
            saveThumbnail(file.id, thumb); //save to indexedDB
          }
        } 
      };
      generate();
    }, [files]);
  ////////////////end

    // Revoke object URLs when component unmounts to free memory
      useEffect(() => {
        return () => {
          Object.values(urlCache.current).forEach(URL.revokeObjectURL);
        };
      }, []);

///------------- Helper Function to handle file uploads from the input element----------
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);

     selectedFiles.forEach((file) => {                    //Loop through selected files//
       const reader = new FileReader();                     //Read file content//
 
       reader.onload = (event: ProgressEvent<FileReader>) => {        //FileReader reads file into memory//
         const fileData: StoredFile = {                                //Prepare file object for database//
           id: crypto.randomUUID(),
           name: file.name,
           type: file.type,
           lastModified: file.lastModified,
           size: file.size,
           data: event.target?.result as ArrayBuffer,  //data is the actual audio/vudeo/image/text
           uploadedAt: new Date().toISOString(),     //is just a timestamp it tells u when u saved the file
         }; 

        saveFile(fileData); //all files gets saved to saveFile
       };

       // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);
     });
   };
  //---------------------------end of file upload handler------------------------

  
// Handler for when user clicks play button on a video thumbnail-----------
const handleplay = (item: StoredFile) => {
  setCurrentMediaId(item.id);
  setCurrentMediaType("video");
  setIsPlaying(true);

  // load real data then open the big player
  loadFileData(item.id).then((data) => {
    const blob = new Blob([data], { type: item.type });
    const url = URL.createObjectURL(blob);
    if (activeVideoUrl) URL.revokeObjectURL(activeVideoUrl); // clean up previous
    setActiveVideoUrl(url);
    setActiveVideoName(item.name);
  });
};

const closePlayer = () => {
  if (activeVideoUrl) URL.revokeObjectURL(activeVideoUrl);
  setActiveVideoUrl(null);
  setActiveVideoName("");
  setCurrentMediaId(null);
  setIsPlaying(false);
};
//--------------

// Helper function to generate thumbnail for a video file---------
const generateThumbnail = (file: StoredFile): Promise<string> => {
  return new Promise((resolve) => {
  //variable blob converts arraybuffer data to file type that can be used by html audio element, ---
  //then variable url creates a address of where to get variable blob data
    const blob = new Blob([file.data], { type: file.type });
    const url = URL.createObjectURL(blob);
    //--------------
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
  <div className="right-main" style={{ position: "relative" }}>


<div className="topbar">
  <div className="topbar-row">
    <h1 className="topbar-h1">Video</h1>
    <label className="upload-label">
      + Add Videos
      <input type="file" multiple accept="video/*" onChange={handleFileChange} style={{ display: "none" }} />
    </label>
  </div>

  <div className="sub-menu">
    <div className="sub-menu-left">
      <button className="sub-menu-shuffle-btn">⇄ Shuffle and play</button>
    </div>
    <div className="sub-menu-right">
      <div className="sub-menu-sort">
        <span>Sort by:</span>
        <select className="sub-menu-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Date added</option>
          <option value="title">Title</option>
        </select>
      </div>
    </div>
  </div>
</div>

    <ErrorBoundary>

      {/* ── Big video player panel — shown when a video is playing ── */}
      {activeVideoUrl && (
        <div className="video-player-panel">
          <div className="video-player-header">
            <p className="video-player-title">{activeVideoName}</p>
            <button className="video-player-close" onClick={closePlayer}>✕</button>
          </div>
          <video
            ref={videoRef}
            src={activeVideoUrl}
            className="video-player-screen"
            autoPlay
            
          />
        </div>
      )}

      {/* ── Thumbnail grid — always visible ── */}
      <div className="video-main">
        {files.length === 0 && (
          <p className="text-gray-500">No files chosen yet</p>
        )}

        {files.map((item) => {
          if (!item.type.startsWith("video/")) return null;
          return (
            <div key={item.id} className={`cart-div ${item.id === currentMediaId ? "video-active" : ""}`}>
              <div className="video-thumb-wrapper">
                <img
                  src={thumbnails[item.id] || ""}
                  className="video"
                  alt={item.name}
                />
                <button
                  className="video-play-btn"
                  onClick={() => handleplay(item)}
                >▶</button>
              </div>
              <div className="video-card-info">
                <p className="video-card-title">{item.name}</p>
              </div>
            </div>
          );
        })}
      </div>

    </ErrorBoundary>
  </div>
);
}

export default Video;