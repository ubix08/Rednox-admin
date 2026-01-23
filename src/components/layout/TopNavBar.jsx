// ============================================================
// src/components/layout/TopNavBar.jsx
// ============================================================
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { flowApi } from '../../api';

const buttonStyle = {
  padding: '6px 12px',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500
};

const MenuItem = ({ children, onClick, disabled, danger }) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      padding: '10px 16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      color: disabled ? '#ccc' : danger ? '#f44336' : '#333',
      opacity: disabled ? 0.5 : 1
    }}
    onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = '#f5f5f5')}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    {children}
  </div>
);

export const TopNavBar = ({ 
  onNew, 
  onSave, 
  onExport, 
  onImport, 
  onDelete, 
  onToggle, 
  onDebug, 
  onSettings 
}) => {
  const { flows, currentFlow, stats } = useStore();
  const [showFlowMenu, setShowFlowMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  const handleFlowSelect = async (flow) => {
    try {
      const fullFlow = await flowApi.fetchFlow(flow.id);
      useStore.getState().setCurrentFlow(fullFlow);
      setShowFlowMenu(false);
    } catch (err) {
      alert('Error loading flow: ' + err.message);
    }
  };
  
  return (
    <div style={{
      height: '50px',
      background: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px'
    }}>
      {/* Flow Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowFlowMenu(!showFlowMenu)}
          style={{
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px'
          }}
        >
          <span style={{ flex: 1, textAlign: 'left', fontSize: '14px' }}>
            {currentFlow ? currentFlow.name : 'Select Flow'}
          </span>
          <span style={{ fontSize: '12px' }}>▼</span>
        </button>
        
        {showFlowMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '250px',
            maxHeight: '400px',
            overflow: 'auto',
            zIndex: 1000
          }}>
            {flows.length === 0 ? (
              <div style={{ padding: '12px', color: '#999', fontSize: '13px' }}>
                No flows available
              </div>
            ) : (
              flows.map(flow => (
                <div
                  key={flow.id}
                  onClick={() => handleFlowSelect(flow)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    background: currentFlow?.id === flow.id ? '#e3f2fd' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = currentFlow?.id === flow.id ? '#e3f2fd' : 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: flow.enabled ? '#4caf50' : '#999'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{flow.name}</div>
                      {flow.description && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          {flow.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
        <button onClick={onNew} style={buttonStyle}>➕ New</button>
        <button onClick={onSave} disabled={!currentFlow} style={buttonStyle}>💾 Save</button>
        <button onClick={onDebug} disabled={!currentFlow} style={buttonStyle}>🐛 Debug</button>
      </div>
      
      {/* Stats */}
      {stats && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          display: 'flex', 
          gap: '16px', 
          padding: '0 12px' 
        }}>
          <span>📊 {stats.flows?.total || 0} flows</span>
          <span>🔗 {stats.routes || 0} routes</span>
          <span>⚙️ {stats.nodes || 0} node types</span>
        </div>
      )}
      
      {/* Menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowActionMenu(!showActionMenu)}
          style={{ ...buttonStyle, minWidth: 'auto', padding: '6px 12px' }}
        >
          ☰
        </button>
        
        {showActionMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '180px',
            zIndex: 1000
          }}>
            <MenuItem onClick={() => { onExport(); setShowActionMenu(false); }} disabled={!currentFlow}>
              📤 Export Flow
            </MenuItem>
            <MenuItem onClick={() => { onImport(); setShowActionMenu(false); }}>
              📥 Import Flow
            </MenuItem>
            <MenuItem onClick={() => { onToggle(); setShowActionMenu(false); }} disabled={!currentFlow}>
              {currentFlow?.enabled ? '⏸️ Disable' : '▶️ Enable'} Flow
            </MenuItem>
            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
            <MenuItem onClick={() => { onDelete(); setShowActionMenu(false); }} disabled={!currentFlow} danger>
              🗑️ Delete Flow
            </MenuItem>
            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
            <MenuItem onClick={() => { onSettings(); setShowActionMenu(false); }}>
              ⚙️ Settings
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  );
};
