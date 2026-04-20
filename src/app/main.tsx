import { createRoot } from 'react-dom/client'
import '../global styles/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
// Apply persisted theme and accent before React mounts to avoid flash
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(savedTheme === 'light' ? 'theme-light' : 'theme-dark');
  }
  const savedAccent = localStorage.getItem('accent');
  if (savedAccent) {
    document.documentElement.style.setProperty('--accent-color', savedAccent);
  }
} catch {}

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
