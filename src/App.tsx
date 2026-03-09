import './App.css';
import './index.css';
import './pages/Home.css';
import './pages/Video.css';
import './pages/Music.css';
import './pages/Playlist.css';
import './pages/Settings.css';
import './pages/PlayQueue.css';
import './Homee/Bottom.css';
import { Routes, Route } from "react-router-dom";
import { useState, useRef, lazy, Suspense } from "react";
import ErrorBoundary from "./Error boundaries/Error boundry.tsx";

const Home = lazy(() => import('./pages/Home.tsx'));
import MyMusic from './pages/Music.tsx';
import Video from './pages/Video.tsx';
const Notfound = lazy(() => import('./pages/NotFound.tsx'));
const Playlist = lazy(() => import('./pages/Playlist.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Playqueue = lazy(() => import('./pages/Playqueue.tsx'));

import Sidebar  from './Homee/Sidebar.tsx';
import RightMain  from './Homee/Rightmain.tsx';
import Bottom  from './Homee/Bottom.tsx';
import type { StoredFile } from "./type/media.ts";
import { useMediaDB } from "./hooks/useMediaDB.ts";


function App() {
  
// All uploaded media (audio + video) lives in this state
  const { files, setFiles, saveFile } = useMediaDB();

// Which media is currently selected to play
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<"audio" | "video" | null>(null);

// Playback state
  const [isPlaying, setIsPlaying] = useState(false);

// (Future-proofing)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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
    const updated = [id, ...filtered].slice(0, 20); //only keep the 10 most recent
    localStorage.setItem("recentIds", JSON.stringify(updated)); 
    return updated;
  });
};

// We will use this ref to control the video element in the Video page from the Bottom player controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
//
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  

 return (
  <div className="layout">
     <Sidebar />
 
        <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
        <Routes>
        
         <Route path="/" element={<Home 
          files={files}
          recentIds={recentIds}
          saveFile={saveFile}
          setCurrentMediaId={setCurrentMediaId}
          setIsPlaying={setIsPlaying}
          setCurrentMediaType={setCurrentMediaType}
         />} />

        <Route path="music" element={<MyMusic
         files={files}
         setFiles={setFiles}
         saveFile={saveFile}
         addToRecent={addToRecent}
         currentMediaId={currentMediaId}
         setCurrentMediaId={setCurrentMediaId}
         setIsPlaying={setIsPlaying}
         setCurrentMediaType={setCurrentMediaType}
        />} />

        <Route path="video" element={<Video 
         files={files}
         setFiles={setFiles}
         saveFile={saveFile}
         currentMediaId={currentMediaId}
         setCurrentMediaId={setCurrentMediaId}
         setIsPlaying={setIsPlaying}
         setCurrentMediaType={setCurrentMediaType}
         videoRef={videoRef}
         thumbnails={thumbnails}
         setThumbnails={setThumbnails}

        />} />

        <Route path="playqueue" element={<Playqueue />} />
        <Route path="playlist" element={<Playlist />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notfound" element={<Notfound />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>

       <ErrorBoundary>
       <Bottom
        files={files}
        currentMediaId={currentMediaId}
        setCurrentMediaId={setCurrentMediaId}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentMediaType={currentMediaType}
        videoRef={videoRef}
       />
       </ErrorBoundary>

  </div>
 );
}

export default App;