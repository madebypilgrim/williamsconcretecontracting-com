// Config
import { siteHandle } from '../config';

// Utilities
import { spySections, stick } from './spy';

let _classMap = null; // eslint-disable-line no-underscore-dangle

/**
 * Instantiate any components pushed onto global components array
 * @return {void}
 */
export function instantiate(map = null) {
  if (map !== null) {
    _classMap = map;
  }

  if (_classMap === null) return;

  while (window[siteHandle].components.length > 0) {
    const { components, state } = window[siteHandle];
    const config = components.shift();
    const Class = _classMap[config.handle];

    if (typeof Class === 'function') {
      new Class({ ...config, state }); // eslint-disable-line no-new
    }
  }

  spySections();
  stick();
}

/**
 * Inject new markup into DOM after adding configs to global
 * components array then instantiate newly added components
 * @param {node} container
 * @param {string} markup
 * @param {bool} append
 * @return {void}
 */
export function injectMarkup(container = null, markup = '', append = false) {
  if (!container) return;

  // Add markup to container
  if (append) {
    container.insertAdjacentHTML('beforeend', markup);
  } else {
    container.innerHTML = markup;
  }

  // Push components configs to global object
  const scripts = container.querySelectorAll('script');

  // Evaluate scripts returned from component markup if for new component
  Array.from(scripts)
    .filter(script => script.textContent.includes(`${siteHandle}`))
    .forEach(script => { eval(script.textContent); }); // eslint-disable-line no-eval

  // Instantiate components
  instantiate();
}

