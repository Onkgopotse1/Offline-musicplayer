// GLOBAL STYLES
import "../styles/global styles/App.css";
import "../styles/global styles/index.css";

// LOCAL STYLES
import "../styles/local styles/Home.css";
import "../styles/local styles/Video.css";
import "../styles/local styles/Music.css";

// PAGE STYLES
import "../styles/local styles/Playlist.css";
import "../styles/local styles/Settings.css";
import "../styles/local styles/PlayQueue.css";

// COMPONENT STYLE
import "../styles/local styles/Bottom.css";

import { Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import { MediaContext, PlayerContext } from "../context/MediaContext.tsx";

const Home = lazy(() => import('../pages/Home.tsx'));
import MyMusic from '../features/Music.tsx';
import Video from '../features/Video.tsx';
const Notfound = lazy(() => import('../pages/NotFound.tsx'));
const Playlist = lazy(() => import('../features/Playlist.tsx'));
const Settings = lazy(() => import('../pages/Settings.tsx'));
const Playqueue = lazy(() => import('../features/Playqueue.tsx'));
const PlaylistDetail = lazy(() => import('../features/PlaylistMusic.tsx'));

import Sidebar from '../components/Layout/Sidebar.tsx';
import Bottom from '../components/Layout/Bottom.tsx';
import type { StoredFile } from "../type/media.ts";
import { useMediaDB } from "../hooks/useMediaDB.ts";


function App() {

// All uploaded media (audio + video) lives in this state
  const { files, setFiles, saveFile, loadFileData, loadThumbnails, saveThumbnail, loaded } = useMediaDB();

// Which media is currently selected to play
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<"audio" | "video" | null>(null);

// Playback state
  const [isPlaying, setIsPlaying] = useState(false);

// Recently played media history (for "Recently Played" section in Home page)
// we store the IDs of recently played media here in localStorage
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentIds");
    return saved ? JSON.parse(saved) : [];
  });

// addToRecent is a helper function to manage the recently played media list.
  const addToRecent = (id: string) => {
    setRecentIds(prev => {
      const filtered = prev.filter(r => r !== id);
      const updated = [id, ...filtered].slice(0, 20); //only keep the 20 most recent
      localStorage.setItem("recentIds", JSON.stringify(updated));
      return updated;
    });
  };

// We will use this ref to control the video element in the Video page from the Bottom player controls
  const videoRef = useRef<HTMLVideoElement | null>(null);

// thumbnails stay local — they update frequently during generation
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [thumbnailsReady, setThumbnailsReady] = useState(false);

  useEffect(() => {
    loadThumbnails().then((saved) => {
      setThumbnails(saved);
      setThumbnailsReady(true); // signals thumbnails are done
    });
  }, []);

  const loading = !loaded || !thumbnailsReady;

 const [queue, setQueue] = useState<string[]>([]);

const [isShuffle, setIsShuffle] = useState(false);
const [isRepeat, setIsRepeat] = useState(false);

  return (
    <Suspense fallback={<div style={{ display: 'grid', placeItems: "center" }}>Loading...</div>}>
      {loading ? (
        <div style={{ display: 'grid', placeItems: "center", margin: "0", height: "100vh", fontSize: "60px" }}>Loading...</div>
      ) : (

        <MediaContext.Provider value={{ files, setFiles, saveFile, loadFileData, loadThumbnails, saveThumbnail }}>
        <PlayerContext.Provider value={{ isShuffle,  setIsShuffle, isRepeat, setIsRepeat, queue, setQueue, currentMediaId, setCurrentMediaId, currentMediaType, setCurrentMediaType, isPlaying, setIsPlaying, videoRef, recentIds, addToRecent }}>

        <div className="layout">

          <Sidebar />

          <ErrorBoundary>
            <Routes>

              <Route path="/" element={<Home />} />

              <Route path="music" element={<MyMusic />} />

              <Route path="video" element={<Video
                thumbnails={thumbnails}
                setThumbnails={setThumbnails}
              />} />

              <Route path="playqueue" element={<Playqueue />} />
              <Route path="playlist" element={<Playlist />} />
              <Route path="playlist/:name" element={<PlaylistDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notfound" element={<Notfound />} />

            </Routes>
          </ErrorBoundary>

          <ErrorBoundary>
            <Bottom />
          </ErrorBoundary>

        </div>

        </PlayerContext.Provider>
        </MediaContext.Provider>
      )}
    </Suspense>
  );
}

export default App;