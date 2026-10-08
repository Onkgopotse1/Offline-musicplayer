import React, { useEffect, useState, useRef } from "react";
import "../styles/local styles/Video.css"
import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import { sortFiles } from "../utils/mediaUtils.ts";

import { useMedia } from "../context/MediaContext.tsx";
import { usePlayer } from "../context/MediaContext.tsx";

interface VideoProps {
  thumbnails: Record<string, string>;
  setThumbnails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

function Video({ thumbnails, setThumbnails }: VideoProps) {
  const { files, saveFile, loadFileData, saveThumbnail } = useMedia();
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, currentMediaType, videoRef, setQueue } = usePlayer();

//sub menu
const [sortBy, setSortBy] = useState("date");

   const [isVideoLoading, setIsVideoLoading] = useState(false);
   const [readError, setReadError] = useState<string | null>(null);
   const [showOverlay, setShowOverlay] = useState(false);
   const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const processedIds = useRef<Set<string>>(new Set()); // Track which files have been queued for thumbnail generation
/////

   useEffect(() => {
     if (currentMediaType === "video" && currentMediaId) setIsVideoLoading(true);
   }, [currentMediaId, currentMediaType]);

   const makeThumbnail = (file: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          URL.revokeObjectURL(url);
          video.removeAttribute("src");
          video.load();
        };
        const timer = setTimeout(() => {
          done();
          reject(new Error("Video thumbnail timed out"));
        }, 8000);
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.onerror = () => {
          done();
          reject(new Error("Video cannot be decoded"));
        };
        video.onloadedmetadata = () => { video.currentTime = Math.min(1, video.duration / 2); };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 180;
          canvas.getContext("2d")?.drawImage(video, 0, 0, 320, 180);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
          done();
          resolve(thumbnail);
        };
        video.src = url;
      });
    };

    //this gets the id of a file then tells generateThumbnails to create thumbnails
    //after that it save the thumbnails to setThumbnails. Generate thumbnails one at a time using loadFileData in useMediaDB.ts
    useEffect(() => {
      const generate = async () => {
        for (const file of files) {
          if (file.type.startsWith("video/") && !thumbnails[file.id] && !processedIds.current.has(file.id)) {
            console.log(`Generating thumbnail for video: ${file.id}`);
            // Mark this ID as queued to prevent duplicate processing
            processedIds.current.add(file.id);
            
           //loadFileData has an id of a file from indexedDB which we use to generate a thumbnaing of the id's file
            try {
              const blob = await loadFileData(file.id);
              const thumb = await makeThumbnail(blob);
              setThumbnails(prev => ({ ...prev, [file.id]: thumb }));
              saveThumbnail(file.id, thumb);
            } catch {
              continue;
            }
          }
        } 
      };
      generate();
    }, [files, loadFileData, saveThumbnail]);
////////////////end

///------------- Helper Function to handle file uploads from the input element----------
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);
     setReadError(null);

     selectedFiles.forEach(async (file) => {
       const fileData: StoredFile = {
         id: crypto.randomUUID(),
         name: file.name,
         type: file.type,
         lastModified: file.lastModified,
         size: file.size,
         data: file,
         uploadedAt: new Date().toISOString(),
       };
       processedIds.current.add(fileData.id);
       saveFile(fileData);
       try {
         const thumbnail = await makeThumbnail(file);
         setThumbnails(prev => ({ ...prev, [fileData.id]: thumbnail }));
         saveThumbnail(fileData.id, thumbnail);
       } catch {
         // The video remains playable if thumbnail decoding fails.
       }
     });
   };
  //---------------------------end of file upload handler------------------------

  
// Handler for when user clicks play button on a video thumbnail-----------
const handleplay = (item: StoredFile) => {
    const orderedIds = sortFiles(files, sortBy)
  .filter(f => f.type.startsWith("video/"))
  .map(f => f.id);

  setQueue(orderedIds);
  setIsVideoLoading(true);
  setCurrentMediaId(item.id);
  setCurrentMediaType("video");
  setIsPlaying(true);
};

const closePlayer = () => {
  setIsVideoLoading(false);
  setCurrentMediaId(null);
  setIsPlaying(false);
};
//--------------

const handlePlayerMouseMove = () => {
  setShowOverlay(true);
  if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  hideTimerRef.current = setTimeout(() => setShowOverlay(false), 3000);
};

const handlePlayerMouseLeave = () => {
  if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  hideTimerRef.current = setTimeout(() => setShowOverlay(false), 800);
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
      <button className="sub-menu-shuffle-btn" >
        ⇄ Shuffle and play
      </button>
    </div>
    <div className="sub-menu-right">
      <div className="sub-menu-sort">
        <span>Sort by:</span>
        <select className="sub-menu-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Date Modified</option>
          <option value="az">A-Z</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="year">Release Year</option>
        </select>
      </div>
    </div>
  </div>
</div>

    <ErrorBoundary>

      {readError && (
        <div role="alert" aria-live="assertive" style={{ marginBottom: "12px", color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "6px" }}>
          {readError}
        </div>
      )}

      {/* ── Thumbnail grid — always visible ── */}
      <div className={`video-main ${currentMediaType === "video" && currentMediaId ? 'video-player-active' : ''}`}>
        {/* ── Big video player panel — shown when a video is playing ── */}
        {currentMediaType === "video" && currentMediaId && (
          <div
            className="video-player-panel"
            onMouseMove={handlePlayerMouseMove}
            onMouseLeave={handlePlayerMouseLeave}
          >
            <div className={`video-overlay${showOverlay ? " video-overlay--visible" : ""}`}>
              <p className="video-overlay-title">{files.find(file => file.id === currentMediaId)?.name}</p>
              <button className="video-player-close" onClick={closePlayer}>✕</button>
            </div>
            <video
              ref={videoRef}
              className="video-player-screen"
              autoPlay
              onLoadedData={() => setIsVideoLoading(false)}
              onError={() => setIsVideoLoading(false)}
            />
            {isVideoLoading && <p role="status">Loading video...</p>}
          </div>
        )}
        
        {files.length === 0 && (
          <p className="text-gray-500">No files chosen yet</p>
        )}

        {sortFiles(files.filter(item => item.type.startsWith("video/")), sortBy).map((item) => {
          return (
            <div key={item.id} className={`cart-div ${item.id === currentMediaId ? "video-active" : ""} `} data-testid={`cart-item-${item.id}`}>
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