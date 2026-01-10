import './App.css';
import { Routes, Route } from "react-router-dom";
import Home  from "./pages/Home.js";
import MyMusic from './pages/Music.js';
import Notfound from './pages/NotFound.js';
import Playlist from './pages/Playlist.js';
import Settings from './pages/Settings.js';
import Video from "./pages/Video.js";
import Playqueue from './pages/Playqueue.js';

import Sidebar  from './Homee/Sidebar.js';
import RightMain  from './Homee/Rightmain.js';
import Bottom  from './Homee/Bottom.js';


function App() {
  
 return (
  <div className="layout">
     <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="music" element={<MyMusic />} />
        <Route path="notfound" element={<Notfound />} />
        <Route path="playlist" element={<Playlist />} />
        <Route path="settings" element={<Settings />} />
        <Route path="video" element={<Video />} />
        <Route path="playqueue" element={<Playqueue />} />
      </Routes>
     <Bottom />
  </div>
 );
}

export default App;