import { useParams, useNavigate, } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import '../styles/local styles/Playlist.css';
import type { StoredFile } from "../type/media.ts";
import { parseFileName, sortFiles, useUrlCache } from "../utils/mediaUtils.ts";
import { useMedia } from "../context/MediaContext.tsx";
import { usePlayer } from "../context/MediaContext.tsx";
import SongList from './SongList.tsx';


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
  const { currentMediaId, setCurrentMediaId, setIsPlaying, setCurrentMediaType, addToRecent, setQueue } = usePlayer();
  const [popUpOpen, setPopUpOpen] = useState(false);
  //sub menu
const [sortBy, setSortBy] = useState("date");

//this state holds only audios from (file prop)
const [visibleSongs, setVisibleSongs] = useState<StoredFile[]>([]);


  const { name } = useParams();
  const navigate = useNavigate();
  const playlistName = decodeURIComponent(name ?? "");


  

  //
  const getUrl = useUrlCache();
 
     const handleplay = (id: string) => {
    const orderedIds = sortFiles(visibleSongs, sortBy).map(f => f.id);

      setQueue(orderedIds);
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

    };
    tx.onerror = () => {

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



//a state for if a checkbox is clicked
  const [isChecked, setIsChecked] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // handler for checkbox: user check the box then display a second sub-menu
  const toggleCheckbox = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
//----------------------------------------------------------

//-----------------------------delete songs from playlist-----------------------------
// Delete Handler--
const handleDelete = () => {
  if (checkedIds.length === 0) return;

  const key = `playlist_songs_${playlistName}`;

  // Get current IDs from localStorage
  const savedIds: string[] = JSON.parse(
    localStorage.getItem(key) ?? "[]"
  );

  // Remove checked IDs
  const updatedIds = savedIds.filter(
    id => !checkedIds.includes(id)
  );

  // ✅ Update localStorage (persistence)
  localStorage.setItem(key, JSON.stringify(updatedIds));

  // ✅ Update UI immediately
  const updatedSongs = visibleSongs.filter(
    song => !checkedIds.includes(song.id)
  );
  setVisibleSongs(updatedSongs);

  // ✅ Clear selected checkboxes
  setCheckedIds([]);
};
//--

//Keep UI in Sync Automatically--
useEffect(() => {
  const key = `playlist_songs_${playlistName}`;
  const savedIds: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");

  const matched = files.filter(f => savedIds.includes(f.id));
  setVisibleSongs(matched);
}, [playlistName, files]);
//--
//-------------------------------------------------------


// popup-local checked ids (separate from the playlist's own checkedIds)
const [popupCheckedIds, setPopupCheckedIds] = useState<string[]>([]);

const togglePopupCheckbox = (id: string) => {
  setPopupCheckedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
};

// songs in the library not already in this playlist
const availableSongs = files.filter(
  f => f.type.startsWith("audio/") && !visibleSongs.some(v => v.id === f.id)
);

// you'll fill in the persistence logic here (e.g. writing popupCheckedIds
// into `playlist_songs_${playlistName}` in localStorage, like addToPlaylist in MyMusic)
const handleConfirmAddSongs = () => {
  // TODO: your add-to-playlist logic using popupCheckedIds

  setPopupCheckedIds([]);
  setPopUpOpen(false);
};


const AddSongs = () => {
  if (popupCheckedIds.length === 0) return;

  const key = `playlist_songs_${playlistName}`;

  // get current saved IDs
  const savedIds: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");

  // merge — avoid duplicates
  const updatedIds = Array.from(new Set([...savedIds, ...popupCheckedIds]));

  // persist
  localStorage.setItem(key, JSON.stringify(updatedIds));

  // update UI immediately
  const newlyAdded = files.filter(f => popupCheckedIds.includes(f.id));
  setVisibleSongs(prev => [...prev, ...newlyAdded]);

  // reset popup state
  setPopupCheckedIds([]);
  setPopUpOpen(false);
};

return (
<div className="right-main">
  <div className="topbar">
    <div className="topbar-row">
      <div className="playlist-detail-topbar-left">
        <button className="playlist-back-btn" onClick={() => navigate('/playlist')}>←</button>
        <h1 className="topbar-h1">{playlistName}</h1>
      </div>
      <button className="upload-label" onClick={() => setPopUpOpen(true)}>+ Add Songs</button>
    </div>

    <div className="sub-menu">
      <div className="sub-menu-left">
        <button className="sub-menu-shuffle-btn">⇄ Shuffle and play</button>
        <button className='delete-button'
           onClick={handleDelete}
           disabled={checkedIds.length === 0}
        > Delete
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

      <div className="playlist-detail-main">
        
        {sortFiles(visibleSongs, sortBy).map((item) => {
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

      </div>

{popUpOpen && (
  <div className="popup-overlay">
    <div className="popup">
      <div className="popup-header">
        <h2>Add Songs</h2>
        <button
          className="popup-close-btn"
          onClick={() => {
            setPopUpOpen(false);
            setPopupCheckedIds([]);
          }}
        >
          ✕
        </button>
      </div>

      <div className="popup-song-list">
        {availableSongs.length === 0 ? (
          <p className="text-gray-500">No songs available to add</p>
        ) : (
          <SongList
            files={sortFiles(availableSongs, sortBy)}
            checkedIds={popupCheckedIds}
            onToggleCheckbox={togglePopupCheckbox}
            showPlayButton={false}
          />
        )}
      </div>

      <div className="popup-footer">
        <button
          className="add-songs-btn"
          onClick={AddSongs}
          disabled={popupCheckedIds.length === 0}
        >
          Add Songs ({popupCheckedIds.length})
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default PlaylistMusic;