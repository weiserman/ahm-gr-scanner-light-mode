<template>
  <header class="app-header fixed-topbar">
    <!-- Displays the dynamic prop text instead of a hardcoded string -->
    <h1 class="header-title">{{ title }}</h1>
    <div v-if="useInlineMenu" class="header-inline-menu">
      <router-link
        v-for="item in normalizedMenuItems"
        :key="item.to"
        :to="item.to"
        class="header-inline-menu-btn"
        :aria-label="item.label"
      >
        <svg
          v-if="menuIconType(item) === 'home'"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <svg
          v-else-if="menuIconType(item) === 'scanned_goods'"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="15" y2="17"></line>
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <circle cx="12" cy="16" r="1"></circle>
        </svg>
      </router-link>
    </div>

    <div v-else-if="normalizedMenuItems.length > 0" ref="headerMenuRef" class="header-menu">
      <button
        type="button"
        class="header-menu-btn"
        aria-label="Open navigation menu"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        @click="toggleMenu"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="4" y1="7" x2="20" y2="7"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="17" x2="20" y2="17"></line>
        </svg>
      </button>

      <div v-if="isMenuOpen" class="header-menu-popover" role="menu">
        <router-link
          v-for="item in normalizedMenuItems"
          :key="item.to"
          :to="item.to"
          class="header-menu-item"
          role="menuitem"
          @click="closeMenu"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>

    <router-link v-else to="/" class="header-home-btn" aria-label="Go to home">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </router-link>
  </header>
</template>

<script setup>
import { computed, defineProps, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Define the component properties
const props = defineProps({
  title: {
    type: String,
    default: 'Goods Receipting' // Fallback text if no title is provided
  },
  menuItems: {
    type: Array,
    default: () => []
  }
});

const route = useRoute();
const isMenuOpen = ref(false);
const headerMenuRef = ref(null);

const normalizedMenuItems = computed(() => {
  if (!Array.isArray(props.menuItems)) return [];
  return props.menuItems.filter(item => item && item.to && item.label);
});

const useInlineMenu = computed(() => normalizedMenuItems.value.length > 0 && normalizedMenuItems.value.length <= 2);

const menuIconType = (item) => {
  if (item.icon) return item.icon;
  if (item.to === '/home') return 'home';
  if (item.to === '/scanned_goods') return 'scanned_goods';
  return 'generic';
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleDocumentClick = (event) => {
  if (!headerMenuRef.value || headerMenuRef.value.contains(event.target)) return;
  closeMenu();
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

watch(() => route.fullPath, closeMenu);
</script>

<style scoped>
.fixed-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--header-height) + env(safe-area-inset-top, 0px));
  z-index: 100;
  box-sizing: border-box;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: env(safe-area-inset-top, 0px) 1rem 0.75rem;
}

.header-title {
  font-family: "72", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1.05rem;
  margin: 0;
  font-weight: 700;
  color: var(--text-main);
}

.header-home-btn {
  color: var(--accent-color-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-inline-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.header-inline-menu-btn {
  color: var(--accent-color-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  text-decoration: none;
}

.header-menu {
  position: relative;
}

.header-menu-btn {
  color: var(--accent-color-strong);
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  cursor: pointer;
}

.header-menu-popover {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  min-width: 11rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(29, 45, 62, 0.15);
  overflow: hidden;
}

.header-menu-item {
  display: block;
  padding: 0.75rem 0.9rem;
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.9rem;
}

.header-menu-item + .header-menu-item {
  border-top: 1px solid var(--border-color);
}

.header-menu-item:active {
  background-color: var(--surface-alt);
}
</style>
