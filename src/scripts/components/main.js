import { events } from '../utilities/custom-events';
import { scrollTop } from '../utilities/scroll';

const ANIMATION_DURATION = 500; // miliseconds
const REFRESH_RATE = ANIMATION_DURATION / 60;

export default class {
  constructor({
    id,
    lockedClass,
    loadingClass,
    unloadingClass,
  }) {
    // Elements and class variables
    const el = document.getElementById(id);
    const links = Array.from(document.querySelectorAll('a'))
      .filter(l => (
        !l.href.startsWith('tel:')
        && !l.href.startsWith('mailto:')
        && (l.getAttribute('target') || 'self') === 'self'
      ))

    // Event handler functions
    function handleLockScroll(e) {
      document.body.classList.add(lockedClass);
    }
    function handleUnlockScroll() {
      document.body.classList.remove(lockedClass);
    }
    function handleLink(e) {
      e.preventDefault();

      const link = e.currentTarget;

      function scroll() {
        scrollTop(document.body, 0, () => {
          window.location = link.href;
        });
      }

      // Animate page unload
      document.body.classList.add(unloadingClass);
      setTimeout(scroll, ANIMATION_DURATION);
    }

    // Add event listeners
    window.addEventListener(events.lockScroll, handleLockScroll);
    window.addEventListener(events.unlockScroll, handleUnlockScroll);
    links.forEach(l => { l.addEventListener('click', handleLink); });

    // Animate page load
    document.body.classList.add(loadingClass);
  }
}
