import "./Bottom.css";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShuffle,
  faBackward,
  faPlay,
  faPause,
  faForward,
  faRepeat,
  faVolumeHigh,
  faMaximize,
  faMinimize,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";

import type { StoredFile } from "../type/media.ts";
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";
import { useMedia } from "../MediaContext/MediaContext.tsx";
import { usePlayer } from "../MediaContext/MediaContext.tsx";




export default function Bottom() {
  const { files, loadFileData } = useMedia();
  const { currentMediaId, setCurrentMediaId, isPlaying, setIsPlaying, currentMediaType, videoRef } = usePlayer();

const [isShuffle, setIsShuffle] = useState(false);
const [isRepeat, setIsRepeat] = useState(false);
const [volume, setVolume] = useState(1); // 1 = 100%
const [showVolume, setShowVolume] = useState(false);


  // Global audio element reference
  // ===============================
  // This is the ONE and ONLY audio player in the entire app
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Progress bar reference
  const progressRef = useRef<HTMLProgressElement | null>(null);


  // Find currently selected file
  // When a row is clicked in Music.tsx, only the ID changes.
  // Bottom.tsx derives the actual file from that ID.
  const currentFile =
    files.find((file) => file.id === currentMediaId) ?? null;

  // Load & play audio when media changes
  // ===============================
useEffect(() => {
  if (!currentFile || !currentMediaType) return;

  const media = currentMediaType === "video"
    ? videoRef.current
    : audioRef.current;

  if (!media) return;

  // 👇 load data on demand instead of using currentFile.data directly
  loadFileData(currentFile.id).then((data) => {
    const blob = new Blob([data], { type: currentFile.type });
    const url = URL.createObjectURL(blob);
    media.src = url;
    if (isPlaying) media.play();
    return () => URL.revokeObjectURL(url);
  });

}, [currentMediaId, currentMediaType]);


  // Sync play / pause with state
  // ===============================
  useEffect(() => {
  if (!currentMediaType) return;

  const media =
    currentMediaType === "video"
      ? videoRef.current
      : audioRef.current;

  if (!media) return;

  if (isPlaying) {
    media.play();
  } else {
    media.pause();
  }
}, [isPlaying, currentMediaType]);

///////////////////////////Next Button Logic///////////////////////
const handleNext = () => {
  if (!currentMediaId || files.length === 0) return;

  const audioFiles = files.filter(f => f.type.startsWith(currentMediaType === "video" ? "video/" : "audio/"));
  if (audioFiles.length === 0) return;

  let nextFile;
  if (isShuffle) {
    // pick a random file that isn't the current one
    const others = audioFiles.filter(f => f.id !== currentMediaId);
    nextFile = others[Math.floor(Math.random() * others.length)];
  } else {
    const currentIndex = audioFiles.findIndex(f => f.id === currentMediaId);
    const nextIndex = currentIndex + 1 >= audioFiles.length ? 0 : currentIndex + 1;
    nextFile = audioFiles[nextIndex];
  }

  if (!nextFile) return;
  setCurrentMediaId(nextFile.id);
  setIsPlaying(true);
};
////////////////////Previous button Logic/////////////////////////////
const handlePrevious = () => {
  if (!currentMediaId || files.length === 0) return;

 const audioFiles = files.filter(f => f.type.startsWith(currentMediaType === "video" ? "video/" : "audio/"));
  if (audioFiles.length === 0) return;

  const currentIndex = audioFiles.findIndex(f => f.id === currentMediaId);
  if (currentIndex === -1) return;

  const prevIndex = currentIndex - 1 < 0 ? audioFiles.length - 1 : currentIndex - 1;
  const prevFile = audioFiles[prevIndex];

  if (!prevFile) return;
  setCurrentMediaId(prevFile.id);
  setIsPlaying(true);
};
/////////////////////end////////////////////////////////////////////

///////////////////Auto-play logic///////////////////////////
useEffect(() => {
  if (!currentMediaType) return;

  const media =
    currentMediaType === "video"
      ? videoRef.current
      : audioRef.current;

  if (!media) return;

const handleEnded = () => {
  if (isRepeat) {
    // replay same track
    const media = currentMediaType === "video" ? videoRef.current : audioRef.current;
    if (media) { media.currentTime = 0; media.play(); }
  } else {
    handleNext();
  }
}; 

  media.addEventListener("ended", handleEnded);

  return () => {
    media.removeEventListener("ended", handleEnded);
  };
}, [currentMediaId, files, currentMediaType, isRepeat]);

//////////////////////////end/////////////////////////////////

// Sync volume to audio/video element whenever it changes
useEffect(() => {
  const media = currentMediaType === "video" ? videoRef.current : audioRef.current;
  if (media) media.volume = volume;
}, [volume, currentMediaType]);

  // ===============================
  // Update progress bar as audio plays
  // ===============================
  useEffect(() => {
  if (!currentMediaType) return;

  const media =
    currentMediaType === "video"
      ? videoRef.current
      : audioRef.current;

  const progress = progressRef.current;

  if (!media || !progress) return;

  const updateProgress = () => {
    if (!media.duration) return;
    progress.value = (media.currentTime / media.duration) * 100;
  };

  media.addEventListener("timeupdate", updateProgress);

  return () => {
    media.removeEventListener("timeupdate", updateProgress);
  };
}, [currentMediaType]);


  // Play / Pause button handler
  const togglePlay = () => {
  if (!currentMediaType) return;

  const media =
    currentMediaType === "video"
      ? videoRef.current
      : audioRef.current;

  if (!media) return;

  setIsPlaying((prev) => !prev);
};


return(
    <div className="bottom">
      <ErrorBoundary>
      <div className="bottom-mother-container">
          {currentMediaType === "audio" && <audio ref={audioRef} />}
{/* ================Progress Bar==============*/}
        <progress
          ref={progressRef}
          value={0}
          max={100}
          className="progressBar"
        />
{/* <progress id="progressBar-id" value="0" max="100" className="progressBar"></progress> */}
        {/* ==================Main Controls=================*/}


        {/* middle-playstation */}
        <div className="middle-playstation">
          <button
            className={`shuffle-button ${isShuffle ? "active" : ""}`}
            onClick={() => setIsShuffle(p => !p)}
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>
          <button className="backward-fast-button" onClick={handlePrevious}>
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button className="play-button" onClick={togglePlay}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button className="forward-fast-button" onClick={handleNext}>
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button
            className={`repeat-button ${isRepeat ? "active" : ""}`}
            onClick={() => setIsRepeat(p => !p)}
          >
            <FontAwesomeIcon icon={faRepeat} />
          </button>
        </div>

        {/* second-playstation */}
        <div className="second-playstation">
          <div className="volume-wrapper">
            <button
              className="volume-button"
              onClick={() => setShowVolume(p => !p)}
            >
              <FontAwesomeIcon icon={faVolumeHigh} />
            </button>
            {showVolume && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            )}
          </div>
          <button className="maximize-button"><FontAwesomeIcon icon={faMaximize} /></button>
          <button className="minimize-button"><FontAwesomeIcon icon={faMinimize} /></button>
          <button className="threedots-button"><FontAwesomeIcon icon={faEllipsis} /></button>
        </div>
      </div>
      </ErrorBoundary>
                  
    </div>    
)  
}