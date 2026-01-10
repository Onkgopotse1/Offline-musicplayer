import { Link } from "react-router-dom";

function Playlist() {
  // 404 page
  return (
    <div className="right-main">

              <div className="topbar">
              <h1>Playlist Page</h1>

            </div>
            
      <h1>Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export default Playlist;