import React from "react";
import { Link } from "react-router-dom";

function Notfound() {
  // 404 page
  return (
    <div className="right-main">

              <div className="topbar">
              topbar

            </div>
            
      <h1>Not Found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

export default Notfound;