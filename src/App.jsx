import './App.css';
import { Routes, Route } from "react-router-dom";
import Home  from "./pages/Home";
import MyMusic from './pages/Music';
import Notfound from './pages/NotFound';
import Playlist from './pages/Playlist';
import Settings from './pages/Settings';
import Video from "./pages/Video";
import Playqueue from './pages/Playqueue';

import Sidebar  from './Homee/Sidebar';
import RightMain  from './Homee/Rightmain';
import Bottom  from './Homee/Bottom';


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