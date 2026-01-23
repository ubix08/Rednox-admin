// ============================================================
// src/components/layout/Header.jsx
// ============================================================
import React from 'react';
import { APP_NAME, APP_VERSION } from '../../utils/constants';

export const Header = () => {
  return (
    <div style={{
      height: '60px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      color: '#fff'
    }}>
      <div style={{ fontSize: '24px', marginRight: '12px' }}>🔴</div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700 }}>{APP_NAME}</div>
        <div style={{ fontSize: '11px', opacity: 0.9 }}>Flow Editor v{APP_VERSION}</div>
      </div>
    </div>
  );
};


