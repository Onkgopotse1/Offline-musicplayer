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
        
        {recentFiles.map((item) => (
          
          <div key={item.id} className="cart-div">
            <button
              onClick={() => handleplay(item.id)}
              className="play-buttons"
            >▶</button>
            <p className="text">{item.name}</p>
          </div>
        ))}
      </div>
      </ErrorBoundary>
    </div>
  );
}