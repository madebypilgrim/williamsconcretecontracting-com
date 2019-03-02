export const events = {
  // Action events
  lockScroll: 'lock-scroll',
  unlockScroll: 'unlock-scroll',
  showHeader: 'show-header',
  hideHeader: 'hide-header',
  openModal: 'open-modal',
  closeModal: 'close-modal',
  loadModal: 'load-modal',
  startLoader: 'start-loader',
  stopLoader: 'stop-loader',
  showFormErrors: 'show-form-errors',
};

/**
 * Emit event - wrapper around CustomEvent API
 * @param {string} eventHandle
 * @param {object} eventDetails
 */
export function emitEvent(eventHandle, eventDetails) {
  const event = new CustomEvent(eventHandle, { detail: eventDetails });

  window.dispatchEvent(event);
}

