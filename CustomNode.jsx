// ============================================================
// src/components/flow/CustomNode.jsx - FIXED VISIBILITY
// ============================================================
import React from 'react';
import { Handle, Position } from 'reactflow';

export const CustomNode = ({ data, isConnectable, selected }) => {
  const inputCount = data.inputs || 0;
  const outputCount = data.outputs || 1;
  const icon = data.ui?.icon || '⚙️';
  const color = data.ui?.color || '#dddddd';
  const label = data.label || data.type;
  
  console.log('CustomNode render:', {
    id: data.id,
    type: data.type,
    label,
    inputCount,
    outputCount,
    selected
  });
  
  return (
    <div
      style={{
        background: selected ? '#e3f2fd' : '#fff',
        border: `2px solid ${selected ? '#1976d2' : color}`,
        borderRadius: '6px',
        padding: '8px 12px',
        minWidth: '120px',
        boxShadow: selected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 1
      }}
    >
      {/* Input handles */}
      {inputCount > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          id="input-0"
          isConnectable={isConnectable}
          style={{
            background: '#555',
            width: '10px',
            height: '10px',
            border: '2px solid #fff',
            left: '-6px'
          }}
        />
      )}
      
      {/* Node content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#333' }}>
            {label}
          </div>
          {data.name && data.name !== label && (
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
              {data.type}
            </div>
          )}
        </div>
      </div>
      
      {/* Output handles */}
      {Array.from({ length: outputCount }).map((_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={`output-${i}`}
          isConnectable={isConnectable}
          style={{
            background: '#555',
            width: '10px',
            height: '10px',
            border: '2px solid #fff',
            right: '-6px',
            top: outputCount === 1 ? '50%' : `${((i + 1) / (outputCount + 1)) * 100}%`
          }}
        />
      ))}
      
      {/* Status indicator */}
      {data.enabled === false && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#f44336',
          border: '2px solid #fff',
          zIndex: 2
        }} />
      )}
    </div>
  );
};