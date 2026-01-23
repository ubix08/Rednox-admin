// ============================================================
// src/utils/debugUtils.js - Find problematic object values
// ============================================================

/**
 * Recursively scan an object for nested objects that might cause React errors
 * @param {any} obj - Object to scan
 * @param {string} path - Current path (for debugging)
 * @returns {Array} - Array of problematic paths
 */
export const findProblematicObjects = (obj, path = 'root') => {
  const problems = [];
  
  if (obj === null || obj === undefined) {
    return problems;
  }
  
  if (typeof obj !== 'object') {
    return problems;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      problems.push(...findProblematicObjects(item, `${path}[${index}]`));
    });
    return problems;
  }
  
  // Check if this object has a 'value' key (common culprit)
  if ('value' in obj && typeof obj.value === 'object' && obj.value !== null) {
    problems.push({
      path: `${path}.value`,
      value: obj.value,
      message: 'Object with nested value property'
    });
  }
  
  // Scan all properties
  for (const key in obj) {
    const value = obj[key];
    
    // Skip functions and null
    if (typeof value === 'function' || value === null) {
      continue;
    }
    
    // If it's an object (but not array), it might be problematic
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Special handling for known safe objects
      if (key === 'ui' || key === 'position' || key === 'data') {
        // These are expected to be objects, scan deeper
        problems.push(...findProblematicObjects(value, `${path}.${key}`));
      } else {
        // This might be rendered directly
        problems.push({
          path: `${path}.${key}`,
          value: value,
          keys: Object.keys(value),
          message: 'Potentially renderable object'
        });
      }
    }
  }
  
  return problems;
};

/**
 * Clean node data by converting all nested objects to safe values
 * @param {object} nodeData - Node data to clean
 * @returns {object} - Cleaned node data
 */
export const cleanNodeDataDeep = (nodeData) => {
  if (!nodeData || typeof nodeData !== 'object') {
    return nodeData;
  }
  
  const cleaned = {};
  
  for (const key in nodeData) {
    const value = nodeData[key];
    
    // Skip functions
    if (typeof value === 'function') {
      continue;
    }
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      cleaned[key] = value;
      continue;
    }
    
    // Handle primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item => 
        typeof item === 'object' && item !== null ? cleanNodeDataDeep(item) : item
      );
      continue;
    }
    
    // Handle objects
    if (typeof value === 'object') {
      // Special cases for known object fields
      if (key === 'ui') {
        cleaned[key] = {
          icon: String(value.icon || '⚙️'),
          color: String(value.color || '#dddddd'),
          paletteLabel: String(value.paletteLabel || ''),
          description: String(value.description || '')
        };
      } else if (key === 'position') {
        cleaned[key] = {
          x: Number(value.x || 0),
          y: Number(value.y || 0)
        };
      } else {
        // For other objects, check if they have a 'value' property
        if ('value' in value) {
          // Extract the value property
          const extracted = value.value;
          if (typeof extracted === 'string' || typeof extracted === 'number' || typeof extracted === 'boolean') {
            cleaned[key] = extracted;
          } else {
            cleaned[key] = JSON.stringify(value);
          }
        } else {
          // Convert to JSON string
          cleaned[key] = JSON.stringify(value);
        }
      }
    }
  }
  
  return cleaned;
};

/**
 * Log node data structure for debugging
 * @param {object} nodeData - Node data to log
 * @param {string} label - Label for the log
 */
export const logNodeStructure = (nodeData, label = 'Node Data') => {
  console.group(`🔍 ${label}`);
  console.log('Raw data:', nodeData);
  
  const problems = findProblematicObjects(nodeData);
  if (problems.length > 0) {
    console.warn('⚠️ Found problematic objects:', problems);
  } else {
    console.log('✅ No problematic objects found');
  }
  
  console.groupEnd();
};

/**
 * Add to window for easy debugging in console
 */
if (typeof window !== 'undefined') {
  window.debugNode = {
    findProblematicObjects,
    cleanNodeDataDeep,
    logNodeStructure
  };
}
