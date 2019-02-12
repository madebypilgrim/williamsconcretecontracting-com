import { events } from '../utilities/custom-events';
import { scrollTop } from '../utilities/scroll';

const ANIMATION_DURATION = 500; // miliseconds
const REFRESH_RATE = ANIMATION_DURATION / 60;

export default class {
  constructor({
    id,
    lockedClass,
    activeClass,
    unloadingClass,
  }) {
    // Elements and class variables
    const el = document.getElementById(id);

    // State variables
    let animating = false;
    let scrolling = false;

    // Event handler functions
    function handleLockScroll(e) {
      document.body.classList.add(lockedClass);
    }
    function handleUnlockScroll() {
      document.body.classList.remove(lockedClass);
    }
    function handleUnloadRoute() {
      function scroll() {
        scrolling = true;

        scrollTop(document.body, 0, () => {
          scrolling = false;
        });
      }

      function animate() {
        animating = true;

        setTimeout(() => {
          animating = false;

          scroll();
        }, ANIMATION_DURATION);
      }

      // Animate page unload
      el.classList.add(unloadingClass);
      animate();
    }

    // Add event listeners
    window.addEventListener(events.lockScroll, handleLockScroll);
    window.addEventListener(events.unlockScroll, handleUnlockScroll);
    window.addEventListener(events.unloadRoute, handleUnloadRoute);

    // Initialize
    el.classList.add(activeClass);
  }
}

