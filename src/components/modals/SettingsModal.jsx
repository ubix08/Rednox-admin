// ============================================================
// src/components/modals/SettingsModal.jsx
// ============================================================
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export const SettingsModal = ({ onClose }) => {
  const { apiUrl, setApiUrl } = useStore();
  const [url, setUrl] = useState(apiUrl);
  
  const handleSave = () => {
    setApiUrl(url);
    onClose();
    window.location.reload();
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          width: '500px',
          maxWidth: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Settings</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: 500, 
            marginBottom: '8px' 
          }}>
            API URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-worker.workers.dev"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
            Enter the URL of your RedNox backend worker
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save & Reload
          </button>
        </div>
      </div>
    </div>
  );
};
