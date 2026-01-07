import { createRouter, createWebHistory } from 'vue-router';
import FlowList from '../views/FlowList.vue';
import FlowEditor from '../views/FlowEditor.vue';
import Stats from '../views/Stats.vue';

const routes = [
  { path: '/', component: FlowList },
  { path: '/flow/:id', component: FlowEditor },
  { path: '/stats', component: Stats },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
