/**
 * Helper function to convery object to query string
 * @param {object} obj
 */
function toQueryString(obj = {}) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

/**
 * Get shared markup
 * @param {string} url
 * @param {object} query
 * @param {object} state
 * @param {function} cb
 * @return {void}
 */
export function get({ url, query, state = null, cb = null }) {
  const xhr = new XMLHttpRequest();

  // Event handler functions
  function handleReadyStateChange() {
    if (xhr.readyState !== 4) return;

    // Update URL
    if (state && window.history && window.history.pushState) {
      const stateUrl = state.query
        ? `${state.url}?${toQueryString(state.query)}`
        : state.url;

      window.history.pushState(state, null, stateUrl);
    }

    // Callback
    if (cb) cb(xhr.responseText);
  }

  if (query) {
    url = `${url}?${toQueryString(query)}`;
  }

  xhr.open('GET', url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'text/html, application/json');
  xhr.onreadystatechange = handleReadyStateChange;
  xhr.send();
}

/**
 * Add user section record and update topic tracker component
 * @param {string} url
 * @param {object} formData
 * @param {object} state
 * @param {function} cb
 * @return {void}
 */
export function post({ url = '/', formData, state = null, cb = null }) {
  const xhr = new XMLHttpRequest();

  // Event handler functions
  function handleReadyStateChange() {
    if (xhr.readyState !== 4) return;

    // Update URL
    if (state && window.history && window.history.pushState) {
      window.history.pushState(state, null);
    }

    // Callback
    if (cb) cb(xhr.responseText);
  }

  xhr.open('POST', url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'text/html, application/json');
  xhr.onreadystatechange = handleReadyStateChange;
  xhr.send(formData);
}

