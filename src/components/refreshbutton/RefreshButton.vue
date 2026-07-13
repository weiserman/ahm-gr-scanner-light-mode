<template>
  <button 
    class="floating-refresh-btn" 
    @click="reloadPage" 
    title="Reload Page"
    aria-label="Reload Page"
  >
    <!-- Crisp, self-contained SVG refresh icon -->
    <svg 
      xmlns="http://w3.org" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      class="refresh-icon"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>
  </button>
</template>

<script setup>
function reloadPage() {
  window.location.reload();
}
</script>

<style scoped>
.floating-refresh-btn {
  /* Positioning context */
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 9999; /* Ensures it floats above all other template layouts */

  /* Button structure */
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: var(--accent-contrast);
  border: none;
  
  /* Layout alignment */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Interactive styling mechanics */
  cursor: pointer;
  box-shadow: var(--accent-shadow);
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

/* Hover effects */
.floating-refresh-btn:hover {
  background-color: var(--accent-color-strong);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--accent-rgb), 0.34);
}

/* Active click states */
.floating-refresh-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Icon layout adjustments */
.refresh-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.4s ease;
}

/* Spin animation whenever user focuses or hovers the option */
.floating-refresh-btn:hover .refresh-icon {
  transform: rotate(-180deg);
}
</style>
