import './polyfills';

// Components
import Loader from './components/loader';
import Main from './components/main';
import Modal from './components/modal';

// Utilities
import { instantiate } from './utilities/components';

/* eslint-disable quote-props */
const classMap = {
  'loader': Loader,
  'main': Main,
  'modal': Modal,
};
/* eslint-enable quote-props */

// Event handler functions
function handleDOMConentLoaded() {
  // Call component constructors
  instantiate(classMap);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', handleDOMConentLoaded);

