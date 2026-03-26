import { useParams, useNavigate, } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import './Playlist.css';
import type { StoredFile } from "../type/media.ts";
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



function PlaylistMusic() {
  const { files, setFiles, saveFile, loadFileData } = useMedia();
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, addToRecent } = usePlayer();

  //sub menu
const [sortBy, setSortBy] = useState("date");

//this state holds only audios from (file prop)
const [visibleSongs, setVisibleSongs] = useState<StoredFile[]>([]);

  const { name } = useParams();
  const navigate = useNavigate();
  const playlistName = decodeURIComponent(name ?? "");


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
 
     const handleplay = (id: string) => {
      setCurrentMediaId(id);
      setCurrentMediaType("audio");
      setIsPlaying(true);
      addToRecent(id);
    };

const saveToUserAudio = (audioFiles: StoredFile[]) => {
  const request = indexedDB.open("MediaDB", 3);
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("userAudio", "readwrite");
    const store = tx.objectStore("userAudio");
    audioFiles.forEach((file) => {
      store.put(file); // ✅ put = insert or update
    });
    tx.oncomplete = () => {
      console.log("Audio saved to userAudio store");
    };
    tx.onerror = () => {
      console.error("Error saving audio");
    };
  };
};

 //this opens (files prop) to get audios
const handleAddSongs = () => {
  const audioFiles = files.filter(file =>
    file.type.startsWith("audio/")
  );

  //setVisibleSongs(audioFiles);

  // ✅ Persist to IndexedDB
  saveToUserAudio(audioFiles);
};



  return (
    <div className="right-main">
<div className="topbar">
  <div className="topbar-row">
    <div className="playlist-detail-topbar-left">
      <button className="playlist-back-btn" onClick={() => navigate('/playlist')}>←</button>
      <h1 className="topbar-h1">{playlistName}</h1>
    </div>
    <button className="upload-label" onClick={handleAddSongs}>+ Add Songs</button>
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
          <option value="artist">Artist</option>
        </select>
      </div>
    </div>
  </div>
</div>

      <div className="playlist-detail-main">
        {/* you'll wire real song list here later *
        <p className="playlist-empty">No songs in this playlist yet</p>
        */}

        {visibleSongs.map((item) => {
         const fileURL = getUrl(item);
         const { artist, song } = parseFileName(item); //Parse artist and song from filename//

         const currentfile = files.find(f => f.id === currentMediaId);

          if (item.type.startsWith("audio/")) {
            return (
              <div key={`${item.id}`} className={`horizontal-divs ${item.id === currentMediaId ? "playing" : ""}`}>
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
                 <p className="text"><DurationCell fileId={item.id} fileType={item.type} loadFileData={loadFileData} /></p>
                </div>
              </div>
            );
          }

          return null;
        })}

      </div>
    </div>
  );
}

export default PlaylistMusic;