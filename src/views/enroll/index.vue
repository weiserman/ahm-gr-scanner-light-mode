<template>
  <div class="view-wrapper enroll-wrapper">
    <p class="enroll-kicker">Onboarding</p>
    <h1 class="view-header">Welcome to GR App</h1>
    <p class="enroll-subtitle">
      Please provide your SAP Username and Password,<br>
      this will be secured by a PIN.
    </p>

    <div class="enroll-panel">
      <form class="enroll-form" @submit.prevent="handleEnroll">
        <div class="form-group">
          <label class="form-label" for="enroll-username">SAP Username</label>
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
          <label class="form-label" for="enroll-password">SAP Password</label>
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
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 1.75rem;
  box-sizing: border-box;
}

.enroll-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.view-header {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
}

.enroll-subtitle {
  margin: 0.35rem 0 0;
  text-align: center;
  color: #475569;
  font-size: 0.9rem;
}

.enroll-panel {
  margin-top: 1rem;
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #dbe3ec;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  padding: 1rem;
}

.enroll-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
}

.form-input {
  width: 100%;
  border: 1px solid #dbe3ec;
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  background-color: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #0a6ed1;
  box-shadow: 0 0 0 2px rgba(10, 110, 209, 0.2);
}

.submit-btn {
  margin-top: 0.5rem;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 0.95rem;
  cursor: pointer;
  background-color: #0a6ed1;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.92rem;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: #0854a0;
}

@media (max-width: 380px) {
  .view-header {
    font-size: 1.45rem;
  }

  .enroll-subtitle {
    font-size: 0.82rem;
  }

  .enroll-panel {
    padding: 0.9rem;
  }
}
</style>
