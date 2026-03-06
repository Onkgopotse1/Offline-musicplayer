import { Link } from "react-router-dom"
import ErrorBoundary from "../Error boundaries/Error boundry.tsx";

export default function RightMain() {

    return( 
      
        <div className="right-main">

            <div className="topbar">
              topbar

            </div>

            {/* Main giv */}
            <ErrorBoundary>
              <div className="main">
               main
              </div>
            </ErrorBoundary>
        </div> 
    )  
}