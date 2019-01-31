/**
 * Library for handling scrolling functionality
 */

const SCROLL_RATE = 1 / 10;
const FAST_SCROLL_RATE = 1 / 2;

let timer = 0;
let timerFunction = null;

function scroll(target, cb, fast = false) {
  // Logrithmic scroll rate (higher scrolls faster)
  const scrollRate = fast ? FAST_SCROLL_RATE : SCROLL_RATE;
  // Current scroll position
  const current = window.pageYOffset;
  // Set flag for scroll direction
  const down = current < target;
  // Set step based on scroll rate
  const step = (Math.abs(current - target) * scrollRate) + 1;
  // Set next position based on scroll direction
  const next = down ? current + step : current - step;
  // Set past flag based on scroll direction
  const isPast = down ? next >= target : next <= target;
  // Set flag to check if at bottom of window for scrolling down
  const tolerance = 5;
  const atBottom = down
    ? (window.innerHeight + window.pageYOffset + tolerance) >= document.body.offsetHeight
    : false;

  // Scroll to next position
  window.scrollTo(0, next);

  if (!isPast && !atBottom && timer) {
    window.requestAnimationFrame(() => scroll(target, cb));

    return;
  }

  if (cb) cb();
}

/**
 * Stop requesting animation frames after running for n seconds
 * This fixes case of scroll function never finishing if called twice before the first finishes
 */
function setTimer() {
  timer = 1;
  timerFunction = setTimeout(() => {
    timer = 0;
  }, 2500);
}

/**
 * Scroll to element specified by id
 * @param {string} anchor - element id
 * @param {int} offset
 * @param {function} cb
 * @return {void}
 */
export function scrollTo(anchor, offset = 0, cb = null) {
  // Get element to scroll
  const el = document.getElementById(anchor);
  // Get position of element
  const top = (el.getBoundingClientRect().top + window.pageYOffset) - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(() => scroll(top, cb));

  // Update URL hash
  if (window.history && window.history.pushState) {
    window.history.pushState(window.history.state, null, `#${anchor}`);
  } else {
    window.location.hash = `#${anchor}`;
  }
}

/**
 * Scroll to top of element
 * @param {node} element
 * @param {int} offset
 * @param {function} cb
 * @return {void}
 */
export function scrollTop(el = document.body, offset = 0, cb = null, fast = false) {
  // Get top position of element
  const top = (el.getBoundingClientRect().top + window.pageYOffset) - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(() => scroll(top, cb, fast));
}

/**
 * Scroll to bottom of element
 * @param {node} element
 * @param {int} offset
 * @param {function} cb
 * @return {void}
 */
export function scrollBottom(el = document.body, offset = 0, cb = null) {
  // Get bottom position of element
  const bottom = (el.getBoundingClientRect().top + el.offsetHeight + window.pageYOffset) - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(() => scroll(bottom, cb));
}

