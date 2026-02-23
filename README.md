🎧 Offline Music Player (React + TypeScript)

A modern offline media player web app that allows users to import, store, and play audio and video files locally using IndexedDB. Built with React and TypeScript.

---
Features

- **Offline media storage using IndexedDB**
- Import and persist audio and video files locally
- Automatic media restoration after page reload
- Audio, video, and image preview player
- Dynamic media type detection and rendering
- Modular React component architecture
- Sidebar navigation and multi-page layout (Music, Video, Playlist, PlayQueue Settings)

---

🧠 Tech Stack

- React  
- TypeScript  
- IndexedDB  
- Vite  
- HTML5 Media APIs  
- CSS  

---

 🛠 How It Works

1. User imports media files  
2. Files are stored as ArrayBuffers in IndexedDB  
3. On reload, files are restored and converted back to Blob/File  
4. Media is rendered dynamically based on file type  

---

Getting Started:

```bash
git clone https://github.com/Onkgopotse1/Offline-musicplayer.git
cd Offline-musicplayer
npm install
npm run dev
