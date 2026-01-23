// ============================================================
// src/index.js or src/main.jsx - CRITICAL CSS IMPORT
// ============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// CRITICAL: Import ReactFlow CSS - Without this, nodes are invisible!
import 'reactflow/dist/style.css';

// Optional: Your custom styles
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
