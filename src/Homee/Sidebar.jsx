import {  Link, useNavigate } from "react-router-dom";

export default function Sidebar() {

  
        const navigate = useNavigate();
        
          return (
          <div className="sidebar">
            <div className="top-div">
              <button className="back-button" >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <i className="fa-solid fa-circle-play" id="play-button"></i>
              <p className="media-player">Media Player</p>
            </div>

          <div className="last-div-left">
                <div className="search-div">
                  <input type="text" className="search" placeholder="search" />
                </div>

                <div className="home-div">
                  <button className="home-button" id="home-buttoon" onClick={() => navigate("/")}>
                    <i className="fa-solid fa-house" id="home-icon"></i>
                    <p className="home-text">Home</p>
                  </button>
                </div>

                <div className="music-div">
                  <button className="music-button" id="music-button" onClick={() => navigate("/music")}>
                    <i className="fa-solid fa-music" id="music-icon"></i>
                    <p className="music-text">Music</p>
                  </button>
                </div>

                <div className="video-div">
                  <button className="video-button" onClick={() => navigate("/video")}>
                    <i className="fa-solid fa-film" id="video-icon"></i>
                    <p className="video-text">Video</p>
                  </button>
                </div>

                <div className="div-line"></div>

                <div className="play-queue-div">
                  <button className="play-queue-button" onClick={() => navigate("/playqueue")}>
                    <i className="fa-solid fa-list" id="play-queue-icon"></i>
                    <p className="play-queue-text">play-queue</p>
                  </button>
                </div>

                <div className="playlist-div">
                  <button className="playlist-button" onClick={() => navigate("/playlist")}>
                    <i className="fa-solid fa-compact-disc" id="playlist-icon"></i>
                    <p className="playlist-text">playlist</p>
                  </button>
                </div>

                <button className="settings" onClick={() => navigate("/settings")}>
                    <i className="fa-solid fa-gear fa-lg" id="settings-icone"></i>
                    <p className="settings-text">Settings</p>
                </button>
                <Link to="*">lll</Link>
          </div>
          </div>
          )  
}

