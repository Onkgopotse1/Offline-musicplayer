import "./Bottom.css";
import React, { useEffect, useRef } from "react";
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

// ===============================
// Props coming FROM parent
// ===============================
interface BottomProps {
  files: StoredFile[];                 // All media from IndexedDB (state)
  currentMediaId: string | null;
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;      
  isPlaying: boolean;                                                      // Play / pause state
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentMediaType: "audio" | "video" | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function Bottom({
  files,
  currentMediaId,
  setCurrentMediaId,
  isPlaying,
  setIsPlaying,
  currentMediaType,
  videoRef
}: BottomProps) {

  // ===============================
  // Global audio element reference
  // ===============================
  // This is the ONE and ONLY audio player in the entire app
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Progress bar reference
  const progressRef = useRef<HTMLProgressElement | null>(null);

  // ===============================
  // Find currently selected file
  // ===============================
  // When a row is clicked in Music.tsx, only the ID changes.
  // Bottom.tsx derives the actual file from that ID.
  const currentFile =
    files.find((file) => file.id === currentMediaId) ?? null;

  // ===============================
  // Load & play audio when media changes
  // ===============================
  useEffect(() => {
  if (!currentFile || !currentMediaType) return;

  const media =
    currentMediaType === "video"
      ? videoRef.current
      : audioRef.current;

  if (!media) return;

  const blob = new Blob([currentFile.data], {
    type: currentFile.type,
  });

  const url = URL.createObjectURL(blob);
  media.src = url;

  if (isPlaying) {
    media.play();
  }

  return () => {
    URL.revokeObjectURL(url);
  };
}, [currentMediaId, currentMediaType]);


  // ===============================
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

  const currentIndex = files.findIndex(
    (file) => file.id === currentMediaId
  );

  if (currentIndex === -1) return;

  const nextIndex =
    currentIndex + 1 >= files.length ? 0 : currentIndex + 1;

  const nextFile = files[nextIndex];

  if (!nextFile) return;

  // Set new media ID
  // (App updates global state)
  // Bottom reacts automatically
  setCurrentMediaId(nextFile.id);
  setIsPlaying(true);
};
///////////////////////////////////end////////////////////////////////

////////////////////Previous button Logic/////////////////////////////
const handlePrevious = () => {
  if (!currentMediaId || files.length === 0) return;

  const currentIndex = files.findIndex(
    (file) => file.id === currentMediaId
  );

  if (currentIndex === -1) return;

  const prevIndex =
    currentIndex - 1 < 0 ? files.length - 1 : currentIndex - 1;

  const prevFile = files[prevIndex];

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
    handleNext();
  };

  media.addEventListener("ended", handleEnded);

  return () => {
    media.removeEventListener("ended", handleEnded);
  };
}, [currentMediaId, files, currentMediaType]);

 
//////////////////////////end/////////////////////////////////

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


        <div className="middle-playstation">
          <button className="shuffle-button" id="shuffle-button-id"><FontAwesomeIcon icon={faShuffle} /></button>
          <button className="backward-fast-button" id="backward-fast-button-id" 
            onClick={handlePrevious}>
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button className="play-button" id="play-button-id"
            onClick={togglePlay}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button className="forward-fast-button" id="forward-fast-button-id" 
            onClick={handleNext}>
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button className="repeat-button" id="repeat-button-id"><FontAwesomeIcon icon={faRepeat} /></button>
        </div>

{/* ================Secondary Controls======================*/}
        <div className="second-playstation">
          <button className="volume-button" id="volume-button-id"><FontAwesomeIcon icon={faVolumeHigh} /></button>
          <button className="maximize-button" id="maximize-button-id"><FontAwesomeIcon icon={faMaximize} /></button>
          <button className="minimize-button" id="minimize-button-id"><FontAwesomeIcon icon={faMinimize} /></button>
          <button className="threedots-button" id="3dots-button-id"><FontAwesomeIcon icon={faEllipsis} /></button>
        </div>
      </div>
                  
    </div>    
)  
}
