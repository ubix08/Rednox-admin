// ============================================================
// src/utils/converters.js - FIXED OBJECT HANDLING
// ============================================================
import { useStore } from '../store/useStore';
import { MarkerType } from 'reactflow';

// Helper function to safely extract primitive values
const safeValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object') {
    // If it's an object with a 'value' property, extract that
    if ('value' in value) {
      return safeValue(value.value);
    }
    // Otherwise convert to string
    return JSON.stringify(value);
  }
  return String(value);
};

// Helper to clean node data - remove or stringify any objects
const cleanNodeData = (data) => {
  const cleaned = {};
  
  for (const key in data) {
    const value = data[key];
    
    // Skip functions
    if (typeof value === 'function') continue;
    
    // Handle specific known fields
    if (key === 'ui' && typeof value === 'object') {
      cleaned[key] = {
        icon: safeValue(value.icon) || '⚙️',
        color: safeValue(value.color) || '#dddddd',
        paletteLabel: safeValue(value.paletteLabel) || '',
        description: safeValue(value.description) || ''
      };
      continue;
    }
    
    // Handle primitives directly
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      cleaned[key] = value;
      continue;
    }
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      cleaned[key] = '';
      continue;
    }
    
    // For any other objects, convert to safe string
    if (typeof value === 'object') {
      // Try to extract 'value' property if it exists
      if ('value' in value) {
        cleaned[key] = safeValue(value.value);
      } else {
        // Store as JSON string for later parsing if needed
        cleaned[key + '_json'] = JSON.stringify(value);
        cleaned[key] = '[Object]';
      }
    }
  }
  
  return cleaned;
};

export const convertToReactFlowNodes = (rednoxNodes) => {
  if (!rednoxNodes || !Array.isArray(rednoxNodes)) {
    return [];
  }
  
  const nodeTypes = useStore.getState().nodeTypes;
  
  return rednoxNodes.map((node, index) => {
    const nodeDef = nodeTypes.find(nt => nt.type === node.type);
    
    // Build safe data object
    const rawData = {
      ...node,
      type: node.type,
      label: node.name || nodeDef?.ui?.paletteLabel || node.type,
      inputs: nodeDef?.inputs ?? node.inputs ?? 1,
      outputs: nodeDef?.outputs ?? node.outputs ?? 1,
      ui: nodeDef?.ui || node.ui || { icon: '⚙️', color: '#dddddd' }
    };
    
    // Clean the data to ensure no objects are rendered
    const cleanedData = cleanNodeData(rawData);
    
    return {
      id: node.id,
      type: 'customNode',
      position: node.x !== undefined && node.y !== undefined 
        ? { x: node.x, y: node.y } 
        : { x: 100 + (index % 5) * 200, y: 100 + Math.floor(index / 5) * 150 },
      data: cleanedData
    };
  });
};

export const convertToReactFlowEdges = (rednoxNodes) => {
  if (!rednoxNodes || !Array.isArray(rednoxNodes)) {
    return [];
  }
  
  const edges = [];
  
  rednoxNodes.forEach((node) => {
    if (!node.wires || !Array.isArray(node.wires)) {
      return;
    }
    
    node.wires.forEach((outputWires, outputIndex) => {
      if (!Array.isArray(outputWires)) {
        return;
      }
      
      outputWires.forEach((targetId) => {
        if (!targetId) return;
        
        edges.push({
          id: `${node.id}-${outputIndex}-${targetId}-${Math.random()}`,
          source: node.id,
          target: targetId,
          sourceHandle: `output-${outputIndex}`,
          targetHandle: `input-0`,
          type: 'default',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      });
    });
  });
  
  return edges;
};

export const convertToRedNoxFormat = (rfNodes, rfEdges) => {
  return rfNodes.map(rfNode => {
    const nodeData = rfNode.data;
    const wires = [];
    
    const nodeEdges = rfEdges.filter(e => e.source === rfNode.id);
    const outputCount = nodeData.outputs || 1;
    
    for (let i = 0; i < outputCount; i++) {
      const outputEdges = nodeEdges.filter(e => e.sourceHandle === `output-${i}`);
      wires.push(outputEdges.map(e => e.target));
    }
    
    // Build the node object, excluding react-flow specific fields
    const rednoxNode = {
      id: rfNode.id,
      type: nodeData.type,
      name: nodeData.name || '',
      x: Math.round(rfNode.position.x),
      y: Math.round(rfNode.position.y),
      wires
    };
    
    // Add custom properties, excluding known react-flow fields
    const excludeKeys = ['type', 'label', 'inputs', 'outputs', 'ui', 'id'];
    
    for (const key in nodeData) {
      if (!excludeKeys.includes(key)) {
        // Skip _json fields (those are internal)
        if (key.endsWith('_json')) {
          // Try to parse and add the original object
          const originalKey = key.replace('_json', '');
          try {
            rednoxNode[originalKey] = JSON.parse(nodeData[key]);
          } catch (e) {
            // If parsing fails, skip it
          }
        } else {
          rednoxNode[key] = nodeData[key];
        }
      }
    }
    
    return rednoxNode;
  });
};