import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, } from "react";
import './Music.css';
function MyMusicUi() {
    // State holds actual File objects for rendering
    const [files, setFiles] = useState([]);
    const [currentMediaId, setCurrentMediaId] = useState(null);
    const [isplaying, setIsPlaying] = useState(false);
    ////////🛠️ Helper Function/////////////////
    const parseFileName = (file) => {
        // Split on the first dash
        const parts = file.name.split("-");
        if (parts.length < 2) {
            // No dash found → fallback
            return { artist: "Unknown Artist", song: file.name };
        }
        const firstPart = parts[0].trim();
        const secondPart = parts[1].replace(/\.[^/.]+$/, "").trim(); // remove extension
        // Logic: if first part looks like a word/letters, treat as artist
        // if first part looks like numbers, treat as song
        if (/^[A-Za-z]/.test(firstPart)) {
            return { artist: firstPart, song: secondPart };
        }
        else {
            return { song: firstPart, artist: secondPart };
        }
    };
    ////////🛠️ END Helper Function/////////////////
    // ============ Database Setup ============
    useEffect(() => {
        // Initialize IndexedDB when component loads
        const request = indexedDB.open("MediaDB", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create storage for files if it doesn't exist
            if (!db.objectStoreNames.contains("media")) {
                db.createObjectStore("media", { keyPath: "id" });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            // Load existing files from database when page loads
            const transaction = db.transaction(["media"], "readonly");
            const store = transaction.objectStore("media");
            const getRequest = store.getAll();
            getRequest.onsuccess = () => {
                const storedFiles = getRequest.result;
                //at this point the data is in ArrayBuffer format//
                const fileObjects = storedFiles.map((item) => {
                    // Create Blob from stored data
                    const blob = new Blob([item.data], { type: item.type }); // Convert stored data from ArrayBuffer back to File objects
                    // Create File object from Blob
                    return new File([blob], item.name, {
                        type: item.type,
                        lastModified: item.lastModified,
                    });
                });
                // Add that fileObject to your existing files state
                if (fileObjects.length > 0) {
                    setFiles(storedFiles);
                }
            };
        };
    }, []); // Empty dependency array = run once on mount
    // ============ END DATABASE SETUP ============
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files ?? []);
        //the code below goes through each file selected and saves it to the database
        // ============ ADD THIS: Save each file to IndexedDB ============
        selectedFiles.forEach((file) => {
            const reader = new FileReader(); //Read file content//
            reader.onload = (event) => {
                const fileData = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    size: file.size,
                    data: event.target?.result, // This is the file content as ArrayBuffer
                    uploadedAt: new Date().toISOString(),
                }; // gets saved to indexedDB
                // at this moment this is NOT a File anymore, It’s just plain data (which IndexedDB loves)//
                //SAVE TO STATE HERE
                setFiles(prev => [...prev, fileData]);
                // Open the same database and save the data
                const dbRequest = indexedDB.open("MediaDB", 1);
                dbRequest.onsuccess = () => {
                    const db = dbRequest.result;
                    const transaction = db.transaction(["media"], "readwrite"); //Open transaction so we can save the data//
                    const store = transaction.objectStore("media"); //Get the object store bcos is where we gonna save our data//
                    // Store the file data
                    store.add(fileData);
                    console.log("Saved to database:", file.name);
                };
            };
            // Read file as ArrayBuffer
            reader.readAsArrayBuffer(file);
        });
        // ============ END SAVE TO DATABASE ============
    };
    const handleplay = (id) => {
        setCurrentMediaId(id);
        setIsPlaying(true);
    };
    return (_jsxs("div", { className: "right-main", children: [_jsxs("div", { className: "topbar", children: [_jsx("h1", { children: "Music Page" }), _jsxs("div", { className: "upload-section", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "Upload Media" }), _jsx("input", { type: "file", multiple: true, accept: "audio/*", onChange: handleFileChange, className: "border p-2 rounded" })] })] }), _jsxs("div", { className: "music-main", children: [files.length === 0 && (_jsx("p", { className: "text-gray-500", children: "No files chosen yet" })), files.map((item) => {
                        const blob = new Blob([item.data], { type: item.type });
                        const fileURL = URL.createObjectURL(blob);
                        const { artist, song } = parseFileName(item); //Parse artist and song from filename//
                        const currentfile = files.find(f => f.id === currentMediaId);
                        if (item.type.startsWith("audio/")) {
                            return (_jsxs("div", { className: "horizontal-divs", children: [_jsx("div", { className: "check-box", children: _jsx("input", { type: "checkbox", className: "checkbox" }) }), _jsx("div", { className: "play", children: _jsx("button", { onClick: () => handleplay(item.id), className: "play-button", children: "\u25B6" }) }), _jsx("div", { className: "song-name", children: _jsx("p", { className: "text", children: song }) }), _jsx("div", { className: "artist-name", children: _jsx("p", { className: "text", children: artist }) }), _jsx("div", { className: "album-name", children: _jsx("p", { className: "text", children: "album's name" }) }), _jsx("div", { className: "genre", children: _jsx("p", { className: "text", children: "genre name" }) }), _jsx("div", { className: "time", children: _jsx("p", { className: "text", children: "time" }) })] }, `${item.id}`));
                        }
                        return null;
                    })] })] }));
}
;
function MyMusic() {
    return (_jsx(MyMusicUi, {}));
}
;
export default MyMusic;
//# sourceMappingURL=Music.js.map