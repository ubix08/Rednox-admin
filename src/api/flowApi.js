// ============================================================
// src/api/flowApi.js
// ============================================================
import { useStore } from '../store/useStore';

export const flowApi = {
  async fetchNodes() {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/nodes`);
    if (!res.ok) throw new Error('Failed to fetch nodes');
    return res.json();
  },
  
  async fetchFlows() {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows`);
    if (!res.ok) throw new Error('Failed to fetch flows');
    return res.json();
  },
  
  async fetchFlow(id) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/${id}`);
    if (!res.ok) throw new Error('Failed to fetch flow');
    return res.json();
  },
  
  async createFlow(flowData) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });
    if (!res.ok) throw new Error('Failed to create flow');
    return res.json();
  },
  
  async updateFlow(id, flowData) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });
    if (!res.ok) throw new Error('Failed to update flow');
    return res.json();
  },
  
  async deleteFlow(id) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete flow');
    return res.json();
  },
  
  async toggleFlow(id, enable) {
    const { apiUrl } = useStore.getState();
    const action = enable ? 'enable' : 'disable';
    const res = await fetch(`${apiUrl}/admin/flows/${id}/${action}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to ${action} flow`);
    return res.json();
  },
  
  async exportFlow(id) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/${id}/export`);
    if (!res.ok) throw new Error('Failed to export flow');
    return res.json();
  },
  
  async importFlow(flowData) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });
    if (!res.ok) throw new Error('Failed to import flow');
    return res.json();
  },
  
  async debugExecute(flowId, nodeId, payload = {}) {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/flows/${flowId}/debug-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, payload })
    });
    if (!res.ok) throw new Error('Failed to debug execute');
    return res.json();
  },
  
  async fetchRoutes() {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/routes`);
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },
  
  async fetchStats() {
    const { apiUrl } = useStore.getState();
    const res = await fetch(`${apiUrl}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
