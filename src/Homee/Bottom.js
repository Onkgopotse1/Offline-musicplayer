import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx("div", { className: "bottom", children: _jsxs("div", { className: "bottom-mother-container", children: [_jsx("div", { className: "playing-box", children: _jsx("audio", { src: "Ayo & Teo _ Gang _ Young Thug - Daddy\u2019s Birthday (Dance Video) - Copy.mp3", id: "Ayo-&-Teo" }) }), _jsx("progress", { id: "progressBar-id", value: "0", max: "100", className: "progressBar" }), _jsxs("div", { className: "middle-playstation", children: [_jsx("button", { className: "shuffle-button", id: "shuffle-button-id", children: _jsx(FontAwesomeIcon, { icon: faShuffle }) }), _jsx("button", { className: "backward-fast-button", id: "backward-fast-button-id", children: _jsx(FontAwesomeIcon, { icon: faBackward }) }), _jsx("button", { className: "play-button", id: "play-button-id", children: _jsx(FontAwesomeIcon, { icon: faPlay }) }), _jsx("button", { className: "forward-fast-button", id: "forward-fast-button-id", children: _jsx(FontAwesomeIcon, { icon: faForward }) }), _jsx("button", { className: "repeat-button", id: "repeat-button-id", children: _jsx(FontAwesomeIcon, { icon: faRepeat }) })] }), _jsxs("div", { className: "second-playstation", children: [_jsx("button", { className: "volume-button", id: "volume-button-id", children: _jsx(FontAwesomeIcon, { icon: faVolumeHigh }) }), _jsx("button", { className: "maximize-button", id: "maximize-button-id", children: _jsx(FontAwesomeIcon, { icon: faMaximize }) }), _jsx("button", { className: "minimize-button", id: "minimize-button-id", children: _jsx(FontAwesomeIcon, { icon: faMinimize }) }), _jsx("button", { className: "threedots-button", id: "3dots-button-id", children: _jsx(FontAwesomeIcon, { icon: faEllipsis }) })] })] }) }));
}
//# sourceMappingURL=Bottom.js.map