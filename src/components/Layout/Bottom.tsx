import "../../styles/local styles/Bottom.css";
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

import ErrorBoundary from "../../Error boundaries/Error boundry.tsx";
import { useMedia } from "../../context/MediaContext.tsx";
import { usePlayer } from "../../context/MediaContext.tsx";


export default function Bottom() {
  const { files, loadFileData } = useMedia();
  const {
    currentMediaId,
    setCurrentMediaId,
    isPlaying,
    setIsPlaying,
    currentMediaType,
    videoRef,
    queue,          // ← ordered list of IDs set by whichever page is playing
    isShuffle, 
    setIsShuffle,
    isRepeat,
    setIsRepeat
  } = usePlayer();


  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  // Keep refs in sync so closures inside useEffect always read the latest value
  const isShuffleRef = useRef(false);
  const isRepeatRef = useRef(false);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);

  // The ONE audio element for the whole app
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLProgressElement | null>(null);

  // Derive the current file from the ID
  const currentFile = files.find((f) => f.id === currentMediaId) ?? null;


  // ── Load & play when the track changes ──────────────────────────────
  useEffect(() => {
    if (!currentFile || !currentMediaType) return;

    const media =
      currentMediaType === "video" ? videoRef.current : audioRef.current;
    if (!media) return;

    loadFileData(currentFile.id).then((data) => {
      const blob = new Blob([data], { type: currentFile.type });
      const url = URL.createObjectURL(blob);
      media.src = url;
      if (isPlaying) media.play();
      return () => URL.revokeObjectURL(url);
    });
  }, [currentMediaId, currentMediaType]);


  // ── Sync play / pause state to the media element ────────────────────
  useEffect(() => {
    if (!currentMediaType) return;

    const media =
      currentMediaType === "video" ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.play();
    } else {
      media.pause();
    }
  }, [isPlaying, currentMediaType]);


  // ── Next track ───────────────────────────────────────────────────────
  // Uses the queue set by whichever page is currently playing.
  // Music.tsx sets its sorted audio list, Video.tsx sets its sorted video
  // list, PlaylistMusic.tsx sets that playlist's sorted list.
  // Bottom.tsx never needs to know which page it is.
  const handleNext = () => {
    if (!currentMediaId || queue.length === 0) return;

    const currentIndex = queue.indexOf(currentMediaId);

    let nextId: string;
    if (isShuffleRef.current) {
      const others = queue.filter((id) => id !== currentMediaId);
      if (others.length === 0) return;
      nextId = others[Math.floor(Math.random() * others.length)]!;
    } else {
      const nextIndex =
        currentIndex + 1 >= queue.length ? 0 : currentIndex + 1;
      nextId = queue[nextIndex]!;
    }

    setCurrentMediaId(nextId);
    setIsPlaying(true);
  };


  // ── Previous track ───────────────────────────────────────────────────
  const handlePrevious = () => {
    if (!currentMediaId || queue.length === 0) return;

    const currentIndex = queue.indexOf(currentMediaId);
    const prevIndex =
      currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;

    setCurrentMediaId(queue[prevIndex]!);
    setIsPlaying(true);
  };


  // ── Auto-play: when a track ends, repeat or go next ─────────────────
  useEffect(() => {
    if (!currentMediaType) return;

    const media =
      currentMediaType === "video" ? videoRef.current : audioRef.current;
    if (!media) return;

    const handleEnded = () => {
      if (isRepeatRef.current) {
        media.currentTime = 0;
        media.play();
      } else {
        handleNext();
      }
    };

    media.addEventListener("ended", handleEnded);
    return () => media.removeEventListener("ended", handleEnded);
  }, [currentMediaId, currentMediaType, queue]);
  // queue is in the dep array so handleNext always closes over the latest queue


  // ── Sync volume ──────────────────────────────────────────────────────
  useEffect(() => {
    const media =
      currentMediaType === "video" ? videoRef.current : audioRef.current;
    if (media) media.volume = volume;
  }, [volume, currentMediaType]);


  // ── Progress bar ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentMediaType) return;

    const media =
      currentMediaType === "video" ? videoRef.current : audioRef.current;
    const progress = progressRef.current;
    if (!media || !progress) return;

    const updateProgress = () => {
      if (!media.duration) return;
      progress.value = (media.currentTime / media.duration) * 100;
    };

    media.addEventListener("timeupdate", updateProgress);
    return () => media.removeEventListener("timeupdate", updateProgress);
  }, [currentMediaType]);


  // ── Play / Pause toggle ──────────────────────────────────────────────
  const togglePlay = () => {
    if (!currentMediaType) return;
    setIsPlaying((prev) => !prev);
  };

  const goFullscreen = () => {
  const video = videoRef.current;
  if (!video) return;

  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if ((video as any).webkitRequestFullscreen) {
    (video as any).webkitRequestFullscreen();
  } else if ((video as any).msRequestFullscreen) {
    (video as any).msRequestFullscreen();
  }
};

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="bottom">
      <ErrorBoundary>
        <div className="bottom-mother-container">

          {currentMediaType === "audio" && <audio ref={audioRef} />}

          {/* Progress Bar */}
          <progress
            ref={progressRef}
            value={0}
            max={100}
            className="progressBar"
          />

          {/* Main Controls */}
          <div className="middle-playstation">
            <button
              className={`shuffle-button ${isShuffle ? "active" : ""}`}
              onClick={() => setIsShuffle((p) => !p)}
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
              onClick={() => setIsRepeat((p) => !p)}
            >
              <FontAwesomeIcon icon={faRepeat} />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="second-playstation">
            <div className="volume-wrapper">
              <button
                className="volume-button"
                onClick={() => setShowVolume((p) => !p)}
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
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                />
              )}
            </div>
            <button className="maximize-button"
             onClick={goFullscreen}
            >
              <FontAwesomeIcon icon={faMaximize} />
            </button>
            <button className="minimize-button">
              <FontAwesomeIcon icon={faMinimize} />
            </button>
            <button className="threedots-button">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

        </div>
      </ErrorBoundary>
    </div>
  );
}