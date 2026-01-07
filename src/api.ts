import axios from 'axios';

const api = axios.create({
  baseURL: '/admin', // Assume Worker at same origin; adjust if needed (e.g., 'https://your-worker.example.com/admin')
});

export async function getNodes() {
  return api.get('/nodes').then(res => res.data);
}

export async function getNodeCategories() {
  return api.get('/nodes/categories').then(res => res.data);
}

export async function getNodeType(type: string) {
  return api.get(`/nodes/${type}`).then(res => res.data);
}

export async function listFlows() {
  return api.get('/flows').then(res => res.data);
}

export async function getFlow(id: string) {
  return api.get(`/flows/${id}`).then(res => res.data);
}

export async function createFlow(data: any) {
  return api.post('/flows', data).then(res => res.data);
}

export async function updateFlow(id: string, data: any) {
  return api.put(`/flows/${id}`, data).then(res => res.data);
}

export async function deleteFlow(id: string) {
  return api.delete(`/flows/${id}`).then(res => res.data);
}

export async function toggleFlow(id: string, enable: boolean) {
  return api.post(`/flows/\( {id}/ \){enable ? 'enable' : 'disable'}`).then(res => res.data);
}

export async function exportFlow(id: string) {
  return api.get(`/flows/${id}/export`).then(res => res.data);
}

export async function importFlow(data: any) {
  return api.post('/flows/import', data).then(res => res.data);
}

export async function executeFlow(id: string, data: any) {
  return api.post(`/flows/${id}/execute`, data).then(res => res.data);
}

export async function getDebug(id: string, limit = 50) {
  return api.get(`/flows/\( {id}/debug?limit= \){limit}`).then(res => res.data);
}

export async function getLogs(id: string, limit = 50) {
  return api.get(`/flows/\( {id}/logs?limit= \){limit}`).then(res => res.data);
}

export async function getRoutes() {
  return api.get('/routes').then(res => res.data);
}

export async function getStats() {
  return api.get('/stats').then(res => res.data);
}

export async function initDB() {
  return api.post('/init').then(res => res.data);
}
