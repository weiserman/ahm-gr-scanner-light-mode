/**
 * @file Keyboard Shortcut Listener Module.
 *
 * Registers a global Ctrl+R keydown listener that reloads the
 * current page — useful for quick refreshes during development.
 *
 * @module keyboard
 */

/** Handles the keydown event, intercepting Ctrl+R to reload the page. */
const handleKeyDown = (event) => {
  if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
    event.preventDefault();
    window.location.reload();
  }
};

/** Registers the Ctrl+R keyboard shortcut listener. */
export const register = () => {
  window.addEventListener('keydown', handleKeyDown);
};

/** Unregisters the Ctrl+R keyboard shortcut listener. */
export const unregister = () => {
  window.removeEventListener('keydown', handleKeyDown);
};

register();
