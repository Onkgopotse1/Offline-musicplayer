import './App.css';
import { Routes, Route } from "react-router-dom";
import { useState, useRef } from "react";
import Home  from "./pages/Home.tsx";
import MyMusic from './pages/Music.tsx';
import Notfound from './pages/NotFound.tsx';
import Playlist from './pages/Playlist.tsx';
import Settings from './pages/Settings.tsx';
import Video from "./pages/Video.tsx";
import Playqueue from './pages/Playqueue.tsx';

import Sidebar  from './Homee/Sidebar.tsx';
import RightMain  from './Homee/Rightmain.tsx';
import Bottom  from './Homee/Bottom.tsx';
import type { StoredFile } from "./type/media.ts";


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