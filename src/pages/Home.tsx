import React from "react";
import './Home.css';
import type { StoredFile } from "../type/media.ts";
import { Suspense } from "react";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";


interface HomeProps {
  files: StoredFile[];
  recentIds: string[];
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentMediaType: React.Dispatch<React.SetStateAction<"audio" | "video" | null>>;
  saveFile: (file: StoredFile) => void;
}

// Generates a unique gradient background from the song name
const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 25%), hsl(${h2}, 70%, 15%))`;
};

// Same helper used in Music.tsx — splits filename into artist and song
const parseFileName = (file: StoredFile) => {
  const parts = file.name.split("-");
  if (parts.length < 2) return { artist: "Unknown Artist", song: file.name };
  const firstPart = parts[0].trim();
  const secondPart = parts[1].replace(/\.[^/.]+$/, "").trim();
  if (/^[A-Za-z]/.test(firstPart)) return { artist: firstPart, song: secondPart };
  return { song: firstPart, artist: secondPart };
};

export default function Home({ 
  files,     // all media files stored in indexedDB. actual files not id
  recentIds, // files that were recently played in Music.tsx, stored as an array of their IDs in indexedDB
  saveFile,           // function to save a file to indexedDB
  setCurrentMediaId,  // function to set which media is currently selected to play
  setIsPlaying,       // function to set whether the media is currently playing or paused
  setCurrentMediaType // function to set whether the currently selected media is audio or video
 }: HomeProps) {

  const handleplay = (id: string) => {
    setCurrentMediaId(id);
    setCurrentMediaType("audio");
    setIsPlaying(true);
  };

  // Map recentIds to their corresponding file objects, filtering out any that might not be found (e.g., if a file was deleted)
  // id are just a string represnting a each file in indexedDB
  const recentFiles = recentIds
    .map(id => files.find(f => f.id === id))
    .filter(Boolean) as StoredFile[];

    

  return (
    <div className="right-main">
      <div className="topbar">
        <h1>Home Page</h1>
      </div>

      <ErrorBoundary>
      <div className="main">
        {/* if the is no recent files played show the text "No recently played songs yet" */}
        {recentFiles.length === 0 && (
          <p className="text-gray-500">No recently played songs yet</p>
        )}     

      {/* Display the list of recently played files with a play button from recentFiles*/}
        
{recentFiles.map((item) => {
  const { artist, song } = parseFileName(item);
  const gradient = getGradient(item.name);
  return (
    <div key={item.id} className="cart-div">
      {/* Thumbnail area — gradient background with music note icon */}
      <div className="cart-thumbnail" style={{ background: gradient }}>
        <button className="play-btn" onClick={() => handleplay(item.id)}>♪</button>
      </div>
      {/* Song title and artist below the thumbnail */}
      <div className="cart-info">
        <p className="cart-title">{song}</p>
        <p className="cart-artist">{artist}</p>
      </div>
    </div>
  );
})}
      </div>
      </ErrorBoundary>
    </div>
  );
}