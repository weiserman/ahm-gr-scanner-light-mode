/**
 * @file Global Window Dialog Override Layer.
 *
 * Replaces the native blocking dialogs (window.alert, window.confirm,
 * window.prompt) with an asynchronous, mobile-optimised modal.
 *
 * State is shared through a persistent global key on window
 * (`__VUE_CUSTOM_DIALOG_STATE__`) so that any script — including
 * those outside the Vue tree — can trigger the custom dialog.
 *
 * @see {@link ../components/dialog/README.md} for architecture details.
 * @module useDialog
 */

import { ref } from 'vue';

/** Key on window used to persist the shared dialog state singleton. */
const GLOBAL_KEY = '__VUE_CUSTOM_DIALOG_STATE__';

// Lazily initialise the state singleton on first import
if (!window[GLOBAL_KEY]) {
  window[GLOBAL_KEY] = {
    isOpen: ref(false),
    type: ref('alert'),
    message: ref(''),
    promptValue: ref(''),
    resolvePromise: null
  };
}

const state = window[GLOBAL_KEY];

/**
 * Opens a dialog of the given type and returns a Promise that resolves
 * when the user dismisses it.
 *
 * @param {'alert'|'confirm'|'prompt'} dialogType - The dialog variant.
 * @param {string} msg - The message to display.
 * @param {string} [defaultPrompt=''] - Pre-filled value for prompt dialogs.
 * @returns {Promise<undefined|boolean|string|null>}
 */
const openDialog = (dialogType, msg, defaultPrompt = '') => {
  state.type.value = dialogType;
  state.message.value = msg;
  state.promptValue.value = defaultPrompt;
  state.isOpen.value = true;
  
  return new Promise((resolve) => {
    state.resolvePromise = resolve;
  });
};

/**
 * Composable that exposes the reactive dialog state and an action
 * handler for the CustomDialog.vue component.
 *
 * @returns {{ isOpen, type, message, promptValue, open, handleAction }}
 */
export function useDialog() {
  const handleAction = (status) => {
    state.isOpen.value = false;
    if (!state.resolvePromise) return;

    if (state.type.value === 'alert') {
      state.resolvePromise(undefined);
    } else if (state.type.value === 'confirm') {
      state.resolvePromise(status === 'confirm');
    } else if (state.type.value === 'prompt') {
      state.resolvePromise(status === 'confirm' ? state.promptValue.value : null);
    }
    state.resolvePromise = null;
  };

  return { 
    isOpen: state.isOpen, 
    type: state.type, 
    message: state.message, 
    promptValue: state.promptValue, 
    open: openDialog, 
    handleAction 
  };
}

/**
 * Hijacks window.alert, window.confirm, and window.prompt so that
 * they route through the custom async dialog instead of blocking
 * the JavaScript thread.
 */
export function initWindowOverrides() {
  
  window.alert = (msg) => {
    openDialog('alert', msg);
  };

  window.confirm = async (msg) => {
    return await openDialog('confirm', msg);
  };

  window.prompt = async (msg, defaultPrompt = '') => {
    return await openDialog('prompt', msg, defaultPrompt);
  };
}

