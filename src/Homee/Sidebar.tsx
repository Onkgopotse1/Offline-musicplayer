import {  Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {

   const navigate = useNavigate();
   
          return (
          <div className="sidebar">
            <div className="top-div">
              <button className="back-button" >
                <FontAwesomeIcon icon={faArrowLeft}  />
              </button>
              <FontAwesomeIcon icon={faCirclePlay} className="top-play-icon" />
              <p className="media-player">Media Player</p>
            </div>

          <div className="last-div-left">
                <div className="search-div">
                  <input type="text" className="search" placeholder="search" />
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

                <button className="settings-button" onClick={() => navigate("/settings")}>
                    <FontAwesomeIcon icon={faGear} className="settings-icon" />
                    <p className="settings-text">Settings</p>
                </button>
                
          </div>
          </div>
          )  
}

