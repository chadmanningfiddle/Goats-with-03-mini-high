import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css'; // ✅ Ensure styles load

console.log("✅ main.jsx loaded"); // ✅ Debugging step

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ #root not found! Check index.html.");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}