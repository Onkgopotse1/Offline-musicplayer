import React, { useEffect, useState, useRef, useContext, createContext,  } from "react";
import '../styles/local styles/Music.css';
import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import PlaylistMusic from "./PlaylistMusic.tsx";
import { parseFileName, sortFiles, useUrlCache, loadPlaylists, formatDuration } from "../utils/mediaUtils.ts";

import { useMedia } from "../context/MediaContext.tsx";
import { usePlayer } from "../context/MediaContext.tsx";

function DurationCell({ duration }: { duration: number | undefined }) {
  return <>{formatDuration(duration)}</>;
}


function MyMusic() {
  const { files, setFiles, saveFile, loadFileData } = useMedia();
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, addToRecent, setQueue } = usePlayer();
  
//sub-menu
const [sortBy, setSortBy] = useState("date");

//a state for if a checkbox is clicked
  const [isChecked, setIsChecked] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const getUrl = useUrlCache();

 ///------------- Helper Function to handle file uploads from the input element---------
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFiles = Array.from(e.target.files ?? []);
 
     selectedFiles.forEach((file) => {                    
       const reader = new FileReader();                     
 
      // Read file as ArrayBuffer
       reader.readAsArrayBuffer(file);

       reader.onload = (event: ProgressEvent<FileReader>) => {        //FileReader reads file into memory//
         const arrayBuffer = event.target?.result as ArrayBuffer;
         
         // Create a temporary blob to get duration
         const blob = new Blob([arrayBuffer], { type: file.type });
         const url = URL.createObjectURL(blob);
         const audio = new Audio(url);
         
         audio.onloadedmetadata = () => {
           const fileData: StoredFile = {                                //Prepare file object for database//
             id: crypto.randomUUID(),
             name: file.name,
             type: file.type,
             lastModified: file.lastModified,
             size: file.size,
             data: arrayBuffer,  //data is the actual audio/vudeo/image/text
             uploadedAt: new Date().toISOString(), //is just a timestamp it tells u when u saved the file
             duration: audio.duration, // store duration in seconds
           }; // gets saved to indexedDB

            // When DB is successfully opened, we save the file to the "media" object store
            saveFile(fileData); //all files that u selected gets saved to saveFile 
            URL.revokeObjectURL(url);
         };
       };

     });
   };
//-----------------------end of file upload handler------------------------

 // Handler for when user clicks "Shuffle and play" button
const { /* ... */ setIsShuffle } = usePlayer();

const handleShufflePlay = () => {
  const audioFiles = sortFiles(files, sortBy).filter(f => f.type.startsWith("audio/"));
  if (audioFiles.length === 0) return;

  const orderedIds = audioFiles.map(f => f.id);
  setQueue(orderedIds);
  setIsShuffle(true);

  const randomIndex = Math.floor(Math.random() * orderedIds.length);
  const randomId = orderedIds[randomIndex]!; // non-null assertion – safe because length > 0
  setCurrentMediaId(randomId);
  setCurrentMediaType("audio");
  setIsPlaying(true);
  addToRecent(randomId);
};
//==============================

   // Handler for when user clicks play button on a music track
    const handleplay = (id: string) => {
      const orderedIds = sortFiles(files, sortBy)
      .filter(f => f.type.startsWith("audio/"))
      .map(f => f.id);

      setQueue(orderedIds);
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

// ADD below toggleCheckbox------------------------
// Save checked song IDs into the selected playlist in localStorage
const addToPlaylist = (playlistName: string) => {
  if (checkedIds.length === 0 || !playlistName) return;

  const key = `playlist_songs_${playlistName}`;
  const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");

  // merge — avoid duplicates
  const merged = Array.from(new Set([...existing, ...checkedIds]));
  localStorage.setItem(key, JSON.stringify(merged));

  // clear checkboxes after adding
  setCheckedIds([]);
};
//*---------------------- 

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

 {/* "Add to" dropdown — lists all saved playlists as options */}
  {checkedIds.length > 0 ? (
  <div className="sub-menu">
    <div className="sub-menu-left">
     <input type="checkbox" />
     <p>0 song selected</p>
     <button>Play</button>
     <button>Play next</button>
      <div className="sub-menu-sort">
        <span className="sub-menu-sort-label">Add to:</span>
        <div className="sub-menu-select-wrapper">
          <select
            className="sub-menu-select"
            defaultValue=""
            onChange={e => {
              addToPlaylist(e.target.value);
              e.target.value = ""; // reset after selecting
            }}
          >
            <option value="" disabled>playlist</option>
            {loadPlaylists().map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

    </div>
  </div>
  ) : (

  <div className="sub-menu">
    <div className="sub-menu-left">
      <button className="sub-menu-shuffle-btn" onClick={handleShufflePlay}>
       ⇄ Shuffle and play
     </button>
    </div>
    <div className="sub-menu-right">
      <div className="sub-menu-sort">
        <span>Sort by:</span>
        <select
          className="sub-menu-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date">Date Modified</option>
          <option value="az">A-Z</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="year">Release Year</option>
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

        {sortFiles(files, sortBy).map((item) => {
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
                 <p className="text"><DurationCell duration={item.duration} /></p>
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