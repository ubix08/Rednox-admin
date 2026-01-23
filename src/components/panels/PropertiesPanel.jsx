// ============================================================
// src/components/panels/PropertiesPanel.jsx - FIXED OBJECT RENDERING
// ============================================================
import React from 'react';

// Helper to safely display any value
const displayValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

export const PropertiesPanel = ({ nodeData, onUpdate }) => {
  if (!nodeData) {
    return (
      <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
        Select a node to edit properties
      </div>
    );
  }
  
  const handleNameChange = (e) => {
    onUpdate({ ...nodeData, name: e.target.value });
  };
  
  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
        {displayValue(nodeData.ui?.paletteLabel || nodeData.label || nodeData.type)}
      </h3>
      
      <div>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
          Name
        </label>
        <input
          type="text"
          value={displayValue(nodeData.name)}
          onChange={handleNameChange}
          placeholder="Optional node name"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        />
      </div>
      
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <div><strong>Type:</strong> {displayValue(nodeData.type)}</div>
        <div><strong>ID:</strong> {displayValue(nodeData.id)}</div>
        <div><strong>Inputs:</strong> {displayValue(nodeData.inputs)}</div>
        <div><strong>Outputs:</strong> {displayValue(nodeData.outputs)}</div>
      </div>
      
      {/* Additional properties */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
          Properties
        </h4>
        {Object.keys(nodeData).map(key => {
          // Skip internal/display fields
          if (['id', 'type', 'name', 'label', 'inputs', 'outputs', 'ui'].includes(key)) {
            return null;
          }
          
          // Skip _json fields
          if (key.endsWith('_json')) {
            return null;
          }
          
          const value = nodeData[key];
          
          return (
            <div key={key} style={{
              padding: '8px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '8px',
              fontSize: '11px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{key}</div>
              <div style={{ color: '#666', wordBreak: 'break-word' }}>
                {displayValue(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
