import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import './Home.css';
;
export default function Home() {
    // State holds actual File objects for rendering
    const [files, setFiles] = useState([]);
    // ============ Database Setup ============
    useEffect(() => {
        // Initialize IndexedDB when component loads
        const request = indexedDB.open("MediaDB", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create storage for files if it doesn't exist
            if (!db.objectStoreNames.contains("media")) {
                db.createObjectStore("media", { keyPath: "id", autoIncrement: true });
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
                // Add to your existing files state
                if (fileObjects.length > 0) {
                    setFiles((prevFiles) => [...prevFiles, ...fileObjects]);
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
                    name: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    size: file.size,
                    data: event.target?.result, // This is the file content as ArrayBuffer
                    uploadedAt: new Date().toISOString(),
                };
                // at this moment this is NOT a File anymore, It’s just plain data (which IndexedDB loves)//
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
        // Update state to render selected files immediately
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };
    return (_jsxs("div", { className: "right-main", children: [_jsxs("div", { className: "topbar", children: [_jsx("h1", { children: "Home Page" }), _jsxs("div", { className: "upload-section", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "Upload Media" }), _jsx("input", { type: "file", multiple: true, accept: "audio/*,video/*", onChange: handleFileChange, className: "border p-2 rounded" })] })] }), _jsxs("div", { className: "main", children: [files.length === 0 && (_jsx("p", { className: "text-gray-500", children: "No files chosen yet" })), files.map((file, index) => {
                        const fileURL = URL.createObjectURL(file);
                        if (file.type.startsWith("audio/")) {
                            return (_jsxs("div", { className: "cart-div", children: [_jsx("audio", { controls: true, src: fileURL, className: "audio" }), _jsx("p", { className: "text", children: file.name })] }, index));
                        }
                        if (file.type.startsWith("video/")) {
                            return (_jsxs("div", { className: "cart-div", children: [_jsx("video", { controls: true, src: fileURL, width: "300", className: "video" }), _jsx("p", { className: "text", children: file.name })] }, index));
                        }
                        return null;
                    })] })] }));
}
//# sourceMappingURL=Home.js.map