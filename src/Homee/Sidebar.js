import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
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
    return (_jsxs("div", { className: "sidebar", children: [_jsxs("div", { className: "top-div", children: [_jsx("button", { className: "back-button", children: _jsx(FontAwesomeIcon, { icon: faArrowLeft }) }), _jsx(FontAwesomeIcon, { icon: faCirclePlay }), _jsx("p", { className: "media-player", children: "Media Player" })] }), _jsxs("div", { className: "last-div-left", children: [_jsx("div", { className: "search-div", children: _jsx("input", { type: "text", className: "search", placeholder: "search" }) }), _jsx("div", { className: "home-div", children: _jsxs("button", { className: "home-button", id: "home-buttoon", onClick: () => navigate("/"), children: [_jsx(FontAwesomeIcon, { icon: faHouse }), _jsx("p", { className: "home-text", children: "Home" })] }) }), _jsx("div", { className: "music-div", children: _jsxs("button", { className: "music-button", id: "music-button", onClick: () => navigate("/music"), children: [_jsx(FontAwesomeIcon, { icon: faMusic }), _jsx("p", { className: "music-text", children: "Music" })] }) }), _jsx("div", { className: "video-div", children: _jsxs("button", { className: "video-button", onClick: () => navigate("/video"), children: [_jsx(FontAwesomeIcon, { icon: faVideo }), _jsx("p", { className: "video-text", children: "Video" })] }) }), _jsx("div", { className: "div-line" }), _jsx("div", { className: "play-queue-div", children: _jsxs("button", { className: "play-queue-button", onClick: () => navigate("/playqueue"), children: [_jsx(FontAwesomeIcon, { icon: faList }), _jsx("p", { className: "play-queue-text", children: "play-queue" })] }) }), _jsx("div", { className: "playlist-div", children: _jsxs("button", { className: "playlist-button", onClick: () => navigate("/playlist"), children: [_jsx(FontAwesomeIcon, { icon: faCompactDisc }), _jsx("p", { className: "playlist-text", children: "playlist" })] }) }), _jsxs("button", { className: "settings-button", onClick: () => navigate("/settings"), children: [_jsx(FontAwesomeIcon, { icon: faGear }), _jsx("p", { className: "settings-text", children: "Settings" })] })] })] }));
}
//# sourceMappingURL=Sidebar.js.map