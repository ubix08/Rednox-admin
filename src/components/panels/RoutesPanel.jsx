// ============================================================
// src/components/panels/RoutesPanel.jsx
// ============================================================
import React from 'react';

export const RoutesPanel = ({ routes }) => {
  if (!routes || routes.length === 0) {
    return (
      <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
        No routes configured
      </div>
    );
  }
  
  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
        HTTP Routes ({routes.length})
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {routes.map((route, i) => (
          <div key={i} style={{
            padding: '12px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{
                padding: '2px 6px',
                background: '#1976d2',
                color: '#fff',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                {route.method}
              </span>
              <code style={{ fontSize: '11px', flex: 1 }}>{route.path}</code>
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              <div>Flow: {route.flow_name}</div>
              <div>Node: {route.node_id}</div>
              {route.fullUrl && (
                <div style={{ marginTop: '4px', wordBreak: 'break-all' }}>
                  <a 
                    href={route.fullUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#1976d2' }}
                  >
                    {route.fullUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
