<template>
  <div class="view-wrapper enroll-wrapper">
    <div class="view-header">Welcome</div>
    <p class="enroll-subtitle">Enroll a user before securing the app with a PIN.</p>

    <form class="enroll-form" @submit.prevent="handleEnroll">
      <div class="form-group">
        <label class="form-label" for="enroll-username">Username</label>
        <input
          id="enroll-username"
          v-model.trim="localConfig.username"
          class="form-input"
          type="text"
          autocomplete="username"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="enroll-password">Password</label>
        <input
          id="enroll-password"
          v-model="localConfig.password"
          class="form-input"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <button type="submit" class="submit-btn">Continue to PIN setup</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { store, storeActions } from '../../util/store.js';

const router = useRouter();

const localConfig = reactive({
  baseHost: store.config.baseHost,
  poPath: store.config.poPath,
  grPath: store.config.grPath,
  username: store.config.username,
  password: store.config.password,
  networkTimeoutMs: store.config.networkTimeoutMs,
  useDummyData: store.config.useDummyData,
  sapClient: store.config.sapClient || ''
});

const handleEnroll = () => {
  storeActions.saveODataConfig(
    localConfig.baseHost,
    localConfig.poPath,
    localConfig.grPath,
    localConfig.username,
    localConfig.password,
    localConfig.networkTimeoutMs,
    localConfig.useDummyData,
    localConfig.sapClient
  );

  const pinExists = store.appPin !== null && store.appPin !== undefined && store.appPin !== '';
  router.push(pinExists ? '/enter' : '/setup');
};
</script>

<style scoped>
.enroll-wrapper {
  padding: 1.5rem 1rem;
}

.enroll-subtitle {
  margin: 0 0 1rem 0;
  text-align: center;
  color: var(--text-muted);
}

.enroll-form {
  width: min(320px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.form-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.7rem 0.8rem;
  background-color: var(--surface-color);
  color: var(--text-main);
  box-sizing: border-box;
}

.submit-btn {
  margin-top: 0.4rem;
  border: none;
  border-radius: 6px;
  padding: 0.8rem;
  cursor: pointer;
  background-color: var(--accent-color);
  color: var(--text-main);
  font-weight: 600;
}
</style>
