import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MyMusic from './pages/Music';
import Notfound from './pages/NotFound';
import Playlist from './pages/Playlist';
import Settings from './pages/Settings';
import Video from "./pages/Video";
import Playqueue from './pages/Playqueue';
import Sidebar from './Homee/Sidebar';
import RightMain from './Homee/Rightmain';
import Bottom from './Homee/Bottom';
function App() {
    return (_jsxs("div", { className: "layout", children: [_jsx(Sidebar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "music", element: _jsx(MyMusic, {}) }), _jsx(Route, { path: "notfound", element: _jsx(Notfound, {}) }), _jsx(Route, { path: "playlist", element: _jsx(Playlist, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "video", element: _jsx(Video, {}) }), _jsx(Route, { path: "playqueue", element: _jsx(Playqueue, {}) })] }), _jsx(Bottom, {})] }));
}
export default App;
//# sourceMappingURL=App.js.map