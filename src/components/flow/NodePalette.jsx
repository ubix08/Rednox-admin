// ============================================================
// src/components/flow/NodePalette.jsx - FIXED
// Calls parent onDragStart callback to store in ref
// ============================================================
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export const NodePalette = ({ onAddNode, onDragStart }) => {
  const { nodeTypes, isPaletteOpen, togglePalette } = useStore();
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(['input', 'function', 'output'])
  );
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleCategory = (category) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };
  
  // FIX: Call parent's onDragStart to store in ref
  const handleDragStart = (event, nodeType) => {
    const nodeData = JSON.stringify(nodeType);
    
    // Set both dataTransfer (standard) and call parent callback (ref storage)
    event.dataTransfer.setData('application/reactflow', nodeData);
    event.dataTransfer.setData('text/plain', nodeData); // Fallback
    event.dataTransfer.effectAllowed = 'move';
    
    // KEY FIX: Call parent's onDragStart to store in ref
    if (onDragStart) {
      onDragStart(nodeType);
    }
    
    console.log('NodePalette: Drag started for node type:', nodeType.type);
  };
  
  // Double-click to add node
  const handleDoubleClick = (node) => {
    if (onAddNode) {
      console.log('NodePalette: Double-click, adding node', node.type);
      onAddNode(node);
    }
  };
  
  // Group nodes by category
  const groupedNodes = {};
  nodeTypes.forEach(node => {
    const category = node.category || 'other';
    if (!groupedNodes[category]) {
      groupedNodes[category] = [];
    }
    groupedNodes[category].push(node);
  });
  
  // Filter by search term
  const filteredGroups = {};
  Object.keys(groupedNodes).forEach(category => {
    const filtered = groupedNodes[category].filter(node =>
      node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.ui?.paletteLabel || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredGroups[category] = filtered;
    }
  });
  
  const hasResults = Object.keys(filteredGroups).length > 0;
  
  return (
    <div style={{ position: 'relative', display: 'flex', height: '100%' }}>
      {/* Toggle Button */}
      <div 
        style={{
          width: '40px',
          background: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRight: '1px solid #1a252f',
          transition: 'background 0.2s'
        }}
        onClick={togglePalette}
        onMouseEnter={(e) => e.currentTarget.style.background = '#34495e'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#2c3e50'}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: '#fff'
        }}>
          <span style={{ fontSize: '20px' }}>📦</span>
          <span style={{
            fontSize: '10px',
            writingMode: 'vertical-rl',
            letterSpacing: '1px',
            fontWeight: 600
          }}>
            {isPaletteOpen ? 'HIDE' : 'NODES'}
          </span>
        </div>
      </div>
      
      {/* Palette Content */}
      {isPaletteOpen && (
        <div style={{
          width: '260px',
          background: '#fafafa',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px',
            background: '#fff',
            borderBottom: '1px solid #ddd'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333'
            }}>
              Node Palette
            </div>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
            
            {/* Instructions */}
            <div style={{
              fontSize: '11px',
              color: '#666',
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              💡 Drag to canvas or double-click to add
            </div>
          </div>
          
          {/* Categories */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {!hasResults ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#999',
                fontSize: '13px'
              }}>
                No nodes found for "{searchTerm}"
              </div>
            ) : (
              Object.keys(filteredGroups).sort().map(category => (
                <div key={category}>
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategory(category)}
                    style={{
                      padding: '10px 12px',
                      background: '#f0f0f0',
                      borderBottom: '1px solid #ddd',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8e8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  >
                    <span>{category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        background: '#ddd',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: '#666'
                      }}>
                        {filteredGroups[category].length}
                      </span>
                      <span style={{ fontSize: '10px' }}>
                        {expandedCategories.has(category) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Category Nodes */}
                  {expandedCategories.has(category) && (
                    <div>
                      {filteredGroups[category].map(node => (
                        <div
                          key={node.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, node)}
                          onDoubleClick={() => handleDoubleClick(node)}
                          style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#fff',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f5';
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderLeft = '3px solid #1976d2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderLeft = 'none';
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.cursor = 'grab';
                          }}
                          title={`${node.ui?.paletteLabel || node.type}\nDrag to canvas or double-click to add`}
                        >
                          <span style={{ 
                            fontSize: '18px',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {node.ui?.icon || '⚙️'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#333',
                              marginBottom: '2px'
                            }}>
                              {node.ui?.paletteLabel || node.type}
                            </div>
                            {node.ui?.description && (
                              <div style={{
                                fontSize: '11px',
                                color: '#999',
                                lineHeight: '1.3'
                              }}>
                                {node.ui.description}
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#999',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '2px'
                          }}>
                            {node.inputs > 0 && (
                              <span title="Inputs">⬅️ {node.inputs}</span>
                            )}
                            {node.outputs > 0 && (
                              <span title="Outputs">➡️ {node.outputs}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer Stats */}
          <div style={{
            padding: '8px 12px',
            background: '#f0f0f0',
            borderTop: '1px solid #ddd',
            fontSize: '11px',
            color: '#666',
            textAlign: 'center'
          }}>
            {nodeTypes.length} node types available
          </div>
        </div>
      )}
    </div>
  );
};
