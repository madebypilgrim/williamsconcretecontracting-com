import './polyfills';

// Components
import Main from './components/main';

// Utilities
import { instantiate } from './utilities/components';

/* eslint-disable quote-props */
const classMap = {
  'main': Main,
};
/* eslint-enable quote-props */

// Event handler functions
function handleDOMConentLoaded() {
  // Call component constructors
  instantiate(classMap);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', handleDOMConentLoaded);

