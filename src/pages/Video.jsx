import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./video.css"

function Video() {
  const [files, setFiles] = useState([]);

//the code below takes the filees u upload to the database using IndexedDB then get saved in the database
//then after that the data that is saved inside the database will be cornverted back to being file again using blob


  // ============ Database Setup ============
  useEffect(() => {
    // Initialize IndexedDB when component loads
    const request = indexedDB.open('MediaDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create storage for files if it doesn't exist
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      // Load existing files from database when page loads
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => {
        const storedFiles = getRequest.result;
        //at this point the data is in ArrayBuffer format//
        
        const fileObjects = storedFiles.map(item => {
          // Create Blob from stored data
          
          const blob = new Blob([item.data], { type: item.type }); // Convert stored data from ArrayBuffer back to File objects
          // Create File object from Blob
          return new File([blob], item.name, { type: item.type, lastModified: item.lastModified });
        });
        
        // Add to your existing files state
        if (fileObjects.length > 0) {
          setFiles(prevFiles => [...prevFiles, ...fileObjects]);   //Adds restored files to your player//
        }
      };
    };
  }, []); // Empty dependency array = run once on mount
  // ============ END DATABASE SETUP ============


 const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
 
  //the code below goes through each file selected and saves it to the database

    // ============  Save each file to IndexedDB ============
    selectedFiles.forEach(file => {                            //Loop through selected files//
      const reader = new FileReader();                         //Read file content//
                                                               
      reader.onload = function(event) {                       //FileReader reads file into memory//
      // Prepare file data for storage                        //Prepare file object for database//
        const fileData = {
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          size: file.size,
          data: event.target.result, // This is the file content as ArrayBuffer
          uploadedAt: new Date().toISOString()
        };
        //at this moment this is NOT a File anymore, It’s just plain data (which IndexedDB loves)//

        // Open the same database and save the data
        const dbRequest = indexedDB.open('MediaDB', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['media'], 'readwrite');  //Open transaction so we can save the data//
          const store = transaction.objectStore('media');  //Get the object store bcos is where we gonna save our data//
          
          // Store the file data
          store.add(fileData);  
          
          console.log('Saved to database:', file.name);
        };
      };
      
      // Read file as ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
    // ============ END SAVE TO DATABASE ============
    

    // existing code unchanged
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

   return (
      <div className="right-main">

        <div className="topbar">
        <h1>Video Page</h1>

      <div className="upload-section">
        <h2 className="text-xl font-bold mb-2">Upload Media</h2>
        <input
          type="file"
          multiple
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
      </div>

        </div>

     <div className="video-main">{/*openning*/}

              {files.length === 0 && (
          <p className="text-gray-500">No files chosen yet</p>
        )}

        {files.map((file, index) => {
          const fileURL = URL.createObjectURL(file);

          if (file.type.startsWith("video/")) {
            return (
              <div key={index} className="cart-div">
                <video
                  controls
                  src={fileURL}
                  width="300"
                  className="video"
                />
                <p className="text">{file.name}</p>
              </div>
            );
          }

          return null;
        })}
      </div>{/*closing*/}
     </div>


    )
}

export default Video;