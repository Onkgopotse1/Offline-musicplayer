import "./Bottom.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faShuffle } from '@fortawesome/free-solid-svg-icons';
import { faBackward } from '@fortawesome/free-solid-svg-icons';
import { faForward } from '@fortawesome/free-solid-svg-icons';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';

import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { faMaximize } from '@fortawesome/free-solid-svg-icons';
import { faMinimize } from '@fortawesome/free-solid-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

export default function Bottom() {

return(
    <div className="bottom">
      <div className="bottom-mother-container">
        <div className="playing-box">
          <audio src="Ayo & Teo _ Gang _ Young Thug - Daddy’s Birthday (Dance Video) - Copy.mp3" id="Ayo-&-Teo"></audio>
        </div>

        <progress id="progressBar-id" value="0" max="100" className="progressBar"></progress>

        <div className="middle-playstation">
          <button className="shuffle-button" id="shuffle-button-id"><FontAwesomeIcon icon={faShuffle} /></button>
          <button className="backward-fast-button" id="backward-fast-button-id"><FontAwesomeIcon icon={faBackward} /></button>
          <button className="play-button" id="play-button-id"><FontAwesomeIcon icon={faPlay} /></button>
          <button className="forward-fast-button" id="forward-fast-button-id"><FontAwesomeIcon icon={faForward} /></button>
          <button className="repeat-button" id="repeat-button-id"><FontAwesomeIcon icon={faRepeat} /></button>
        </div>

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
