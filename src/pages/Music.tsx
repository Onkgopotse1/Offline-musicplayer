import React, { useEffect, useState, useRef, useContext, createContext } from "react";
import './Music.css';
import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import PlaylistMusic from "./PlaylistMusic.tsx";

import { useMedia } from "../MediaContext/MediaContext.tsx";
import { usePlayer } from "../MediaContext/MediaContext.tsx";

// Gets the duration of an audio file from its URL
const useDuration = (url: string) => {
  const [duration, setDuration] = useState("--:--");

  useEffect(() => {
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60).toString().padStart(2, "0");
      setDuration(`${mins}:${secs}`);
    };
  }, [url]);

  return duration;
};

function DurationCell({ fileId, fileType, loadFileData }: {
  fileId: string;
  fileType: string;
  loadFileData: (id: string) => Promise<ArrayBuffer>;
}) {
  const [duration, setDuration] = useState("--:--");

  useEffect(() => {
    loadFileData(fileId).then((data) => {
      const blob = new Blob([data], { type: fileType });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60).toString().padStart(2, "0");
        setDuration(`${mins}:${secs}`);
        URL.revokeObjectURL(url);
      };
    });
  }, [fileId]);

  return <>{duration}</>;
}


function MyMusic() {
  const { files, setFiles, saveFile, loadFileData } = useMedia();
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, addToRecent } = usePlayer();
 
//sub-menu
const [sortBy, setSortBy] = useState("date");

//a state for if a checkbox is clicked
  const [isChecked, setIsChecked] = useState(false);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);


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
 
     selectedFiles.forEach((file) => {                    //Loop through selected files//
       const reader = new FileReader();                     //Read file content//
 
      // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);

       reader.onload = (event: ProgressEvent<FileReader>) => {        //FileReader reads file into memory//
         const fileData: StoredFile = {                                //Prepare file object for database//
           id: crypto.randomUUID(),
           name: file.name,
           type: file.type,
           lastModified: file.lastModified,
           size: file.size,
           data: event.target?.result as ArrayBuffer,  //data is the actual audio/vudeo/image/text
           uploadedAt: new Date().toISOString(), //is just a timestamp it tells u when u saved the file
         }; // gets saved to indexedDB

          // When DB is successfully opened, we save the file to the "media" object store
          
           saveFile(fileData); //all files that u selected gets saved to saveFile 
       };

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
  
  // handler for checkbox: user check the box then display a second sub-menu
  const toggleCheckbox = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  



  return (
    <div className="right-main">
    <div className="topbar">
  <div className="topbar-row">
    <h1 className="topbar-h1">Music</h1>
    <label className="upload-label">
      + Add Music
      <input type="file" multiple accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />
    </label>
  </div>

  {checkedIds.length > 0 ? (
  <div className="sub-menu">
    <div className="sub-menu-left">
     <input type="checkbox" />
     <p>0 song selected</p>
     <button>Play</button>
     <button>Play next</button>
     <button>Add to</button>
    </div>
  </div>
  ) : (

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
          <option value="artist">Artist</option>
        </select>
      </div>
    </div>
  </div>
  )}

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
              <div key={`${item.id}`} className={`horizontal-divs ${item.id === currentMediaId ? "playing" : ""}`}>
                <div className="check-box">
                <input type="checkbox" className="checkbox" 
                  checked={checkedIds.includes(item.id)}
                  onChange={() => toggleCheckbox(item.id)}
                />
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
                 <p className="text"><DurationCell fileId={item.id} fileType={item.type} loadFileData={loadFileData} /></p>
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