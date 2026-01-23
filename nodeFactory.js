// ============================================================
// src/utils/nodeFactory.js - VERIFIED STRUCTURE
// ============================================================
export const generateNodeId = () => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createNodeFromType = (nodeTypeData, position) => {
  const newId = generateNodeId();
  
  const newNode = {
    id: newId,
    type: 'customNode', // CRITICAL: This must match the key in nodeTypes object
    position: position || { x: 250, y: 150 },
    data: {
      id: newId,
      type: nodeTypeData.type,
      name: '',
      label: nodeTypeData.ui?.paletteLabel || nodeTypeData.type,
      inputs: nodeTypeData.inputs || 1,
      outputs: nodeTypeData.outputs || 1,
      ui: nodeTypeData.ui || { icon: '⚙️', color: '#dddddd' },
      ...(nodeTypeData.defaults || {})
    }
  };
  
  console.log('nodeFactory: Created node:', newNode);
  
  return newNode;
};