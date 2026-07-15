/**
 * @file Vite application entry point.
 *
 * Creates the Vue 3 app, installs the router plugin, and mounts
 * the application to the #app DOM element.
 */

import { createApp } from 'vue';
import Main from './Main.vue';
import router from './router/index.js';
import './style.css';

const app = createApp(Main);
app.use(router);
app.mount('#app');
