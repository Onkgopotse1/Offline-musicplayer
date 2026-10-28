import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import ErrorBoundary from "../../Error boundaries/Error boundry.tsx";
import { useMedia, usePlayer } from "../../context/MediaContext.tsx";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompactSearchOpen, setIsCompactSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { files } = useMedia();
  const { setCurrentMediaId, setCurrentMediaType, setIsPlaying, setQueue, addToRecent } = usePlayer();
  const searchResults = searchQuery.trim()
    ? files.filter((file) => file.name.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const closeResultsOutsideSearch = (event: PointerEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("pointerdown", closeResultsOutsideSearch);
    return () => document.removeEventListener("pointerdown", closeResultsOutsideSearch);
  }, []);

  const playSearchResult = (id: string, type: string) => {
    const mediaType = type.startsWith("video/") ? "video" : "audio";
    const playableFiles = files.filter((file) => file.type.startsWith(`${mediaType}/`));
    setQueue(playableFiles.map((file) => file.id));
    setCurrentMediaId(id);
    setCurrentMediaType(mediaType);
    setIsPlaying(true);
    addToRecent(id);
    setSearchQuery("");
    setIsSearchFocused(false);
    setIsCompactSearchOpen(false);
  };

  const handleBack = () => {
    if (location.pathname === "/") {
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {isCompactSearchOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close expanded sidebar"
          onClick={() => setIsCompactSearchOpen(false)}
        />
      )}
      <div className={`sidebar${isCompactSearchOpen ? " sidebar--search-open" : ""}`}>
      <div className="top-div">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <FontAwesomeIcon icon={faCirclePlay} className="top-play-icon" />
        <p className="media-player">Media Player</p>
      </div>

      <ErrorBoundary>
        <div className="last-div-left">
          <div className="search-div" ref={searchContainerRef}>
            <input
              type="search"
              className="search"
              placeholder="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onClick={() => setIsSearchFocused(true)}
              aria-label="Search media"
              aria-controls="media-search-results"
            />
            <button
              className="search-icon-button"
              type="button"
              aria-label="Expand sidebar search"
              aria-expanded={isCompactSearchOpen}
              onClick={() => setIsCompactSearchOpen(true)}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" aria-hidden="true" />
            </button>
            {isSearchFocused && searchQuery.trim() && (
              <div className="search-results" id="media-search-results" role="listbox" aria-label="Media search results">
                {searchResults.length ? searchResults.map((file) => (
                  <button
                    className="search-result"
                    key={file.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => playSearchResult(file.id, file.type)}
                    title={file.name}
                  >
                    <span className="search-result-name">{file.name}</span>
                    <span className="search-result-type">{file.type.startsWith("video/") ? "Video" : "Audio"}</span>
                  </button>
                )) : (
                  <div className="search-results-empty">No matching media</div>
                )}
              </div>
            )}
          </div>

          <div className="home-div">
            <button className="home-button" id="home-buttoon" onClick={() => navigate("/")}>
              <FontAwesomeIcon icon={faHouse} className="home-icon" />
              <p className="home-text">Home</p>
            </button>
          </div>

          <div className="music-div">
            <button className="music-button" id="music-button" onClick={() => navigate("/music")}>
              <FontAwesomeIcon icon={faMusic} className="music-icon" />
              <p className="music-text">Music</p>
            </button>
          </div>

          <div className="video-div">
            <button className="video-button" onClick={() => navigate("/video")}>
              <FontAwesomeIcon icon={faVideo} className="video-icon" />
              <p className="video-text">Video</p>
            </button>
          </div>

          <div className="div-line"></div>

          <div className="play-queue-div">
            <button className="play-queue-button" onClick={() => navigate("/playqueue")}>
              <FontAwesomeIcon icon={faList} className="play-queue-icon" />
              <p className="play-queue-text">play-queue</p>
            </button>
          </div>

          <div className="playlist-div">
            <button className="playlist-button" onClick={() => navigate("/playlist")}>
              <FontAwesomeIcon icon={faCompactDisc} className="playlist-icon" />
              <p className="playlist-text">playlist</p>
            </button>
          </div>

          <div className="settings-div">
            <button className="settings-button" onClick={() => navigate("/settings")}>
              <FontAwesomeIcon icon={faGear} className="settings-icon" />
              <p className="settings-text">Settings</p>
            </button>
          </div>
        </div>
      </ErrorBoundary>
      </div>
    </>
  );
}