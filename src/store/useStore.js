// ============================================================
// src/store/useStore.js
// ============================================================
import { create } from 'zustand';

export const useStore = create((set) => ({
  // API Configuration
  apiUrl: 'https://rednox.ubixsnow08.workers.dev',
  
  // Flow Management
  flows: [],
  currentFlow: null,
  
  // Node Types
  nodeTypes: [],
  nodeCategories: [],
  
  // ReactFlow State
  reactFlowNodes: [],
  reactFlowEdges: [],
  
  // UI State
  selectedNode: null,
  activeTab: 'properties',
  isPaletteOpen: true,
  isSidebarOpen: true,
  
  // Additional Data
  routes: [],
  stats: null,
  debugResults: null,
  
  // Actions
  setApiUrl: (url) => set({ apiUrl: url }),
  setFlows: (flows) => set({ flows }),
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  setNodeTypes: (types) => set({ nodeTypes: types }),
  setNodeCategories: (cats) => set({ nodeCategories: cats }),
  setReactFlowNodes: (nodes) => set({ reactFlowNodes: nodes }),
  setReactFlowEdges: (edges) => set({ reactFlowEdges: edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  togglePalette: () => set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setRoutes: (routes) => set({ routes }),
  setStats: (stats) => set({ stats }),
  setDebugResults: (results) => set({ debugResults: results })
}));






