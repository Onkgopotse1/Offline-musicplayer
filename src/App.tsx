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

const Home = lazy(() => import('./pages/Home.tsx'));
const Video = lazy(() => import('./pages/Video.tsx'));
const MyMusic = lazy(() => import('./pages/Music.tsx'));
const Notfound = lazy(() => import('./pages/NotFound.tsx'));
const Playlist = lazy(() => import('./pages/Playlist.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Playqueue = lazy(() => import('./pages/Playqueue.tsx'));

import Sidebar  from './Homee/Sidebar.tsx';
import RightMain  from './Homee/Rightmain.tsx';
import Bottom  from './Homee/Bottom.tsx';
import type { StoredFile } from "./type/media.ts";

//const Home = lazy(() => import("./pages/Home.tsx"));
//const Video = lazy(() => import("./pages/Video.tsx"));
//const MyMusic = lazy(() => import("./pages/Music.tsx"));


function App() {
  
// All uploaded media (audio + video) lives in this state
  const [files, setFiles] = useState<StoredFile[]>([]);

// Which media is currently selected to play
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<"audio" | "video" | null>(null);

// Playback state
  const [isPlaying, setIsPlaying] = useState(false);

// (Future-proofing)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);


 return (
  <div className="layout">
     <Sidebar />
 
        <Suspense fallback={<div>Loading...</div>}>
        <Routes>
        
         <Route path="/" element={<Home />} />

        <Route path="music" element={<MyMusic
         files={files}
         setFiles={setFiles}
         currentMediaId={currentMediaId}
         setCurrentMediaId={setCurrentMediaId}
         setIsPlaying={setIsPlaying}
         setCurrentMediaType={setCurrentMediaType}
        />} />

        <Route path="video" element={<Video 
         files={files}
         setFiles={setFiles}
         currentMediaId={currentMediaId}
         setCurrentMediaId={setCurrentMediaId}
         setIsPlaying={setIsPlaying}
         setCurrentMediaType={setCurrentMediaType}
         videoRef={videoRef}
        />} />

        <Route path="playqueue" element={<Playqueue />} />
        <Route path="playlist" element={<Playlist />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notfound" element={<Notfound />} />
      </Routes>
      </Suspense>


       <Bottom
        files={files}
        currentMediaId={currentMediaId}
        setCurrentMediaId={setCurrentMediaId}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentMediaType={currentMediaType}
        videoRef={videoRef}
       />

  </div>
 );
}

export default App;