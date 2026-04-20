import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";


function Playqueue() {

          const [isChecked, setIsChecked] = React.useState(false);

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setIsChecked(e.target.checked);
          };
  
  return (
    <div className="right-main">

              <div className="topbar">
              <h1 className="topbar-h1">Playqueue Page</h1>

            </div>
            
      <h1>Not Found</h1>
      <Link to="/">Go to Home</Link>

            <label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
              />
              Accept terms
            </label>
          
    </div>
  );
}

export default Playqueue;