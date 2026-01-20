import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/oauth/callback',
			name: 'callback',
			component: () => import('../views/CallbackView.vue'),
		},
		{
			path: '/protected',
			name: 'protected',
			component: () => import('../views/ProtectedView.vue'),
		},
	],
});

export default router;
