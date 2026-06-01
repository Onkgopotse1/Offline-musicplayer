import React from "react";
import '../styles/local styles/Home.css';
import type { StoredFile } from "../type/media.ts";
import { lazy, Suspense } from "react";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import { parseFileName, getGradient } from "../utils/mediaUtils.ts";

import { useMedia } from "../context/MediaContext.tsx";
import { usePlayer } from "../context/MediaContext.tsx";

export default function Home() {
  const { files } = useMedia();
  const { recentIds, setCurrentMediaId, setIsPlaying, setCurrentMediaType } = usePlayer();

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
        <h1 className="topbar-h1">Home</h1>
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