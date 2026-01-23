// ============================================================
// src/components/flow/FlowCanvas.jsx - FIXED RENDERING
// Note: ReactFlow CSS must be imported in index.js/main.jsx
// ============================================================
import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, Panel } from 'reactflow';
import { CustomNode } from './CustomNode';
import { GRID_SIZE } from '../../utils/constants';

const nodeTypes = {
  customNode: CustomNode
};

export const FlowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onNodeContextMenu,
  onPaneContextMenu,
  currentFlow
}) => {
  console.log('FlowCanvas render - nodes:', nodes.length, nodes);
  console.log('FlowCanvas render - edges:', edges.length);
  
  return (
    <div style={{ width: '100%', height: '100%', background: '#f9f9f9', position: 'relative' }}>
      {!currentFlow && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#999',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>No Flow Selected</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Select a flow from the dropdown or create a new one
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        fitView={false}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          markerEnd: { type: 'arrowclosed' }
        }}
        proOptions={{ hideAttribution: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#aaa" gap={GRID_SIZE} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data?.ui?.color || '#dddddd'}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        {currentFlow && (
          <Panel position="top-left" style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {currentFlow.name}
            </div>
            <div style={{ color: '#666' }}>
              {nodes.length} nodes • {edges.length} connections
            </div>
            {nodes.length === 0 && (
              <div style={{ color: '#1976d2', marginTop: '4px', fontSize: '11px' }}>
                💡 Drag nodes from palette or double-click palette items
              </div>
            )}
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
