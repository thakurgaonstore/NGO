import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Unconditionally enforce light theme across all pages
try {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
  localStorage.removeItem('theme');
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
