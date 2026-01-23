// ============================================================
// src/components/flow/FlowEditor.jsx - FIXED DRAG & DROP
// Using useRef to bypass browser dataTransfer clearing
// ============================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import { useStore } from '../../store/useStore';
import { NodePalette } from './NodePalette';
import { FlowCanvas } from './FlowCanvas';
import { Sidebar } from '../layout/Sidebar';
import { convertToReactFlowNodes, convertToReactFlowEdges } from '../../utils/converters';
import { createNodeFromType } from '../../utils/nodeFactory';
import { logNodeStructure } from '../../utils/debugUtils';

export const FlowEditor = () => {
  const currentFlow = useStore((state) => state.currentFlow);
  const setReactFlowNodes = useStore((state) => state.setReactFlowNodes);
  const setReactFlowEdges = useStore((state) => state.setReactFlowEdges);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const selectedNode = useStore((state) => state.selectedNode);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const nodeCounterRef = useRef(0);
  
  // KEY FIX: Store dragged node type in ref to bypass dataTransfer clearing
  const draggedTypeRef = useRef(null);
  
  // Add node to canvas
  const addNodeToCanvas = useCallback((nodeTypeData, position = null) => {
    if (!position) {
      const offset = nodeCounterRef.current * 20;
      position = { 
        x: 250 + offset, 
        y: 150 + offset 
      };
      nodeCounterRef.current = (nodeCounterRef.current + 1) % 10;
    }
    
    const newNode = createNodeFromType(nodeTypeData, position);
    console.log('FlowEditor: Adding node to canvas:', newNode);
    logNodeStructure(newNode.data, 'New Node Data');
    
    setNodes((nds) => {
      const updated = [...nds, newNode];
      console.log('FlowEditor: Updated nodes array:', updated);
      return updated;
    });
    
    setTimeout(() => {
      setSelectedNode(newNode);
    }, 50);
  }, [setNodes, setSelectedNode]);
  
  // Sync nodes and edges to store
  useEffect(() => {
    console.log('FlowEditor: Syncing to store - nodes:', nodes.length, 'edges:', edges.length);
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);
  }, [nodes, edges, setReactFlowNodes, setReactFlowEdges]);
  
  // Load flow when currentFlow changes
  useEffect(() => {
    if (!currentFlow) {
      setNodes([]);
      setEdges([]);
      return;
    }
    
    try {
      let config;
      
      if (typeof currentFlow.config === 'string') {
        config = JSON.parse(currentFlow.config);
      } else if (currentFlow.config && typeof currentFlow.config === 'object') {
        config = currentFlow.config;
      } else {
        setNodes([]);
        setEdges([]);
        return;
      }
      
      const nodesArray = Array.isArray(config.nodes) ? config.nodes : [];
      
      if (nodesArray.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      
      const rfNodes = convertToReactFlowNodes(nodesArray);
      const rfEdges = convertToReactFlowEdges(nodesArray);
      
      setNodes(rfNodes);
      setEdges(rfEdges);
      
      const timeoutId = setTimeout(() => {
        if (reactFlowInstance && rfNodes.length > 0) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
      
    } catch (err) {
      console.error('Error loading flow:', err);
      setNodes([]);
      setEdges([]);
    }
  }, [currentFlow, setNodes, setEdges, reactFlowInstance]);
  
  // Connection handler
  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) {
      console.warn('Cannot connect: source or target node not found');
      return;
    }
    
    const existingEdge = edges.find(
      e => e.source === params.source && 
           e.target === params.target &&
           e.sourceHandle === params.sourceHandle &&
           e.targetHandle === params.targetHandle
    );
    
    if (existingEdge) {
      console.warn('Connection already exists');
      return;
    }
    
    setEdges((eds) => {
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.sourceHandle || 'out'}-${params.target}-${params.targetHandle || 'in'}-${Date.now()}`,
        type: 'default',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed }
      };
      return addEdge(newEdge, eds);
    });
  }, [setEdges, nodes, edges]);
  
  // ============================================================
  // DRAG & DROP - FIXED WITH REF PATTERN
  // ============================================================
  
  // Handle drag start - store node type in ref
  const onDragStart = useCallback((nodeTypeData) => {
    console.log('FlowEditor: Drag started, storing in ref:', nodeTypeData);
    draggedTypeRef.current = nodeTypeData;
  }, []);
  
  // Allow drop on the wrapper
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle the drop event
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    // CRITICAL: Check if reactFlowInstance exists
    if (!reactFlowInstance) {
      console.error('ReactFlow instance not initialized');
      alert('Canvas not ready. Please wait a moment and try again.');
      return;
    }
    
    // KEY FIX: Read from ref instead of dataTransfer
    const nodeTypeData = draggedTypeRef.current;
    
    if (!nodeTypeData) {
      console.error('No node data in draggedTypeRef');
      // Fallback: try to get from dataTransfer
      let dataTransferData = event.dataTransfer.getData('application/reactflow');
      if (!dataTransferData) {
        dataTransferData = event.dataTransfer.getData('text/plain');
      }
      
      if (dataTransferData) {
        try {
          const parsed = JSON.parse(dataTransferData);
          console.log('Recovered from dataTransfer:', parsed);
          draggedTypeRef.current = parsed;
        } catch (err) {
          console.error('Failed to parse fallback data:', err);
          return;
        }
      } else {
        return;
      }
    }
    
    console.log('FlowEditor: Drop event, node data:', draggedTypeRef.current);
    
    // Get the bounding rect of the wrapper
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    
    if (!reactFlowBounds) {
      console.error('Could not get ReactFlow bounds');
      return;
    }
    
    // Convert screen coordinates to flow coordinates
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    
    console.log('Drop position:', position);
    console.log('Screen coords:', { x: event.clientX, y: event.clientY });
    console.log('Bounds:', reactFlowBounds);
    
    // Create the new node
    const newNode = createNodeFromType(draggedTypeRef.current, position);
    
    console.log('Created node:', newNode);
    
    // Add to nodes array
    setNodes((nds) => {
      const updated = [...nds, newNode];
      console.log('Updated nodes array:', updated);
      return updated;
    });
    
    // Auto-select
    setTimeout(() => {
      setSelectedNode(newNode);
    }, 50);
    
    // Clear the ref after successful drop
    draggedTypeRef.current = null;
    
  }, [reactFlowInstance, setNodes, setSelectedNode]);
  
  // ============================================================
  // END DRAG & DROP
  // ============================================================
  
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setContextMenu(null);
  }, [setSelectedNode]);
  
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    console.log('Edge clicked:', edge);
  }, []);
  
  const onPaneClick = useCallback((event) => {
    setSelectedNode(null);
    setContextMenu(null);
  }, [setSelectedNode]);
  
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      nodeId: node.id,
      top: event.clientY,
      left: event.clientX,
    });
    
    setSelectedNode(node);
  }, [setSelectedNode]);
  
  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    
    if (!reactFlowInstance || !reactFlowWrapper.current) return;
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    
    setContextMenu({
      nodeId: null,
      top: event.clientY,
      left: event.clientX,
      position: position
    });
  }, [reactFlowInstance]);
  
  const deleteNodes = useCallback((nodeIds) => {
    if (!nodeIds || nodeIds.length === 0) return;
    
    const confirmMsg = nodeIds.length === 1 
      ? 'Delete this node?' 
      : `Delete ${nodeIds.length} nodes?`;
    
    if (!window.confirm(confirmMsg)) return;
    
    setNodes((nds) => nds.filter(n => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter(e => 
      !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
    ));
    setContextMenu(null);
    setSelectedNode(null);
  }, [setNodes, setEdges, setSelectedNode]);
  
  const duplicateNode = useCallback((nodeId) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;
    
    const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      ...nodeToDuplicate,
      id: newId,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      },
      data: {
        ...nodeToDuplicate.data,
        id: newId,
        name: nodeToDuplicate.data.name ? `${nodeToDuplicate.data.name} (copy)` : ''
      },
      selected: false
    };
    
    setNodes((nds) => [...nds, newNode]);
    setContextMenu(null);
    
    setTimeout(() => {
      setSelectedNode(newNode);
    }, 50);
  }, [nodes, setNodes, setSelectedNode]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
        if (selectedNodeIds.length > 0) {
          deleteNodes(selectedNodeIds);
        }
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        if (selectedNode) {
          duplicateNode(selectedNode.id);
        }
      }
      
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setContextMenu(null);
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        setNodes((nds) => nds.map(n => ({ ...n, selected: true })));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, selectedNode, deleteNodes, duplicateNode, setNodes, setSelectedNode]);
  
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleScroll = () => setContextMenu(null);
    
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);
  
  const updateNodeData = useCallback((updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === updatedData.id
          ? { ...node, data: { ...node.data, ...updatedData } }
          : node
      )
    );
    
    if (selectedNode && selectedNode.id === updatedData.id) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...updatedData } });
    }
  }, [setNodes, selectedNode, setSelectedNode]);
  
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 110px)' }}>
      <NodePalette onAddNode={addNodeToCanvas} onDragStart={onDragStart} />
      
      {/* CRITICAL: Wrapper must have onDrop and onDragOver */}
      <div 
        ref={reactFlowWrapper}
        style={{ flex: 1, position: 'relative' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          currentFlow={currentFlow}
        />
      </div>
      
      <Sidebar 
        selectedNodeData={selectedNode?.data}
        onUpdateNode={updateNodeData} 
      />
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.top,
            left: contextMenu.left,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 10000,
            minWidth: '180px',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.nodeId ? (
            <>
              <div
                onClick={() => duplicateNode(contextMenu.nodeId)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <span>📋</span>
                <span>Duplicate</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#999' }}>Ctrl+D</span>
              </div>
              <div style={{ height: '1px', background: '#f0f0f0' }} />
              <div
                onClick={() => deleteNodes([contextMenu.nodeId])}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#f44336',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ffebee'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <span>🗑️</span>
                <span>Delete</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#999' }}>Del</span>
              </div>
            </>
          ) : (
            <div style={{
              padding: '10px 16px',
              fontSize: '13px',
              color: '#999',
              textAlign: 'center'
            }}>
              Right-click on nodes for options
            </div>
          )}
        </div>
      )}
    </div>
  );
};