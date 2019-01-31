import { events } from '../utilities/custom-events';

const ANIMATION_DURATION = 1000; // miliseconds
const REFRESH_RATE = ANIMATION_DURATION / 60;

export default class {
  constructor({
    id,
    loadingClass,
  }) {
    const el = document.getElementById(id);

    let animating = false;

    // Event handler functions
    function handleStartLoader() {
      animating = true;

      setTimeout(() => { animating = false; }, ANIMATION_DURATION);

      el.classList.add(loadingClass);
    }
    function handleStopLoader() {
      if (animating) {
        setTimeout(handleStopLoader, REFRESH_RATE);

        return;
      }

      el.classList.remove(loadingClass);
    }

    // Add event listeners
    window.addEventListener(events.startLoader, handleStartLoader);
    window.addEventListener(events.stopLoader, handleStopLoader);
  }
}

