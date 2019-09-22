import './polyfills';
import pop from 'compop';

// Components
import Main from './components/main';

const { SITE_HANDLE } = process.env;

/* eslint-disable quote-props */
const classMap = {
    'main': Main,
};
/* eslint-enable quote-props */

const actions = {
    lockScroll: 'lock-scroll',
    unlockScroll: 'unlock-scroll',
};

// Event handler functions
function handleDOMConentLoaded() {
    const scaffold = window[SITE_HANDLE];

    function cb() {
        // Do something after components initialize
    }

    // Call component constructors
    pop({ scaffold, classMap, actions, cb });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', handleDOMConentLoaded);
