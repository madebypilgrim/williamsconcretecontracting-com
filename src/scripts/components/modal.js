import { events, emitEvent } from '../utilities/custom-events';
import { injectMarkup } from '../utilities/components';

export default class {
  constructor({
    id,
    overlayHandle,
    closeHandle,
    contentHandle,
    activeClass,
  }) {
    // Elements and class variables
    const el = document.getElementById(id);
    const overlay = el.querySelector(overlayHandle);
    const content = el.querySelector(contentHandle);
    const close = el.querySelector(closeHandle);

    // Event handler functions
    function handleKeyup(e) {
      // Only car about escape key
      if (e.keyCode !== 27) return;

      emitEvent(events.closeModal);
    }
    function handleOpenModal() {
      emitEvent(events.lockScroll);
      el.classList.add(activeClass);

      document.addEventListener('keyup', handleKeyup);
    }
    function handleCloseModal() {
      emitEvent(events.unlockScroll);
      el.classList.remove(activeClass);

      document.removeEventListener('keyup', handleKeyup);
    }
    function handleLoadModal(e) {
      const {
        markup,
        full = 'false',
        position = 'center',
        size = 'lg',
      } = e.detail;

      el.setAttribute('data-full', full);
      el.setAttribute('data-position', position);
      el.setAttribute('data-size', size);
      injectMarkup(content, markup);
      handleOpenModal();
    }
    function handleClick(e) {
      e.preventDefault();

      emitEvent(events.closeModal);
    }

    // Add event listeners
    window.addEventListener(events.openModal, handleOpenModal);
    window.addEventListener(events.closeModal, handleCloseModal);
    window.addEventListener(events.loadModal, handleLoadModal);
    close.addEventListener('click', handleClick);
    overlay.addEventListener('click', handleClick);
  }
}

