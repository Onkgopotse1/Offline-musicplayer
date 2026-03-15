import './Playlist.css';

// color gradient function
const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 25%), hsl(${h2}, 70%, 15%))`;
};

// Placeholder names just to give each card a unique gradient
const placeholders = [
  "My Favourites", "Chill Vibes", "workout mix", "Late Night",
  "Road Trip", "Focus Mode", "Party Hits", "Acoustic Sessions",
];

function Playlist() {
  return (
    <div className="right-main">
      <div className="topbar">
        <h1 className="topbar-h1">Playlist</h1>
        <button className="upload-label">+ Add Playlist</button>
      </div>

      <div className="playlist-main-div">
        {placeholders.map((name, i) => (
          <div key={i} className="playlist-cart">

            <div className="playlist-thumb" style={{ background: getGradient(name) }}>
              <button className="playlist-play-btn">💽</button>
            </div>

            <div className="playlist-cart-info">
              <p className="playlist-cart-title">Playlist title</p>
              <p className="playlist-cart-sub">any text</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlist;