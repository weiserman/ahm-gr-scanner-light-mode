import { createRouter, createWebHashHistory } from 'vue-router';
import { hasConfiguredUser, store } from '../util/store.js';
import Enroll from '../views/enroll/index.vue';
import PinSetup from '../views/pinsetup/index.vue';
import PinEnter from '../views/pinenter/index.vue';
import Home from '../views/home/index.vue';
import About from '../views/about/index.vue';
import RegisterDelivery from '../views/register_delivery/index.vue';
import GoodsToScan from '../views/goods_to_scan/index.vue';
import ScannedGoods from '../views/scanned_goods/index.vue';
import POItems from '../views/po_items/index.vue';
import ReceiptItem from '../views/receipt_item/index.vue';
import OutboxItem from '../views/outbox_item/index.vue';
import Config from '../views/config/index.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { name: 'enroll', path: '/enroll', component: Enroll },
  { name: 'setup', path: '/setup', component: PinSetup },
  { name: 'enter', path: '/enter', component: PinEnter },
  { name: 'home', path: '/home', component: Home },
  { name: 'about', path: '/about', component: About },
  { name: 'register_delivery', path: '/register_delivery', component:RegisterDelivery},
  { name: 'goods_to_scan', path: '/goods_to_scan', component:GoodsToScan},
  { name: 'scanned_goods', path: '/scanned_goods', component:ScannedGoods},
  { name: 'po_items', path: '/po_items', component:POItems},
  { name: 'receipt_item', path: '/receipt_item', component:ReceiptItem},
  { name: 'outbox_item', path: '/outbox_item', component:OutboxItem},
  { name: 'config', path: '/config', component:Config},
  { path: '/:catchAll(.*)*', redirect: '/home' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userConfigured = hasConfiguredUser();
  const pinExists = store.appPin !== null && store.appPin !== undefined && store.appPin !== '';
  const isLoggedIn = store.user.isLoggedIn === true;

  if (!userConfigured) {
    if (to.path !== '/enroll') return next('/enroll');
    return next();
  }

  if (!pinExists) {
    if (to.path !== '/setup') return next('/setup');
    return next();
  }

  if (!isLoggedIn) {
    if (to.path !== '/enter') return next('/enter');
    return next();
  }

  if (to.path === '/enroll' || to.path === '/setup' || to.path === '/enter') {
    return next('/home');
  }

  next();
});

export default router;
