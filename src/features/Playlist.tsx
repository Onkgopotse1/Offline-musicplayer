import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../local styles/Playlist.css';

const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 25%), hsl(${h2}, 70%, 15%))`;
};

// load saved playlists from localStorage
const loadPlaylists = (): string[] => {
  const saved = localStorage.getItem("playlists");
  return saved ? JSON.parse(saved) : [];
};

// Helper function to get the song count from local storage
const getSongCount = (playlistName: string): number => {
  const key = `playlist_songs_${playlistName}`;
  const savedIds = localStorage.getItem(key);
  return savedIds ? JSON.parse(savedIds).length : 0;
};

function Playlist() {
  const [playlists, setPlaylists] = useState<string[]>(loadPlaylists);
  const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const name = inputValue.trim();
    if (!name) return;

    const updated = [...playlists, name];
    setPlaylists(updated);
    localStorage.setItem("playlists", JSON.stringify(updated));
    
    // reset and close
    setInputValue("");
    setShowPopup(false);
  };

  const handleDelete = (nameToDelete: string) => {
    // 1. Remove the playlist name from the playlists array
    const updated = playlists.filter(name => name !== nameToDelete);
    setPlaylists(updated);
    localStorage.setItem("playlists", JSON.stringify(updated));
    
    // 2. Optional but recommended: Clean up the songs attached to this playlist so they don't bloat local storage
    localStorage.removeItem(`playlist_songs_${nameToDelete}`);
  };

  const handleCancel = () => {
    setInputValue("");
    setShowPopup(false);
  };

  return (
    <div className="right-main">

      {/* div 1 — topbar unchanged */}
      <div className="topbar">
        <h1 className="topbar-h1">Playlist</h1>
        <button className="upload-label" onClick={() => setShowPopup(true)}>
          + Add Playlist
        </button>
      </div>

      {/* div 2 — conditional render */}
      <div  className={`playlist-main-div ${
    !showPopup && playlists.length === 0 ? "empty-state" : ""
  }`}
>

        {/* popup — renders inside div2 */}
        {showPopup && (
          <div className="playlist-popup-overlay">
            <div className="playlist-popup">
              <p className="playlist-popup-title">New Playlist</p>
              <input
                className="playlist-popup-input"
                type="text"
                placeholder="Enter playlist name..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
              <div className="playlist-popup-buttons">
                <button className="playlist-popup-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="playlist-popup-submit" onClick={handleSubmit}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* condition 1 — no playlists */}
        {!showPopup && playlists.length === 0 && (
          <div className="no-playlist">
           <p className="playlist-empty">You have no playlists</p>
          </div>
        )}

        {/* condition 2 — render saved playlists */}
        {!showPopup && playlists.length > 0 && playlists.map((name, i) => (
          <Link key={i} to={`/playlist/${encodeURIComponent(name)}`} className="playlist-cart-link">
          <div key={i} className="playlist-cart">
            <div className="playlist-thumb" style={{ background: getGradient(name) }}>
              <button className="playlist-play-btn">♪</button>
              <button onClick={(e) => {
                  e.preventDefault(); // Prevent navigating to the link when deleting
                  handleDelete(name);
              }}>
                ⚙️
              </button>
            </div>
            <div className="playlist-cart-info">
              <p className="playlist-cart-title">{name} Playlist</p>
              
              {/* Dynamically call getSongCount passing the playlist name */}
              <p className="playlist-cart-sub">{getSongCount(name)} items</p>
              
            </div>
          </div>
         </Link>
        ))}

      </div>
    </div>
  );
}

export default Playlist;