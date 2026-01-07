import { defineStore } from 'pinia';

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  enabled: boolean;
}

export const useFlowStore = defineStore('flow', {
  state: () => ({
    flows: [] as Flow[],
    currentFlowId: null as string | null,
    nodesDefs: {} as Record<string, any>, // Node definitions from API
    categories: [] as any[],
  }),
  getters: {
    currentFlow: (state): Flow | null => {
      return state.flows.find(f => f.id === state.currentFlowId) || null;
    },
  },
  actions: {
    async loadNodes() {
      const { getNodeCategories, getNodes } = await import('../api');
      this.categories = (await getNodeCategories()).categories;
      this.nodesDefs = (await getNodes()); // Adjust based on API
    },
    async loadFlows() {
      const { listFlows } = await import('../api');
      this.flows = (await listFlows()).flows;
    },
    setCurrentFlow(id: string) {
      this.currentFlowId = id;
    },
    addNodeToCurrentFlow(node: Node) {
      const flow = this.currentFlow;
      if (flow) flow.nodes.push(node);
    },
    // Add more actions for edges, save, etc.
  },
});
