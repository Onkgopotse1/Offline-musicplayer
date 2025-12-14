import { Link } from "react-router-dom";


function Playqueue() {
  // 404 page
  return (
    <div className="right-main">

              <div className="topbar">
              <h1>Playqueue Page</h1>

            </div>
            
      <h1>Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export default Playqueue;