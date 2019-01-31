import { events } from '../utilities/custom-events';
import { injectMarkup } from '../utilities/components';
// import { get } from '../utilities/router';
import { scrollTop } from '../utilities/scroll';

const ANIMATION_DURATION = 500; // miliseconds
const REFRESH_RATE = ANIMATION_DURATION / 60;

export default class {
  constructor({
    id,
    contentHandle,
    lockedClass,
    activeClass,
    unloadingClass,
  }) {
    // Elements and class variables
    const el = document.getElementById(id);
    const content = el.querySelector(contentHandle);

    // State variables
    let animating = false;
    let scrolling = false;

    // Event handler functions
    function handleContTouchStart(e) {
      const cont = e.currentTarget;
      const top = cont.scrollTop
      const totalScroll = cont.scrollHeight
      const currentScroll = top + cont.offsetHeight

      // If we're at the top or the bottom of the containers
      // scroll, push up or down one pixel.
      //
      // This prevents the scroll from "passing through" to the body.
      if (top === 0) {
        el.scrollTop = 1

        return;
      } else if (currentScroll === totalScroll) {
        el.scrollTop = top - 1
      }
    }
    function handleContTouchMove(e) {
      const cont = e.currentTarget;

      // If the content is actually scrollable, i.e. the content is long enough
      // that scrolling can occur
      if (cont.offsetHeight < cont.scrollHeight) {
        e._allowScroll = true
      }
    }
    function handleBodyTouchMove(e) {
      // In this case, the default behavior is scrolling the body, which
      // would result in an overflow.  Since we don't want that, we preventDefault.
      //
      // TJP: This is pretty buggy and probably not worth it
      // if (!e._allowScroll) {
      //   e.preventDefault();
      // }
    }
    function handleLockScroll(e) {
      const { cont } = e.detail;

      document.body.classList.add(lockedClass);

      // Prevent scroll on iOS
      // https://github.com/luster-io/prevent-overscroll/blob/master/index.js
      // if (cont) {
      //   cont.addEventListener('touchstart', handleContTouchStart);
      //   cont.addEventListener('touchmove', handleContTouchMove);
      // }
      // document.addEventListener('touchmove', handleBodyTouchMove);
    }
    function handleUnlockScroll() {
      document.body.classList.remove(lockedClass);

      // Enable scroll on iOS
      // if (cont) {
      //   cont.removeEventListener('touchstart', handleContTouchStart);
      //   cont.removeEventListener('touchmove', handleContTouchMove);
      // }
      // document.removeEventListener('touchmove', handleBodyTouchMove);
    }
    function handleLoadRoute(e) {
      if (animating || scrolling) {
        setTimeout(handleLoadRoute.bind(this, e), REFRESH_RATE);

        return;
      }

      const { markup } = e.detail;

      el.classList.remove(unloadingClass);
      injectMarkup(content, markup);
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
    // function handlePopState(e) {
    //   if (!e.state) return;

    //   const { url, query = {} } = e.state;

    //   function cb(res) {
    //     const markup = res;

    //     emitEvent(events.loadRoute, { markup, ...e.state });
    //   }

    //   get({ url, query, cb });
    // }
    function handleShowOverlay() {
      // Allow children of content to specify their own z-index to overlay header/footer
      content.style.zIndex = 'initial';
    }
    function handleHideOverlay() {
      content.style.zIndex = '';
    }

    // Add event listeners
    window.addEventListener(events.lockScroll, handleLockScroll);
    window.addEventListener(events.unlockScroll, handleUnlockScroll);
    window.addEventListener(events.loadRoute, handleLoadRoute);
    window.addEventListener(events.unloadRoute, handleUnloadRoute);
    window.addEventListener(events.showOverlay, handleShowOverlay);
    window.addEventListener(events.hideOverlay, handleHideOverlay);

    // Set popstate event listener
    // if (window.history) window.addEventListener('popstate', handlePopState);

    // Set initial state
    if (window.history && window.history.replaceState) {
      const replaceState = {
        ...window.history.state,
        url: window.location.href,
      };

      window.history.replaceState(replaceState, null);
    }

    // Initialize
    el.classList.add(activeClass);
  }
}

