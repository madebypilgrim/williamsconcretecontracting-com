(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170427
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in window.self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) 
	|| document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		// adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
		// modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
		if (ex.number === undefined || ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(window.self));

}

// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

},{}],2:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */

(function(window, document) {
'use strict';


// Exits early if all IntersectionObserver and IntersectionObserverEntry
// features are natively supported.
if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

  // Minimal polyfill for Edge 15's lack of `isIntersecting`
  // See: https://github.com/w3c/IntersectionObserver/issues/211
  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    Object.defineProperty(window.IntersectionObserverEntry.prototype,
      'isIntersecting', {
      get: function () {
        return this.intersectionRatio > 0;
      }
    });
  }
  return;
}


/**
 * An IntersectionObserver registry. This registry exists to hold a strong
 * reference to IntersectionObserver instances currently observing a target
 * element. Without this registry, instances without another reference may be
 * garbage collected.
 */
var registry = [];


/**
 * Creates the global IntersectionObserverEntry constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
 * @param {Object} entry A dictionary of instance properties.
 * @constructor
 */
function IntersectionObserverEntry(entry) {
  this.time = entry.time;
  this.target = entry.target;
  this.rootBounds = entry.rootBounds;
  this.boundingClientRect = entry.boundingClientRect;
  this.intersectionRect = entry.intersectionRect || getEmptyRect();
  this.isIntersecting = !!entry.intersectionRect;

  // Calculates the intersection ratio.
  var targetRect = this.boundingClientRect;
  var targetArea = targetRect.width * targetRect.height;
  var intersectionRect = this.intersectionRect;
  var intersectionArea = intersectionRect.width * intersectionRect.height;

  // Sets intersection ratio.
  if (targetArea) {
    // Round the intersection ratio to avoid floating point math issues:
    // https://github.com/w3c/IntersectionObserver/issues/324
    this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
  } else {
    // If area is zero and is intersecting, sets to 1, otherwise to 0
    this.intersectionRatio = this.isIntersecting ? 1 : 0;
  }
}


/**
 * Creates the global IntersectionObserver constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
 * @param {Function} callback The function to be invoked after intersection
 *     changes have queued. The function is not invoked if the queue has
 *     been emptied by calling the `takeRecords` method.
 * @param {Object=} opt_options Optional configuration options.
 * @constructor
 */
function IntersectionObserver(callback, opt_options) {

  var options = opt_options || {};

  if (typeof callback != 'function') {
    throw new Error('callback must be a function');
  }

  if (options.root && options.root.nodeType != 1) {
    throw new Error('root must be an Element');
  }

  // Binds and throttles `this._checkForIntersections`.
  this._checkForIntersections = throttle(
      this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

  // Private properties.
  this._callback = callback;
  this._observationTargets = [];
  this._queuedEntries = [];
  this._rootMarginValues = this._parseRootMargin(options.rootMargin);

  // Public properties.
  this.thresholds = this._initThresholds(options.threshold);
  this.root = options.root || null;
  this.rootMargin = this._rootMarginValues.map(function(margin) {
    return margin.value + margin.unit;
  }).join(' ');
}


/**
 * The minimum interval within which the document will be checked for
 * intersection changes.
 */
IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


/**
 * The frequency in which the polyfill polls for intersection changes.
 * this can be updated on a per instance basis and must be set prior to
 * calling `observe` on the first target.
 */
IntersectionObserver.prototype.POLL_INTERVAL = null;

/**
 * Use a mutation observer on the root element
 * to detect intersection changes.
 */
IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


/**
 * Starts observing a target element for intersection changes based on
 * the thresholds values.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.observe = function(target) {
  var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
    return item.element == target;
  });

  if (isTargetAlreadyObserved) {
    return;
  }

  if (!(target && target.nodeType == 1)) {
    throw new Error('target must be an Element');
  }

  this._registerInstance();
  this._observationTargets.push({element: target, entry: null});
  this._monitorIntersections();
  this._checkForIntersections();
};


/**
 * Stops observing a target element for intersection changes.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.unobserve = function(target) {
  this._observationTargets =
      this._observationTargets.filter(function(item) {

    return item.element != target;
  });
  if (!this._observationTargets.length) {
    this._unmonitorIntersections();
    this._unregisterInstance();
  }
};


/**
 * Stops observing all target elements for intersection changes.
 */
IntersectionObserver.prototype.disconnect = function() {
  this._observationTargets = [];
  this._unmonitorIntersections();
  this._unregisterInstance();
};


/**
 * Returns any queue entries that have not yet been reported to the
 * callback and clears the queue. This can be used in conjunction with the
 * callback to obtain the absolute most up-to-date intersection information.
 * @return {Array} The currently queued entries.
 */
IntersectionObserver.prototype.takeRecords = function() {
  var records = this._queuedEntries.slice();
  this._queuedEntries = [];
  return records;
};


/**
 * Accepts the threshold value from the user configuration object and
 * returns a sorted array of unique threshold values. If a value is not
 * between 0 and 1 and error is thrown.
 * @private
 * @param {Array|number=} opt_threshold An optional threshold value or
 *     a list of threshold values, defaulting to [0].
 * @return {Array} A sorted list of unique and valid threshold values.
 */
IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
  var threshold = opt_threshold || [0];
  if (!Array.isArray(threshold)) threshold = [threshold];

  return threshold.sort().filter(function(t, i, a) {
    if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
      throw new Error('threshold must be a number between 0 and 1 inclusively');
    }
    return t !== a[i - 1];
  });
};


/**
 * Accepts the rootMargin value from the user configuration object
 * and returns an array of the four margin values as an object containing
 * the value and unit properties. If any of the values are not properly
 * formatted or use a unit other than px or %, and error is thrown.
 * @private
 * @param {string=} opt_rootMargin An optional rootMargin value,
 *     defaulting to '0px'.
 * @return {Array<Object>} An array of margin objects with the keys
 *     value and unit.
 */
IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
  var marginString = opt_rootMargin || '0px';
  var margins = marginString.split(/\s+/).map(function(margin) {
    var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
    if (!parts) {
      throw new Error('rootMargin must be specified in pixels or percent');
    }
    return {value: parseFloat(parts[1]), unit: parts[2]};
  });

  // Handles shorthand.
  margins[1] = margins[1] || margins[0];
  margins[2] = margins[2] || margins[0];
  margins[3] = margins[3] || margins[1];

  return margins;
};


/**
 * Starts polling for intersection changes if the polling is not already
 * happening, and if the page's visibility state is visible.
 * @private
 */
IntersectionObserver.prototype._monitorIntersections = function() {
  if (!this._monitoringIntersections) {
    this._monitoringIntersections = true;

    // If a poll interval is set, use polling instead of listening to
    // resize and scroll events or DOM mutations.
    if (this.POLL_INTERVAL) {
      this._monitoringInterval = setInterval(
          this._checkForIntersections, this.POLL_INTERVAL);
    }
    else {
      addEvent(window, 'resize', this._checkForIntersections, true);
      addEvent(document, 'scroll', this._checkForIntersections, true);

      if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in window) {
        this._domObserver = new MutationObserver(this._checkForIntersections);
        this._domObserver.observe(document, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    }
  }
};


/**
 * Stops polling for intersection changes.
 * @private
 */
IntersectionObserver.prototype._unmonitorIntersections = function() {
  if (this._monitoringIntersections) {
    this._monitoringIntersections = false;

    clearInterval(this._monitoringInterval);
    this._monitoringInterval = null;

    removeEvent(window, 'resize', this._checkForIntersections, true);
    removeEvent(document, 'scroll', this._checkForIntersections, true);

    if (this._domObserver) {
      this._domObserver.disconnect();
      this._domObserver = null;
    }
  }
};


/**
 * Scans each observation target for intersection changes and adds them
 * to the internal entries queue. If new entries are found, it
 * schedules the callback to be invoked.
 * @private
 */
IntersectionObserver.prototype._checkForIntersections = function() {
  var rootIsInDom = this._rootIsInDom();
  var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

  this._observationTargets.forEach(function(item) {
    var target = item.element;
    var targetRect = getBoundingClientRect(target);
    var rootContainsTarget = this._rootContainsTarget(target);
    var oldEntry = item.entry;
    var intersectionRect = rootIsInDom && rootContainsTarget &&
        this._computeTargetAndRootIntersection(target, rootRect);

    var newEntry = item.entry = new IntersectionObserverEntry({
      time: now(),
      target: target,
      boundingClientRect: targetRect,
      rootBounds: rootRect,
      intersectionRect: intersectionRect
    });

    if (!oldEntry) {
      this._queuedEntries.push(newEntry);
    } else if (rootIsInDom && rootContainsTarget) {
      // If the new entry intersection ratio has crossed any of the
      // thresholds, add a new entry.
      if (this._hasCrossedThreshold(oldEntry, newEntry)) {
        this._queuedEntries.push(newEntry);
      }
    } else {
      // If the root is not in the DOM or target is not contained within
      // root but the previous entry for this target had an intersection,
      // add a new record indicating removal.
      if (oldEntry && oldEntry.isIntersecting) {
        this._queuedEntries.push(newEntry);
      }
    }
  }, this);

  if (this._queuedEntries.length) {
    this._callback(this.takeRecords(), this);
  }
};


/**
 * Accepts a target and root rect computes the intersection between then
 * following the algorithm in the spec.
 * TODO(philipwalton): at this time clip-path is not considered.
 * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
 * @param {Element} target The target DOM element
 * @param {Object} rootRect The bounding rect of the root after being
 *     expanded by the rootMargin value.
 * @return {?Object} The final intersection rect object or undefined if no
 *     intersection is found.
 * @private
 */
IntersectionObserver.prototype._computeTargetAndRootIntersection =
    function(target, rootRect) {

  // If the element isn't displayed, an intersection can't happen.
  if (window.getComputedStyle(target).display == 'none') return;

  var targetRect = getBoundingClientRect(target);
  var intersectionRect = targetRect;
  var parent = getParentNode(target);
  var atRoot = false;

  while (!atRoot) {
    var parentRect = null;
    var parentComputedStyle = parent.nodeType == 1 ?
        window.getComputedStyle(parent) : {};

    // If the parent isn't displayed, an intersection can't happen.
    if (parentComputedStyle.display == 'none') return;

    if (parent == this.root || parent == document) {
      atRoot = true;
      parentRect = rootRect;
    } else {
      // If the element has a non-visible overflow, and it's not the <body>
      // or <html> element, update the intersection rect.
      // Note: <body> and <html> cannot be clipped to a rect that's not also
      // the document rect, so no need to compute a new intersection.
      if (parent != document.body &&
          parent != document.documentElement &&
          parentComputedStyle.overflow != 'visible') {
        parentRect = getBoundingClientRect(parent);
      }
    }

    // If either of the above conditionals set a new parentRect,
    // calculate new intersection data.
    if (parentRect) {
      intersectionRect = computeRectIntersection(parentRect, intersectionRect);

      if (!intersectionRect) break;
    }
    parent = getParentNode(parent);
  }
  return intersectionRect;
};


/**
 * Returns the root rect after being expanded by the rootMargin value.
 * @return {Object} The expanded root rect.
 * @private
 */
IntersectionObserver.prototype._getRootRect = function() {
  var rootRect;
  if (this.root) {
    rootRect = getBoundingClientRect(this.root);
  } else {
    // Use <html>/<body> instead of window since scroll bars affect size.
    var html = document.documentElement;
    var body = document.body;
    rootRect = {
      top: 0,
      left: 0,
      right: html.clientWidth || body.clientWidth,
      width: html.clientWidth || body.clientWidth,
      bottom: html.clientHeight || body.clientHeight,
      height: html.clientHeight || body.clientHeight
    };
  }
  return this._expandRectByRootMargin(rootRect);
};


/**
 * Accepts a rect and expands it by the rootMargin value.
 * @param {Object} rect The rect object to expand.
 * @return {Object} The expanded rect.
 * @private
 */
IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
  var margins = this._rootMarginValues.map(function(margin, i) {
    return margin.unit == 'px' ? margin.value :
        margin.value * (i % 2 ? rect.width : rect.height) / 100;
  });
  var newRect = {
    top: rect.top - margins[0],
    right: rect.right + margins[1],
    bottom: rect.bottom + margins[2],
    left: rect.left - margins[3]
  };
  newRect.width = newRect.right - newRect.left;
  newRect.height = newRect.bottom - newRect.top;

  return newRect;
};


/**
 * Accepts an old and new entry and returns true if at least one of the
 * threshold values has been crossed.
 * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
 *    particular target element or null if no previous entry exists.
 * @param {IntersectionObserverEntry} newEntry The current entry for a
 *    particular target element.
 * @return {boolean} Returns true if a any threshold has been crossed.
 * @private
 */
IntersectionObserver.prototype._hasCrossedThreshold =
    function(oldEntry, newEntry) {

  // To make comparing easier, an entry that has a ratio of 0
  // but does not actually intersect is given a value of -1
  var oldRatio = oldEntry && oldEntry.isIntersecting ?
      oldEntry.intersectionRatio || 0 : -1;
  var newRatio = newEntry.isIntersecting ?
      newEntry.intersectionRatio || 0 : -1;

  // Ignore unchanged ratios
  if (oldRatio === newRatio) return;

  for (var i = 0; i < this.thresholds.length; i++) {
    var threshold = this.thresholds[i];

    // Return true if an entry matches a threshold or if the new ratio
    // and the old ratio are on the opposite sides of a threshold.
    if (threshold == oldRatio || threshold == newRatio ||
        threshold < oldRatio !== threshold < newRatio) {
      return true;
    }
  }
};


/**
 * Returns whether or not the root element is an element and is in the DOM.
 * @return {boolean} True if the root element is an element and is in the DOM.
 * @private
 */
IntersectionObserver.prototype._rootIsInDom = function() {
  return !this.root || containsDeep(document, this.root);
};


/**
 * Returns whether or not the target element is a child of root.
 * @param {Element} target The target element to check.
 * @return {boolean} True if the target element is a child of root.
 * @private
 */
IntersectionObserver.prototype._rootContainsTarget = function(target) {
  return containsDeep(this.root || document, target);
};


/**
 * Adds the instance to the global IntersectionObserver registry if it isn't
 * already present.
 * @private
 */
IntersectionObserver.prototype._registerInstance = function() {
  if (registry.indexOf(this) < 0) {
    registry.push(this);
  }
};


/**
 * Removes the instance from the global IntersectionObserver registry.
 * @private
 */
IntersectionObserver.prototype._unregisterInstance = function() {
  var index = registry.indexOf(this);
  if (index != -1) registry.splice(index, 1);
};


/**
 * Returns the result of the performance.now() method or null in browsers
 * that don't support the API.
 * @return {number} The elapsed time since the page was requested.
 */
function now() {
  return window.performance && performance.now && performance.now();
}


/**
 * Throttles a function and delays its execution, so it's only called at most
 * once within a given time period.
 * @param {Function} fn The function to throttle.
 * @param {number} timeout The amount of time that must pass before the
 *     function can be called again.
 * @return {Function} The throttled function.
 */
function throttle(fn, timeout) {
  var timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(function() {
        fn();
        timer = null;
      }, timeout);
    }
  };
}


/**
 * Adds an event handler to a DOM node ensuring cross-browser compatibility.
 * @param {Node} node The DOM node to add the event handler to.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to add.
 * @param {boolean} opt_useCapture Optionally adds the even to the capture
 *     phase. Note: this only works in modern browsers.
 */
function addEvent(node, event, fn, opt_useCapture) {
  if (typeof node.addEventListener == 'function') {
    node.addEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.attachEvent == 'function') {
    node.attachEvent('on' + event, fn);
  }
}


/**
 * Removes a previously added event handler from a DOM node.
 * @param {Node} node The DOM node to remove the event handler from.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to remove.
 * @param {boolean} opt_useCapture If the event handler was added with this
 *     flag set to true, it should be set to true here in order to remove it.
 */
function removeEvent(node, event, fn, opt_useCapture) {
  if (typeof node.removeEventListener == 'function') {
    node.removeEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.detatchEvent == 'function') {
    node.detatchEvent('on' + event, fn);
  }
}


/**
 * Returns the intersection between two rect objects.
 * @param {Object} rect1 The first rect.
 * @param {Object} rect2 The second rect.
 * @return {?Object} The intersection rect or undefined if no intersection
 *     is found.
 */
function computeRectIntersection(rect1, rect2) {
  var top = Math.max(rect1.top, rect2.top);
  var bottom = Math.min(rect1.bottom, rect2.bottom);
  var left = Math.max(rect1.left, rect2.left);
  var right = Math.min(rect1.right, rect2.right);
  var width = right - left;
  var height = bottom - top;

  return (width >= 0 && height >= 0) && {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: width,
    height: height
  };
}


/**
 * Shims the native getBoundingClientRect for compatibility with older IE.
 * @param {Element} el The element whose bounding rect to get.
 * @return {Object} The (possibly shimmed) rect of the element.
 */
function getBoundingClientRect(el) {
  var rect;

  try {
    rect = el.getBoundingClientRect();
  } catch (err) {
    // Ignore Windows 7 IE11 "Unspecified error"
    // https://github.com/w3c/IntersectionObserver/pull/205
  }

  if (!rect) return getEmptyRect();

  // Older IE
  if (!(rect.width && rect.height)) {
    rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };
  }
  return rect;
}


/**
 * Returns an empty rect object. An empty rect is returned when an element
 * is not in the DOM.
 * @return {Object} The empty rect.
 */
function getEmptyRect() {
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0
  };
}

/**
 * Checks to see if a parent element contains a child element (including inside
 * shadow DOM).
 * @param {Node} parent The parent element.
 * @param {Node} child The child element.
 * @return {boolean} True if the parent node contains the child node.
 */
function containsDeep(parent, child) {
  var node = child;
  while (node) {
    if (node == parent) return true;

    node = getParentNode(node);
  }
  return false;
}


/**
 * Gets the parent node of an element or its host element if the parent node
 * is a shadow root.
 * @param {Node} node The node whose parent to get.
 * @return {Node|null} The parent node or null if no parent exists.
 */
function getParentNode(node) {
  var parent = node.parentNode;

  if (parent && parent.nodeType == 11 && parent.host) {
    // If the parent is a shadow root, return the host element.
    return parent.host;
  }
  return parent;
}


// Exposes the constructors globally.
window.IntersectionObserver = IntersectionObserver;
window.IntersectionObserverEntry = IntersectionObserverEntry;

}(window, document));

},{}],3:[function(require,module,exports){
/*!
 * @copyright Copyright (c) 2017 IcoMoon.io
 * @license   Licensed under MIT license
 *            See https://github.com/Keyamoon/svgxuse
 * @version   1.2.6
 */
/*jslint browser: true */
/*global XDomainRequest, MutationObserver, window */
(function () {
    "use strict";
    if (typeof window !== "undefined" && window.addEventListener) {
        var cache = Object.create(null); // holds xhr objects to prevent multiple requests
        var checkUseElems;
        var tid; // timeout id
        var debouncedCheck = function () {
            clearTimeout(tid);
            tid = setTimeout(checkUseElems, 100);
        };
        var unobserveChanges = function () {
            return;
        };
        var observeChanges = function () {
            var observer;
            window.addEventListener("resize", debouncedCheck, false);
            window.addEventListener("orientationchange", debouncedCheck, false);
            if (window.MutationObserver) {
                observer = new MutationObserver(debouncedCheck);
                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                unobserveChanges = function () {
                    try {
                        observer.disconnect();
                        window.removeEventListener("resize", debouncedCheck, false);
                        window.removeEventListener("orientationchange", debouncedCheck, false);
                    } catch (ignore) {}
                };
            } else {
                document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);
                unobserveChanges = function () {
                    document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
                    window.removeEventListener("resize", debouncedCheck, false);
                    window.removeEventListener("orientationchange", debouncedCheck, false);
                };
            }
        };
        var createRequest = function (url) {
            // In IE 9, cross origin requests can only be sent using XDomainRequest.
            // XDomainRequest would fail if CORS headers are not set.
            // Therefore, XDomainRequest should only be used with cross origin requests.
            function getOrigin(loc) {
                var a;
                if (loc.protocol !== undefined) {
                    a = loc;
                } else {
                    a = document.createElement("a");
                    a.href = loc;
                }
                return a.protocol.replace(/:/g, "") + a.host;
            }
            var Request;
            var origin;
            var origin2;
            if (window.XMLHttpRequest) {
                Request = new XMLHttpRequest();
                origin = getOrigin(location);
                origin2 = getOrigin(url);
                if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
                    Request = XDomainRequest || undefined;
                } else {
                    Request = XMLHttpRequest;
                }
            }
            return Request;
        };
        var xlinkNS = "http://www.w3.org/1999/xlink";
        checkUseElems = function () {
            var base;
            var bcr;
            var fallback = ""; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
            var hash;
            var href;
            var i;
            var inProgressCount = 0;
            var isHidden;
            var Request;
            var url;
            var uses;
            var xhr;
            function observeIfDone() {
                // If done with making changes, start watching for chagnes in DOM again
                inProgressCount -= 1;
                if (inProgressCount === 0) { // if all xhrs were resolved
                    unobserveChanges(); // make sure to remove old handlers
                    observeChanges(); // watch for changes to DOM
                }
            }
            function attrUpdateFunc(spec) {
                return function () {
                    if (cache[spec.base] !== true) {
                        spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);
                        if (spec.useEl.hasAttribute("href")) {
                            spec.useEl.setAttribute("href", "#" + spec.hash);
                        }
                    }
                };
            }
            function onloadFunc(xhr) {
                return function () {
                    var body = document.body;
                    var x = document.createElement("x");
                    var svg;
                    xhr.onload = null;
                    x.innerHTML = xhr.responseText;
                    svg = x.getElementsByTagName("svg")[0];
                    if (svg) {
                        svg.setAttribute("aria-hidden", "true");
                        svg.style.position = "absolute";
                        svg.style.width = 0;
                        svg.style.height = 0;
                        svg.style.overflow = "hidden";
                        body.insertBefore(svg, body.firstChild);
                    }
                    observeIfDone();
                };
            }
            function onErrorTimeout(xhr) {
                return function () {
                    xhr.onerror = null;
                    xhr.ontimeout = null;
                    observeIfDone();
                };
            }
            unobserveChanges(); // stop watching for changes to DOM
            // find all use elements
            uses = document.getElementsByTagName("use");
            for (i = 0; i < uses.length; i += 1) {
                try {
                    bcr = uses[i].getBoundingClientRect();
                } catch (ignore) {
                    // failed to get bounding rectangle of the use element
                    bcr = false;
                }
                href = uses[i].getAttribute("href")
                        || uses[i].getAttributeNS(xlinkNS, "href")
                        || uses[i].getAttribute("xlink:href");
                if (href && href.split) {
                    url = href.split("#");
                } else {
                    url = ["", ""];
                }
                base = url[0];
                hash = url[1];
                isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
                if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
                    // the use element is empty
                    // if there is a reference to an external SVG, try to fetch it
                    // use the optional fallback URL if there is no reference to an external SVG
                    if (fallback && !base.length && hash && !document.getElementById(hash)) {
                        base = fallback;
                    }
                    if (uses[i].hasAttribute("href")) {
                        uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
                    }
                    if (base.length) {
                        // schedule updating xlink:href
                        xhr = cache[base];
                        if (xhr !== true) {
                            // true signifies that prepending the SVG was not required
                            setTimeout(attrUpdateFunc({
                                useEl: uses[i],
                                base: base,
                                hash: hash
                            }), 0);
                        }
                        if (xhr === undefined) {
                            Request = createRequest(base);
                            if (Request !== undefined) {
                                xhr = new Request();
                                cache[base] = xhr;
                                xhr.onload = onloadFunc(xhr);
                                xhr.onerror = onErrorTimeout(xhr);
                                xhr.ontimeout = onErrorTimeout(xhr);
                                xhr.open("GET", base);
                                xhr.send();
                                inProgressCount += 1;
                            }
                        }
                    }
                } else {
                    if (!isHidden) {
                        if (cache[base] === undefined) {
                            // remember this URL if the use element was not empty and no request was sent
                            cache[base] = true;
                        } else if (cache[base].onload) {
                            // if it turns out that prepending the SVG is not necessary,
                            // abort the in-progress xhr.
                            cache[base].abort();
                            delete cache[base].onload;
                            cache[base] = true;
                        }
                    } else if (base.length && cache[base]) {
                        setTimeout(attrUpdateFunc({
                            useEl: uses[i],
                            base: base,
                            hash: hash
                        }), 0);
                    }
                }
            }
            uses = "";
            inProgressCount += 1;
            observeIfDone();
        };
        var winLoad;
        winLoad = function () {
            window.removeEventListener("load", winLoad, false); // to prevent memory leaks
            tid = setTimeout(checkUseElems, 0);
        };
        if (document.readyState !== "complete") {
            // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
            window.addEventListener("load", winLoad, false);
        } else {
            // No need to add a listener if the document is already loaded, initialize immediately.
            winLoad();
        }
    }
}());

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customEvents = require('../utilities/custom-events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ANIMATION_DURATION = 1000; // miliseconds
var REFRESH_RATE = ANIMATION_DURATION / 60;

var _class = function _class(_ref) {
  var id = _ref.id,
      loadingClass = _ref.loadingClass;

  _classCallCheck(this, _class);

  var el = document.getElementById(id);

  var animating = false;

  // Event handler functions
  function handleStartLoader() {
    animating = true;

    setTimeout(function () {
      animating = false;
    }, ANIMATION_DURATION);

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
  window.addEventListener(_customEvents.events.startLoader, handleStartLoader);
  window.addEventListener(_customEvents.events.stopLoader, handleStopLoader);
};

exports.default = _class;

},{"../utilities/custom-events":20}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customEvents = require('../utilities/custom-events');

var _scroll = require('../utilities/scroll');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ANIMATION_DURATION = 500; // miliseconds
var REFRESH_RATE = ANIMATION_DURATION / 60;

var _class = function _class(_ref) {
  var id = _ref.id,
      lockedClass = _ref.lockedClass,
      activeClass = _ref.activeClass,
      unloadingClass = _ref.unloadingClass;

  _classCallCheck(this, _class);

  // Elements and class variables
  var el = document.getElementById(id);

  // State variables
  var animating = false;
  var scrolling = false;

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

      (0, _scroll.scrollTop)(document.body, 0, function () {
        scrolling = false;
      });
    }

    function animate() {
      animating = true;

      setTimeout(function () {
        animating = false;

        scroll();
      }, ANIMATION_DURATION);
    }

    // Animate page unload
    el.classList.add(unloadingClass);
    animate();
  }

  // Add event listeners
  window.addEventListener(_customEvents.events.lockScroll, handleLockScroll);
  window.addEventListener(_customEvents.events.unlockScroll, handleUnlockScroll);
  window.addEventListener(_customEvents.events.unloadRoute, handleUnloadRoute);

  // Initialize
  el.classList.add(activeClass);
};

exports.default = _class;

},{"../utilities/custom-events":20,"../utilities/scroll":22}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customEvents = require('../utilities/custom-events');

var _components = require('../utilities/components');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function _class(_ref) {
  var id = _ref.id,
      overlayHandle = _ref.overlayHandle,
      closeHandle = _ref.closeHandle,
      contentHandle = _ref.contentHandle,
      activeClass = _ref.activeClass;

  _classCallCheck(this, _class);

  // Elements and class variables
  var el = document.getElementById(id);
  var overlay = el.querySelector(overlayHandle);
  var content = el.querySelector(contentHandle);
  var close = el.querySelector(closeHandle);

  // Event handler functions
  function handleKeyup(e) {
    // Only car about escape key
    if (e.keyCode !== 27) return;

    (0, _customEvents.emitEvent)(_customEvents.events.closeModal);
  }
  function handleOpenModal() {
    (0, _customEvents.emitEvent)(_customEvents.events.lockScroll);
    el.classList.add(activeClass);

    document.addEventListener('keyup', handleKeyup);
  }
  function handleCloseModal() {
    (0, _customEvents.emitEvent)(_customEvents.events.unlockScroll);
    el.classList.remove(activeClass);

    document.removeEventListener('keyup', handleKeyup);
  }
  function handleLoadModal(e) {
    var _e$detail = e.detail,
        markup = _e$detail.markup,
        _e$detail$full = _e$detail.full,
        full = _e$detail$full === undefined ? 'false' : _e$detail$full,
        _e$detail$position = _e$detail.position,
        position = _e$detail$position === undefined ? 'center' : _e$detail$position,
        _e$detail$size = _e$detail.size,
        size = _e$detail$size === undefined ? 'lg' : _e$detail$size;


    el.setAttribute('data-full', full);
    el.setAttribute('data-position', position);
    el.setAttribute('data-size', size);
    (0, _components.injectMarkup)(content, markup);
    handleOpenModal();
  }
  function handleClick(e) {
    e.preventDefault();

    (0, _customEvents.emitEvent)(_customEvents.events.closeModal);
  }

  // Add event listeners
  window.addEventListener(_customEvents.events.openModal, handleOpenModal);
  window.addEventListener(_customEvents.events.closeModal, handleCloseModal);
  window.addEventListener(_customEvents.events.loadModal, handleLoadModal);
  close.addEventListener('click', handleClick);
  overlay.addEventListener('click', handleClick);
};

exports.default = _class;

},{"../utilities/components":19,"../utilities/custom-events":20}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var siteHandle = exports.siteHandle = 'williamsconcretecontracting';

},{}],8:[function(require,module,exports){
'use strict';

require('./polyfills');

var _loader = require('./components/loader');

var _loader2 = _interopRequireDefault(_loader);

var _main = require('./components/main');

var _main2 = _interopRequireDefault(_main);

var _modal = require('./components/modal');

var _modal2 = _interopRequireDefault(_modal);

var _components = require('./utilities/components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable quote-props */


// Components
var classMap = {
  'loader': _loader2.default,
  'main': _main2.default,
  'modal': _modal2.default
};
/* eslint-enable quote-props */

// Event handler functions


// Utilities
function handleDOMConentLoaded() {
  // Call component constructors
  (0, _components.instantiate)(classMap);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', handleDOMConentLoaded);

},{"./components/loader":4,"./components/main":5,"./components/modal":6,"./polyfills":14,"./utilities/components":19}],9:[function(require,module,exports){
'use strict';

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      'use strict';

      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    }
  });
}

},{}],10:[function(require,module,exports){
'use strict';

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function value(predicate) {
      'use strict';

      if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    },
    enumerable: false,
    configurable: false,
    writable: false
  });
}

},{}],11:[function(require,module,exports){
'use strict';

// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

},{}],12:[function(require,module,exports){
'use strict';

if (!Array.from) {
  Array.from = function () {
    var toStr = Object.prototype.toString;
    var isCallable = function isCallable(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function toInteger(value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function toLength(value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }();
}

},{}],13:[function(require,module,exports){
'use strict';

// Overwrites native 'children' prototype.
// Adds Document & DocumentFragment support for IE9 & Safari.
// Returns array instead of HTMLCollection.
;(function (constructor) {
  if (constructor && constructor.prototype && constructor.prototype.children == null) {
    Object.defineProperty(constructor.prototype, 'children', {
      get: function get() {
        var i = 0,
            node,
            nodes = this.childNodes,
            children = [];
        while (node = nodes[i++]) {
          if (node.nodeType === 1) {
            children.push(node);
          }
        }
        return children;
      }
    });
  }
})(window.Node || window.Element);

},{}],14:[function(require,module,exports){
'use strict';

require('classlist-polyfill');

require('intersection-observer');

require('svgxuse');

require('./array-find');

require('./array-findindex');

require('./array-foreach');

require('./array-from');

require('./element-children');

require('./object-assign');

require('./string-includes');

require('./window-customevent');

require('./window-requestanimationframe');

},{"./array-find":9,"./array-findindex":10,"./array-foreach":11,"./array-from":12,"./element-children":13,"./object-assign":15,"./string-includes":16,"./window-customevent":17,"./window-requestanimationframe":18,"classlist-polyfill":1,"intersection-observer":2,"svgxuse":3}],15:[function(require,module,exports){
'use strict';

if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) {
    // .length of function is 2
    'use strict';

    if (target == null) {
      // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

},{}],16:[function(require,module,exports){
'use strict';

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';

    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

},{}],17:[function(require,module,exports){
"use strict";

(function () {

  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

},{}],18:[function(require,module,exports){
'use strict';

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
})();

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Config


// Utilities


exports.instantiate = instantiate;
exports.injectMarkup = injectMarkup;

var _config = require('../config');

var _spy = require('./spy');

var _classMap = null; // eslint-disable-line no-underscore-dangle

/**
 * Instantiate any components pushed onto global components array
 * @return {void}
 */
function instantiate() {
  var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (map !== null) {
    _classMap = map;
  }

  if (_classMap === null) return;

  while (window[_config.siteHandle].components.length > 0) {
    var _window$siteHandle = window[_config.siteHandle],
        components = _window$siteHandle.components,
        state = _window$siteHandle.state;

    var config = components.shift();
    var Class = _classMap[config.handle];

    if (typeof Class === 'function') {
      new Class(_extends({}, config, { state: state })); // eslint-disable-line no-new
    }
  }

  (0, _spy.spySections)();
  (0, _spy.stick)();
}

/**
 * Inject new markup into DOM after adding configs to global
 * components array then instantiate newly added components
 * @param {node} container
 * @param {string} markup
 * @param {bool} append
 * @return {void}
 */
function injectMarkup() {
  var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var markup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var append = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (!container) return;

  // Add markup to container
  if (append) {
    container.insertAdjacentHTML('beforeend', markup);
  } else {
    container.innerHTML = markup;
  }

  // Push components configs to global object
  var scripts = container.querySelectorAll('script');

  // Evaluate scripts returned from component markup if for new component
  Array.from(scripts).filter(function (script) {
    return script.textContent.includes('' + _config.siteHandle);
  }).forEach(function (script) {
    eval(script.textContent);
  }); // eslint-disable-line no-eval

  // Instantiate components
  instantiate();
}

},{"../config":7,"./spy":23}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emitEvent = emitEvent;
var events = exports.events = {
  // Action events
  lockScroll: 'lock-scroll',
  unlockScroll: 'unlock-scroll',
  loadRoute: 'load-route',
  unloadRoute: 'unload-route',
  showHeader: 'show-header',
  hideHeader: 'hide-header',
  openModal: 'open-modal',
  closeModal: 'close-modal',
  loadModal: 'load-modal',
  startLoader: 'start-loader',
  stopLoader: 'stop-loader',
  showFormErrors: 'show-form-errors'
};

/**
 * Emit event - wrapper around CustomEvent API
 * @param {string} eventHandle
 * @param {object} eventDetails
 */
function emitEvent(eventHandle, eventDetails) {
  var event = new CustomEvent(eventHandle, { detail: eventDetails });

  window.dispatchEvent(event);
}

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var immediate = arguments[2];

  var timeout = void 0;
  return function trottle() {
    var context = this;
    var args = arguments;
    var callNow = immediate && !timeout;
    function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollTo = scrollTo;
exports.scrollTop = scrollTop;
exports.scrollBottom = scrollBottom;
/**
 * Library for handling scrolling functionality
 */

var SCROLL_RATE = 1 / 10;
var FAST_SCROLL_RATE = 1 / 2;

var timer = 0;
var timerFunction = null;

function scroll(target, cb) {
  var fast = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // Logrithmic scroll rate (higher scrolls faster)
  var scrollRate = fast ? FAST_SCROLL_RATE : SCROLL_RATE;
  // Current scroll position
  var current = window.pageYOffset;
  // Set flag for scroll direction
  var down = current < target;
  // Set step based on scroll rate
  var step = Math.abs(current - target) * scrollRate + 1;
  // Set next position based on scroll direction
  var next = down ? current + step : current - step;
  // Set past flag based on scroll direction
  var isPast = down ? next >= target : next <= target;
  // Set flag to check if at bottom of window for scrolling down
  var tolerance = 5;
  var atBottom = down ? window.innerHeight + window.pageYOffset + tolerance >= document.body.offsetHeight : false;

  // Scroll to next position
  window.scrollTo(0, next);

  if (!isPast && !atBottom && timer) {
    window.requestAnimationFrame(function () {
      return scroll(target, cb);
    });

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
  timerFunction = setTimeout(function () {
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
function scrollTo(anchor) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  // Get element to scroll
  var el = document.getElementById(anchor);
  // Get position of element
  var top = el.getBoundingClientRect().top + window.pageYOffset - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(function () {
    return scroll(top, cb);
  });

  // Update URL hash
  if (window.history && window.history.pushState) {
    window.history.pushState(window.history.state, null, "#" + anchor);
  } else {
    window.location.hash = "#" + anchor;
  }
}

/**
 * Scroll to top of element
 * @param {node} element
 * @param {int} offset
 * @param {function} cb
 * @return {void}
 */
function scrollTop() {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var fast = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  // Get top position of element
  var top = el.getBoundingClientRect().top + window.pageYOffset - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(function () {
    return scroll(top, cb, fast);
  });
}

/**
 * Scroll to bottom of element
 * @param {node} element
 * @param {int} offset
 * @param {function} cb
 * @return {void}
 */
function scrollBottom() {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  // Get bottom position of element
  var bottom = el.getBoundingClientRect().top + el.offsetHeight + window.pageYOffset - offset;

  clearTimeout(timerFunction);
  setTimer();
  window.requestAnimationFrame(function () {
    return scroll(bottom, cb);
  });
}

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spySections = spySections;
exports.spyAnchors = spyAnchors;
exports.spyNav = spyNav;
exports.stick = stick;

var _debouncer = require('../utilities/debouncer');

var _debouncer2 = _interopRequireDefault(_debouncer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Spy sections and add class when in view
 * @param {string} sectionHandle
 * @param {string} inViewClass
 */
function spySections() {
  var sectionHandle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.spy';
  var inViewClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'in-view';

  var sections = document.querySelectorAll(sectionHandle);

  // Event handler functions
  function handleScroll(entries, observer) {
    if (entries.length === 0) {
      observer.disconnect();
    }

    Array.from(entries).filter(function (entry) {
      return entry.target.classList.contains(inViewClass) || entry.intersectionRatio > (entry.target.getAttribute('data-threshold') || 0.5);
    }).forEach(function (entry) {
      entry.target.classList.add(inViewClass);
      observer.unobserve(entry.target);
    });
  }

  // Initialize
  var observer = new IntersectionObserver(handleScroll, {
    // Call at multiple thresholds to allow for customization via data attribute
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });
  Array.from(sections).forEach(function (section) {
    observer.observe(section);
  });
}

/**
 * Spy section and set correspond link to active
 * @param {object}
 * |_@param {nodeList} links
 * |_@param {nodeList} links
 * |_@param {string} activeClass
 * |_@param {float} threshold
 * |_@param {function} cb
 */
// import StickyFill from 'stickyfilljs';
function spyAnchors(_ref) {
  var _ref$links = _ref.links,
      links = _ref$links === undefined ? [] : _ref$links,
      _ref$sections = _ref.sections,
      sections = _ref$sections === undefined ? [] : _ref$sections,
      _ref$activeClass = _ref.activeClass,
      activeClass = _ref$activeClass === undefined ? 'is-active' : _ref$activeClass,
      _ref$threshold = _ref.threshold,
      threshold = _ref$threshold === undefined ? window.innerHeight / 2 : _ref$threshold,
      _ref$scrollContainer = _ref.scrollContainer,
      scrollContainer = _ref$scrollContainer === undefined ? window : _ref$scrollContainer,
      _ref$cb = _ref.cb,
      cb = _ref$cb === undefined ? null : _ref$cb;

  if (!sections) return;

  function handleScroll() {
    Array.from(sections).forEach(function (section, i) {
      var rect = section.getBoundingClientRect();

      if (rect.top > threshold || rect.bottom < threshold) return;

      var activeAnchors = Array.from(links).filter(function (link, ii) {
        return link.classList.toggle(activeClass, i === ii);
      });

      if (!cb) return;

      cb(activeAnchors[0]);
    });
  }

  scrollContainer.addEventListener('scroll', handleScroll);
}

/**
 * Spy section and set correspond link to active
 * @param {object}
 * |_@param {node} el - the DOM element to watch
 * |_@param {string} fixedClass
 * |_@param {float} threshold
 * |_@param {function} cb
 *   |_@param {bool} fixed
 */
function spyNav(_ref2) {
  var el = _ref2.el,
      _ref2$nav = _ref2.nav,
      nav = _ref2$nav === undefined ? el : _ref2$nav,
      _ref2$fixedClass = _ref2.fixedClass,
      fixedClass = _ref2$fixedClass === undefined ? 'is-fixed' : _ref2$fixedClass,
      _ref2$threshold = _ref2.threshold,
      threshold = _ref2$threshold === undefined ? 1 : _ref2$threshold,
      cb = _ref2.cb;

  var delta = 5;

  // State variables
  var enabled = false;
  var lastY = 0;

  // Event handler functions
  var handleScroll = (0, _debouncer2.default)(function () {
    // Only peek header if nav to spy is fixed/enabled
    if (!enabled) {
      lastY = 0;

      return;
    }

    var thisY = window.pageYOffset;

    // Add delta for sensitivity threshold
    if (Math.abs(thisY - lastY) < delta) {
      return;
    }

    cb(thisY > lastY);

    lastY = thisY;
  }, 250);
  function handleFixObserver(entries) {
    // Toggle enabled state variable to conditionally process header peek on scroll up
    enabled = el.classList.toggle(fixedClass, entries[0].boundingClientRect.top < 0);

    cb(enabled);
  }

  // Add event listeners
  window.addEventListener('scroll', handleScroll);
  var fixObserver = new IntersectionObserver(handleFixObserver, { threshold: threshold });
  fixObserver.observe(nav);
}

/**
 * Polyfill and position sticky elements based on data attribute
 */
function stick() {
  //   const stickies = document.querySelectorAll('[data-sticky="true"]');
  // 
  //   Array.from(stickies)
  //     // Only stick elements that have not been stuck
  //     .filter(sticky => !sticky.getAttribute('data-stuck'))
  //     // Apply polyfill script for IE and add stuck data attribute
  //     .forEach(sticky => {
  //       StickyFill.addOne(sticky);
  // 
  //       sticky.setAttribute('data-stuck', true);
  //     });
}

},{"../utilities/debouncer":21}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRlcnNlY3Rpb24tb2JzZXJ2ZXIvaW50ZXJzZWN0aW9uLW9ic2VydmVyLmpzIiwibm9kZV9tb2R1bGVzL3N2Z3h1c2Uvc3ZneHVzZS5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvbG9hZGVyLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9tYWluLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9tb2RhbC5qcyIsInNyYy9zY3JpcHRzL2NvbmZpZy5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvcG9seWZpbGxzL2FycmF5LWZpbmQuanMiLCJzcmMvc2NyaXB0cy9wb2x5ZmlsbHMvYXJyYXktZmluZGluZGV4LmpzIiwic3JjL3NjcmlwdHMvcG9seWZpbGxzL2FycmF5LWZvcmVhY2guanMiLCJzcmMvc2NyaXB0cy9wb2x5ZmlsbHMvYXJyYXktZnJvbS5qcyIsInNyYy9zY3JpcHRzL3BvbHlmaWxscy9lbGVtZW50LWNoaWxkcmVuLmpzIiwic3JjL3NjcmlwdHMvcG9seWZpbGxzL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvcG9seWZpbGxzL29iamVjdC1hc3NpZ24uanMiLCJzcmMvc2NyaXB0cy9wb2x5ZmlsbHMvc3RyaW5nLWluY2x1ZGVzLmpzIiwic3JjL3NjcmlwdHMvcG9seWZpbGxzL3dpbmRvdy1jdXN0b21ldmVudC5qcyIsInNyYy9zY3JpcHRzL3BvbHlmaWxscy93aW5kb3ctcmVxdWVzdGFuaW1hdGlvbmZyYW1lLmpzIiwic3JjL3NjcmlwdHMvdXRpbGl0aWVzL2NvbXBvbmVudHMuanMiLCJzcmMvc2NyaXB0cy91dGlsaXRpZXMvY3VzdG9tLWV2ZW50cy5qcyIsInNyYy9zY3JpcHRzL3V0aWxpdGllcy9kZWJvdW5jZXIuanMiLCJzcmMvc2NyaXB0cy91dGlsaXRpZXMvc2Nyb2xsLmpzIiwic3JjL3NjcmlwdHMvdXRpbGl0aWVzL3NweS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN0T0E7Ozs7QUFFQSxJQUFNLHFCQUFxQixJQUEzQixDLENBQWlDO0FBQ2pDLElBQU0sZUFBZSxxQkFBcUIsRUFBMUM7O2FBR0Usc0JBR0c7QUFBQSxNQUZELEVBRUMsUUFGRCxFQUVDO0FBQUEsTUFERCxZQUNDLFFBREQsWUFDQzs7QUFBQTs7QUFDRCxNQUFNLEtBQUssU0FBUyxjQUFULENBQXdCLEVBQXhCLENBQVg7O0FBRUEsTUFBSSxZQUFZLEtBQWhCOztB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QixHQWxCa0IsQ0FBckI7QUFtQkEsV0FBUyxpQkFBVCxDQUEyQixPQUEzQixFQUFvQztBQUNsQztBQUNBLGNBQVUsR0FBRyxTQUFILENBQWEsTUFBYixDQUFvQixVQUFwQixFQUFnQyxRQUFRLENBQVIsRUFBVyxrQkFBWCxDQUE4QixHQUE5QixHQUFvQyxDQUFwRSxDQUFWOztBQUVBLE9BQUcsT0FBSDtBQUNEOztBQUVEO0FBQ0EsU0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFsQztBQUNBLE1BQU0sY0FBYyxJQUFJLG9CQUFKLENBQXlCLGlCQUF6QixFQUE0QyxFQUFFLG9CQUFGLEVBQTVDLENBQXBCO0FBQ0EsY0FBWSxPQUFaLENBQW9CLEdBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdPLFNBQVMsS0FBVCxHQUFpQjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuICogY2xhc3NMaXN0LmpzOiBDcm9zcy1icm93c2VyIGZ1bGwgZWxlbWVudC5jbGFzc0xpc3QgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNzA0MjdcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBEZWRpY2F0ZWQgdG8gdGhlIHB1YmxpYyBkb21haW4uXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9jbGFzc0xpc3QuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYsIGRvY3VtZW50LCBET01FeGNlcHRpb24gKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL2NsYXNzTGlzdC5qcy9ibG9iL21hc3Rlci9jbGFzc0xpc3QuanMgKi9cblxuaWYgKFwiZG9jdW1lbnRcIiBpbiB3aW5kb3cuc2VsZikge1xuXG4vLyBGdWxsIHBvbHlmaWxsIGZvciBicm93c2VycyB3aXRoIG5vIGNsYXNzTGlzdCBzdXBwb3J0XG4vLyBJbmNsdWRpbmcgSUUgPCBFZGdlIG1pc3NpbmcgU1ZHRWxlbWVudC5jbGFzc0xpc3RcbmlmICghKFwiY2xhc3NMaXN0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIikpIFxuXHR8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJnXCIpKSkge1xuXG4oZnVuY3Rpb24gKHZpZXcpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmICghKCdFbGVtZW50JyBpbiB2aWV3KSkgcmV0dXJuO1xuXG52YXJcblx0ICBjbGFzc0xpc3RQcm9wID0gXCJjbGFzc0xpc3RcIlxuXHQsIHByb3RvUHJvcCA9IFwicHJvdG90eXBlXCJcblx0LCBlbGVtQ3RyUHJvdG8gPSB2aWV3LkVsZW1lbnRbcHJvdG9Qcm9wXVxuXHQsIG9iakN0ciA9IE9iamVjdFxuXHQsIHN0clRyaW0gPSBTdHJpbmdbcHJvdG9Qcm9wXS50cmltIHx8IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTtcblx0fVxuXHQsIGFyckluZGV4T2YgPSBBcnJheVtwcm90b1Byb3BdLmluZGV4T2YgfHwgZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHR2YXJcblx0XHRcdCAgaSA9IDBcblx0XHRcdCwgbGVuID0gdGhpcy5sZW5ndGhcblx0XHQ7XG5cdFx0Zm9yICg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSB7XG5cdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdH1cblx0Ly8gVmVuZG9yczogcGxlYXNlIGFsbG93IGNvbnRlbnQgY29kZSB0byBpbnN0YW50aWF0ZSBET01FeGNlcHRpb25zXG5cdCwgRE9NRXggPSBmdW5jdGlvbiAodHlwZSwgbWVzc2FnZSkge1xuXHRcdHRoaXMubmFtZSA9IHR5cGU7XG5cdFx0dGhpcy5jb2RlID0gRE9NRXhjZXB0aW9uW3R5cGVdO1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH1cblx0LCBjaGVja1Rva2VuQW5kR2V0SW5kZXggPSBmdW5jdGlvbiAoY2xhc3NMaXN0LCB0b2tlbikge1xuXHRcdGlmICh0b2tlbiA9PT0gXCJcIikge1xuXHRcdFx0dGhyb3cgbmV3IERPTUV4KFxuXHRcdFx0XHQgIFwiU1lOVEFYX0VSUlwiXG5cdFx0XHRcdCwgXCJBbiBpbnZhbGlkIG9yIGlsbGVnYWwgc3RyaW5nIHdhcyBzcGVjaWZpZWRcIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKC9cXHMvLnRlc3QodG9rZW4pKSB7XG5cdFx0XHR0aHJvdyBuZXcgRE9NRXgoXG5cdFx0XHRcdCAgXCJJTlZBTElEX0NIQVJBQ1RFUl9FUlJcIlxuXHRcdFx0XHQsIFwiU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBhcnJJbmRleE9mLmNhbGwoY2xhc3NMaXN0LCB0b2tlbik7XG5cdH1cblx0LCBDbGFzc0xpc3QgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdHZhclxuXHRcdFx0ICB0cmltbWVkQ2xhc3NlcyA9IHN0clRyaW0uY2FsbChlbGVtLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpXG5cdFx0XHQsIGNsYXNzZXMgPSB0cmltbWVkQ2xhc3NlcyA/IHRyaW1tZWRDbGFzc2VzLnNwbGl0KC9cXHMrLykgOiBbXVxuXHRcdFx0LCBpID0gMFxuXHRcdFx0LCBsZW4gPSBjbGFzc2VzLmxlbmd0aFxuXHRcdDtcblx0XHRmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHR0aGlzLnB1c2goY2xhc3Nlc1tpXSk7XG5cdFx0fVxuXHRcdHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy50b1N0cmluZygpKTtcblx0XHR9O1xuXHR9XG5cdCwgY2xhc3NMaXN0UHJvdG8gPSBDbGFzc0xpc3RbcHJvdG9Qcm9wXSA9IFtdXG5cdCwgY2xhc3NMaXN0R2V0dGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgQ2xhc3NMaXN0KHRoaXMpO1xuXHR9XG47XG4vLyBNb3N0IERPTUV4Y2VwdGlvbiBpbXBsZW1lbnRhdGlvbnMgZG9uJ3QgYWxsb3cgY2FsbGluZyBET01FeGNlcHRpb24ncyB0b1N0cmluZygpXG4vLyBvbiBub24tRE9NRXhjZXB0aW9ucy4gRXJyb3IncyB0b1N0cmluZygpIGlzIHN1ZmZpY2llbnQgaGVyZS5cbkRPTUV4W3Byb3RvUHJvcF0gPSBFcnJvcltwcm90b1Byb3BdO1xuY2xhc3NMaXN0UHJvdG8uaXRlbSA9IGZ1bmN0aW9uIChpKSB7XG5cdHJldHVybiB0aGlzW2ldIHx8IG51bGw7XG59O1xuY2xhc3NMaXN0UHJvdG8uY29udGFpbnMgPSBmdW5jdGlvbiAodG9rZW4pIHtcblx0dG9rZW4gKz0gXCJcIjtcblx0cmV0dXJuIGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgIT09IC0xO1xufTtcbmNsYXNzTGlzdFByb3RvLmFkZCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyXG5cdFx0ICB0b2tlbnMgPSBhcmd1bWVudHNcblx0XHQsIGkgPSAwXG5cdFx0LCBsID0gdG9rZW5zLmxlbmd0aFxuXHRcdCwgdG9rZW5cblx0XHQsIHVwZGF0ZWQgPSBmYWxzZVxuXHQ7XG5cdGRvIHtcblx0XHR0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG5cdFx0aWYgKGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgPT09IC0xKSB7XG5cdFx0XHR0aGlzLnB1c2godG9rZW4pO1xuXHRcdFx0dXBkYXRlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHdoaWxlICgrK2kgPCBsKTtcblxuXHRpZiAodXBkYXRlZCkge1xuXHRcdHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuXHR9XG59O1xuY2xhc3NMaXN0UHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHR2YXJcblx0XHQgIHRva2VucyA9IGFyZ3VtZW50c1xuXHRcdCwgaSA9IDBcblx0XHQsIGwgPSB0b2tlbnMubGVuZ3RoXG5cdFx0LCB0b2tlblxuXHRcdCwgdXBkYXRlZCA9IGZhbHNlXG5cdFx0LCBpbmRleFxuXHQ7XG5cdGRvIHtcblx0XHR0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG5cdFx0aW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuXHRcdHdoaWxlIChpbmRleCAhPT0gLTEpIHtcblx0XHRcdHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdHVwZGF0ZWQgPSB0cnVlO1xuXHRcdFx0aW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuXHRcdH1cblx0fVxuXHR3aGlsZSAoKytpIDwgbCk7XG5cblx0aWYgKHVwZGF0ZWQpIHtcblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcblx0fVxufTtcbmNsYXNzTGlzdFByb3RvLnRvZ2dsZSA9IGZ1bmN0aW9uICh0b2tlbiwgZm9yY2UpIHtcblx0dG9rZW4gKz0gXCJcIjtcblxuXHR2YXJcblx0XHQgIHJlc3VsdCA9IHRoaXMuY29udGFpbnModG9rZW4pXG5cdFx0LCBtZXRob2QgPSByZXN1bHQgP1xuXHRcdFx0Zm9yY2UgIT09IHRydWUgJiYgXCJyZW1vdmVcIlxuXHRcdDpcblx0XHRcdGZvcmNlICE9PSBmYWxzZSAmJiBcImFkZFwiXG5cdDtcblxuXHRpZiAobWV0aG9kKSB7XG5cdFx0dGhpc1ttZXRob2RdKHRva2VuKTtcblx0fVxuXG5cdGlmIChmb3JjZSA9PT0gdHJ1ZSB8fCBmb3JjZSA9PT0gZmFsc2UpIHtcblx0XHRyZXR1cm4gZm9yY2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuICFyZXN1bHQ7XG5cdH1cbn07XG5jbGFzc0xpc3RQcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMuam9pbihcIiBcIik7XG59O1xuXG5pZiAob2JqQ3RyLmRlZmluZVByb3BlcnR5KSB7XG5cdHZhciBjbGFzc0xpc3RQcm9wRGVzYyA9IHtcblx0XHQgIGdldDogY2xhc3NMaXN0R2V0dGVyXG5cdFx0LCBlbnVtZXJhYmxlOiB0cnVlXG5cdFx0LCBjb25maWd1cmFibGU6IHRydWVcblx0fTtcblx0dHJ5IHtcblx0XHRvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG5cdH0gY2F0Y2ggKGV4KSB7IC8vIElFIDggZG9lc24ndCBzdXBwb3J0IGVudW1lcmFibGU6dHJ1ZVxuXHRcdC8vIGFkZGluZyB1bmRlZmluZWQgdG8gZmlnaHQgdGhpcyBpc3N1ZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9jbGFzc0xpc3QuanMvaXNzdWVzLzM2XG5cdFx0Ly8gbW9kZXJuaWUgSUU4LU1TVzcgbWFjaGluZSBoYXMgSUU4IDguMC42MDAxLjE4NzAyIGFuZCBpcyBhZmZlY3RlZFxuXHRcdGlmIChleC5udW1iZXIgPT09IHVuZGVmaW5lZCB8fCBleC5udW1iZXIgPT09IC0weDdGRjVFQzU0KSB7XG5cdFx0XHRjbGFzc0xpc3RQcm9wRGVzYy5lbnVtZXJhYmxlID0gZmFsc2U7XG5cdFx0XHRvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG5cdFx0fVxuXHR9XG59IGVsc2UgaWYgKG9iakN0cltwcm90b1Byb3BdLl9fZGVmaW5lR2V0dGVyX18pIHtcblx0ZWxlbUN0clByb3RvLl9fZGVmaW5lR2V0dGVyX18oY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0R2V0dGVyKTtcbn1cblxufSh3aW5kb3cuc2VsZikpO1xuXG59XG5cbi8vIFRoZXJlIGlzIGZ1bGwgb3IgcGFydGlhbCBuYXRpdmUgY2xhc3NMaXN0IHN1cHBvcnQsIHNvIGp1c3QgY2hlY2sgaWYgd2UgbmVlZFxuLy8gdG8gbm9ybWFsaXplIHRoZSBhZGQvcmVtb3ZlIGFuZCB0b2dnbGUgQVBJcy5cblxuKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIik7XG5cblx0dGVzdEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImMxXCIsIFwiYzJcIik7XG5cblx0Ly8gUG9seWZpbGwgZm9yIElFIDEwLzExIGFuZCBGaXJlZm94IDwyNiwgd2hlcmUgY2xhc3NMaXN0LmFkZCBhbmRcblx0Ly8gY2xhc3NMaXN0LnJlbW92ZSBleGlzdCBidXQgc3VwcG9ydCBvbmx5IG9uZSBhcmd1bWVudCBhdCBhIHRpbWUuXG5cdGlmICghdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzJcIikpIHtcblx0XHR2YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kKSB7XG5cdFx0XHR2YXIgb3JpZ2luYWwgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF07XG5cblx0XHRcdERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHRva2VuKSB7XG5cdFx0XHRcdHZhciBpLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuXG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRcdHRva2VuID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0XHRcdG9yaWdpbmFsLmNhbGwodGhpcywgdG9rZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0Y3JlYXRlTWV0aG9kKCdhZGQnKTtcblx0XHRjcmVhdGVNZXRob2QoJ3JlbW92ZScpO1xuXHR9XG5cblx0dGVzdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImMzXCIsIGZhbHNlKTtcblxuXHQvLyBQb2x5ZmlsbCBmb3IgSUUgMTAgYW5kIEZpcmVmb3ggPDI0LCB3aGVyZSBjbGFzc0xpc3QudG9nZ2xlIGRvZXMgbm90XG5cdC8vIHN1cHBvcnQgdGhlIHNlY29uZCBhcmd1bWVudC5cblx0aWYgKHRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMzXCIpKSB7XG5cdFx0dmFyIF90b2dnbGUgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZTtcblxuXHRcdERPTVRva2VuTGlzdC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24odG9rZW4sIGZvcmNlKSB7XG5cdFx0XHRpZiAoMSBpbiBhcmd1bWVudHMgJiYgIXRoaXMuY29udGFpbnModG9rZW4pID09PSAhZm9yY2UpIHtcblx0XHRcdFx0cmV0dXJuIGZvcmNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIF90b2dnbGUuY2FsbCh0aGlzLCB0b2tlbik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHR9XG5cblx0dGVzdEVsZW1lbnQgPSBudWxsO1xufSgpKTtcblxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBXM0MgU09GVFdBUkUgQU5EIERPQ1VNRU5UIE5PVElDRSBBTkQgTElDRU5TRS5cbiAqXG4gKiAgaHR0cHM6Ly93d3cudzMub3JnL0NvbnNvcnRpdW0vTGVnYWwvMjAxNS9jb3B5cmlnaHQtc29mdHdhcmUtYW5kLWRvY3VtZW50XG4gKlxuICovXG5cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG4ndXNlIHN0cmljdCc7XG5cblxuLy8gRXhpdHMgZWFybHkgaWYgYWxsIEludGVyc2VjdGlvbk9ic2VydmVyIGFuZCBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5XG4vLyBmZWF0dXJlcyBhcmUgbmF0aXZlbHkgc3VwcG9ydGVkLlxuaWYgKCdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93ICYmXG4gICAgJ0ludGVyc2VjdGlvbk9ic2VydmVyRW50cnknIGluIHdpbmRvdyAmJlxuICAgICdpbnRlcnNlY3Rpb25SYXRpbycgaW4gd2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlKSB7XG5cbiAgLy8gTWluaW1hbCBwb2x5ZmlsbCBmb3IgRWRnZSAxNSdzIGxhY2sgb2YgYGlzSW50ZXJzZWN0aW5nYFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS93M2MvSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvaXNzdWVzLzIxMVxuICBpZiAoISgnaXNJbnRlcnNlY3RpbmcnIGluIHdpbmRvdy5JbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5LnByb3RvdHlwZSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlLFxuICAgICAgJ2lzSW50ZXJzZWN0aW5nJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdGlvblJhdGlvID4gMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm47XG59XG5cblxuLyoqXG4gKiBBbiBJbnRlcnNlY3Rpb25PYnNlcnZlciByZWdpc3RyeS4gVGhpcyByZWdpc3RyeSBleGlzdHMgdG8gaG9sZCBhIHN0cm9uZ1xuICogcmVmZXJlbmNlIHRvIEludGVyc2VjdGlvbk9ic2VydmVyIGluc3RhbmNlcyBjdXJyZW50bHkgb2JzZXJ2aW5nIGEgdGFyZ2V0XG4gKiBlbGVtZW50LiBXaXRob3V0IHRoaXMgcmVnaXN0cnksIGluc3RhbmNlcyB3aXRob3V0IGFub3RoZXIgcmVmZXJlbmNlIG1heSBiZVxuICogZ2FyYmFnZSBjb2xsZWN0ZWQuXG4gKi9cbnZhciByZWdpc3RyeSA9IFtdO1xuXG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgZ2xvYmFsIEludGVyc2VjdGlvbk9ic2VydmVyRW50cnkgY29uc3RydWN0b3IuXG4gKiBodHRwczovL3czYy5naXRodWIuaW8vSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvI2ludGVyc2VjdGlvbi1vYnNlcnZlci1lbnRyeVxuICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IEEgZGljdGlvbmFyeSBvZiBpbnN0YW5jZSBwcm9wZXJ0aWVzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEludGVyc2VjdGlvbk9ic2VydmVyRW50cnkoZW50cnkpIHtcbiAgdGhpcy50aW1lID0gZW50cnkudGltZTtcbiAgdGhpcy50YXJnZXQgPSBlbnRyeS50YXJnZXQ7XG4gIHRoaXMucm9vdEJvdW5kcyA9IGVudHJ5LnJvb3RCb3VuZHM7XG4gIHRoaXMuYm91bmRpbmdDbGllbnRSZWN0ID0gZW50cnkuYm91bmRpbmdDbGllbnRSZWN0O1xuICB0aGlzLmludGVyc2VjdGlvblJlY3QgPSBlbnRyeS5pbnRlcnNlY3Rpb25SZWN0IHx8IGdldEVtcHR5UmVjdCgpO1xuICB0aGlzLmlzSW50ZXJzZWN0aW5nID0gISFlbnRyeS5pbnRlcnNlY3Rpb25SZWN0O1xuXG4gIC8vIENhbGN1bGF0ZXMgdGhlIGludGVyc2VjdGlvbiByYXRpby5cbiAgdmFyIHRhcmdldFJlY3QgPSB0aGlzLmJvdW5kaW5nQ2xpZW50UmVjdDtcbiAgdmFyIHRhcmdldEFyZWEgPSB0YXJnZXRSZWN0LndpZHRoICogdGFyZ2V0UmVjdC5oZWlnaHQ7XG4gIHZhciBpbnRlcnNlY3Rpb25SZWN0ID0gdGhpcy5pbnRlcnNlY3Rpb25SZWN0O1xuICB2YXIgaW50ZXJzZWN0aW9uQXJlYSA9IGludGVyc2VjdGlvblJlY3Qud2lkdGggKiBpbnRlcnNlY3Rpb25SZWN0LmhlaWdodDtcblxuICAvLyBTZXRzIGludGVyc2VjdGlvbiByYXRpby5cbiAgaWYgKHRhcmdldEFyZWEpIHtcbiAgICAvLyBSb3VuZCB0aGUgaW50ZXJzZWN0aW9uIHJhdGlvIHRvIGF2b2lkIGZsb2F0aW5nIHBvaW50IG1hdGggaXNzdWVzOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS93M2MvSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvaXNzdWVzLzMyNFxuICAgIHRoaXMuaW50ZXJzZWN0aW9uUmF0aW8gPSBOdW1iZXIoKGludGVyc2VjdGlvbkFyZWEgLyB0YXJnZXRBcmVhKS50b0ZpeGVkKDQpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiBhcmVhIGlzIHplcm8gYW5kIGlzIGludGVyc2VjdGluZywgc2V0cyB0byAxLCBvdGhlcndpc2UgdG8gMFxuICAgIHRoaXMuaW50ZXJzZWN0aW9uUmF0aW8gPSB0aGlzLmlzSW50ZXJzZWN0aW5nID8gMSA6IDA7XG4gIH1cbn1cblxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGdsb2JhbCBJbnRlcnNlY3Rpb25PYnNlcnZlciBjb25zdHJ1Y3Rvci5cbiAqIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby9JbnRlcnNlY3Rpb25PYnNlcnZlci8jaW50ZXJzZWN0aW9uLW9ic2VydmVyLWludGVyZmFjZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgYWZ0ZXIgaW50ZXJzZWN0aW9uXG4gKiAgICAgY2hhbmdlcyBoYXZlIHF1ZXVlZC4gVGhlIGZ1bmN0aW9uIGlzIG5vdCBpbnZva2VkIGlmIHRoZSBxdWV1ZSBoYXNcbiAqICAgICBiZWVuIGVtcHRpZWQgYnkgY2FsbGluZyB0aGUgYHRha2VSZWNvcmRzYCBtZXRob2QuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9vcHRpb25zIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbnRlcnNlY3Rpb25PYnNlcnZlcihjYWxsYmFjaywgb3B0X29wdGlvbnMpIHtcblxuICB2YXIgb3B0aW9ucyA9IG9wdF9vcHRpb25zIHx8IHt9O1xuXG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5yb290ICYmIG9wdGlvbnMucm9vdC5ub2RlVHlwZSAhPSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb290IG11c3QgYmUgYW4gRWxlbWVudCcpO1xuICB9XG5cbiAgLy8gQmluZHMgYW5kIHRocm90dGxlcyBgdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zYC5cbiAgdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zID0gdGhyb3R0bGUoXG4gICAgICB0aGlzLl9jaGVja0ZvckludGVyc2VjdGlvbnMuYmluZCh0aGlzKSwgdGhpcy5USFJPVFRMRV9USU1FT1VUKTtcblxuICAvLyBQcml2YXRlIHByb3BlcnRpZXMuXG4gIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gIHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cyA9IFtdO1xuICB0aGlzLl9xdWV1ZWRFbnRyaWVzID0gW107XG4gIHRoaXMuX3Jvb3RNYXJnaW5WYWx1ZXMgPSB0aGlzLl9wYXJzZVJvb3RNYXJnaW4ob3B0aW9ucy5yb290TWFyZ2luKTtcblxuICAvLyBQdWJsaWMgcHJvcGVydGllcy5cbiAgdGhpcy50aHJlc2hvbGRzID0gdGhpcy5faW5pdFRocmVzaG9sZHMob3B0aW9ucy50aHJlc2hvbGQpO1xuICB0aGlzLnJvb3QgPSBvcHRpb25zLnJvb3QgfHwgbnVsbDtcbiAgdGhpcy5yb290TWFyZ2luID0gdGhpcy5fcm9vdE1hcmdpblZhbHVlcy5tYXAoZnVuY3Rpb24obWFyZ2luKSB7XG4gICAgcmV0dXJuIG1hcmdpbi52YWx1ZSArIG1hcmdpbi51bml0O1xuICB9KS5qb2luKCcgJyk7XG59XG5cblxuLyoqXG4gKiBUaGUgbWluaW11bSBpbnRlcnZhbCB3aXRoaW4gd2hpY2ggdGhlIGRvY3VtZW50IHdpbGwgYmUgY2hlY2tlZCBmb3JcbiAqIGludGVyc2VjdGlvbiBjaGFuZ2VzLlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuVEhST1RUTEVfVElNRU9VVCA9IDEwMDtcblxuXG4vKipcbiAqIFRoZSBmcmVxdWVuY3kgaW4gd2hpY2ggdGhlIHBvbHlmaWxsIHBvbGxzIGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcy5cbiAqIHRoaXMgY2FuIGJlIHVwZGF0ZWQgb24gYSBwZXIgaW5zdGFuY2UgYmFzaXMgYW5kIG11c3QgYmUgc2V0IHByaW9yIHRvXG4gKiBjYWxsaW5nIGBvYnNlcnZlYCBvbiB0aGUgZmlyc3QgdGFyZ2V0LlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuUE9MTF9JTlRFUlZBTCA9IG51bGw7XG5cbi8qKlxuICogVXNlIGEgbXV0YXRpb24gb2JzZXJ2ZXIgb24gdGhlIHJvb3QgZWxlbWVudFxuICogdG8gZGV0ZWN0IGludGVyc2VjdGlvbiBjaGFuZ2VzLlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuVVNFX01VVEFUSU9OX09CU0VSVkVSID0gdHJ1ZTtcblxuXG4vKipcbiAqIFN0YXJ0cyBvYnNlcnZpbmcgYSB0YXJnZXQgZWxlbWVudCBmb3IgaW50ZXJzZWN0aW9uIGNoYW5nZXMgYmFzZWQgb25cbiAqIHRoZSB0aHJlc2hvbGRzIHZhbHVlcy5cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRoZSBET00gZWxlbWVudCB0byBvYnNlcnZlLlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICB2YXIgaXNUYXJnZXRBbHJlYWR5T2JzZXJ2ZWQgPSB0aGlzLl9vYnNlcnZhdGlvblRhcmdldHMuc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uZWxlbWVudCA9PSB0YXJnZXQ7XG4gIH0pO1xuXG4gIGlmIChpc1RhcmdldEFscmVhZHlPYnNlcnZlZCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghKHRhcmdldCAmJiB0YXJnZXQubm9kZVR5cGUgPT0gMSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIEVsZW1lbnQnKTtcbiAgfVxuXG4gIHRoaXMuX3JlZ2lzdGVySW5zdGFuY2UoKTtcbiAgdGhpcy5fb2JzZXJ2YXRpb25UYXJnZXRzLnB1c2goe2VsZW1lbnQ6IHRhcmdldCwgZW50cnk6IG51bGx9KTtcbiAgdGhpcy5fbW9uaXRvckludGVyc2VjdGlvbnMoKTtcbiAgdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zKCk7XG59O1xuXG5cbi8qKlxuICogU3RvcHMgb2JzZXJ2aW5nIGEgdGFyZ2V0IGVsZW1lbnQgZm9yIGludGVyc2VjdGlvbiBjaGFuZ2VzLlxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGhlIERPTSBlbGVtZW50IHRvIG9ic2VydmUuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS51bm9ic2VydmUgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgdGhpcy5fb2JzZXJ2YXRpb25UYXJnZXRzID1cbiAgICAgIHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuXG4gICAgcmV0dXJuIGl0ZW0uZWxlbWVudCAhPSB0YXJnZXQ7XG4gIH0pO1xuICBpZiAoIXRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cy5sZW5ndGgpIHtcbiAgICB0aGlzLl91bm1vbml0b3JJbnRlcnNlY3Rpb25zKCk7XG4gICAgdGhpcy5fdW5yZWdpc3Rlckluc3RhbmNlKCk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTdG9wcyBvYnNlcnZpbmcgYWxsIHRhcmdldCBlbGVtZW50cyBmb3IgaW50ZXJzZWN0aW9uIGNoYW5nZXMuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cyA9IFtdO1xuICB0aGlzLl91bm1vbml0b3JJbnRlcnNlY3Rpb25zKCk7XG4gIHRoaXMuX3VucmVnaXN0ZXJJbnN0YW5jZSgpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgYW55IHF1ZXVlIGVudHJpZXMgdGhhdCBoYXZlIG5vdCB5ZXQgYmVlbiByZXBvcnRlZCB0byB0aGVcbiAqIGNhbGxiYWNrIGFuZCBjbGVhcnMgdGhlIHF1ZXVlLiBUaGlzIGNhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggdGhlXG4gKiBjYWxsYmFjayB0byBvYnRhaW4gdGhlIGFic29sdXRlIG1vc3QgdXAtdG8tZGF0ZSBpbnRlcnNlY3Rpb24gaW5mb3JtYXRpb24uXG4gKiBAcmV0dXJuIHtBcnJheX0gVGhlIGN1cnJlbnRseSBxdWV1ZWQgZW50cmllcy5cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLnRha2VSZWNvcmRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZWNvcmRzID0gdGhpcy5fcXVldWVkRW50cmllcy5zbGljZSgpO1xuICB0aGlzLl9xdWV1ZWRFbnRyaWVzID0gW107XG4gIHJldHVybiByZWNvcmRzO1xufTtcblxuXG4vKipcbiAqIEFjY2VwdHMgdGhlIHRocmVzaG9sZCB2YWx1ZSBmcm9tIHRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFuZFxuICogcmV0dXJucyBhIHNvcnRlZCBhcnJheSBvZiB1bmlxdWUgdGhyZXNob2xkIHZhbHVlcy4gSWYgYSB2YWx1ZSBpcyBub3RcbiAqIGJldHdlZW4gMCBhbmQgMSBhbmQgZXJyb3IgaXMgdGhyb3duLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8bnVtYmVyPX0gb3B0X3RocmVzaG9sZCBBbiBvcHRpb25hbCB0aHJlc2hvbGQgdmFsdWUgb3JcbiAqICAgICBhIGxpc3Qgb2YgdGhyZXNob2xkIHZhbHVlcywgZGVmYXVsdGluZyB0byBbMF0uXG4gKiBAcmV0dXJuIHtBcnJheX0gQSBzb3J0ZWQgbGlzdCBvZiB1bmlxdWUgYW5kIHZhbGlkIHRocmVzaG9sZCB2YWx1ZXMuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5faW5pdFRocmVzaG9sZHMgPSBmdW5jdGlvbihvcHRfdGhyZXNob2xkKSB7XG4gIHZhciB0aHJlc2hvbGQgPSBvcHRfdGhyZXNob2xkIHx8IFswXTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHRocmVzaG9sZCkpIHRocmVzaG9sZCA9IFt0aHJlc2hvbGRdO1xuXG4gIHJldHVybiB0aHJlc2hvbGQuc29ydCgpLmZpbHRlcihmdW5jdGlvbih0LCBpLCBhKSB7XG4gICAgaWYgKHR5cGVvZiB0ICE9ICdudW1iZXInIHx8IGlzTmFOKHQpIHx8IHQgPCAwIHx8IHQgPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RocmVzaG9sZCBtdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMSBpbmNsdXNpdmVseScpO1xuICAgIH1cbiAgICByZXR1cm4gdCAhPT0gYVtpIC0gMV07XG4gIH0pO1xufTtcblxuXG4vKipcbiAqIEFjY2VwdHMgdGhlIHJvb3RNYXJnaW4gdmFsdWUgZnJvbSB0aGUgdXNlciBjb25maWd1cmF0aW9uIG9iamVjdFxuICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgdGhlIGZvdXIgbWFyZ2luIHZhbHVlcyBhcyBhbiBvYmplY3QgY29udGFpbmluZ1xuICogdGhlIHZhbHVlIGFuZCB1bml0IHByb3BlcnRpZXMuIElmIGFueSBvZiB0aGUgdmFsdWVzIGFyZSBub3QgcHJvcGVybHlcbiAqIGZvcm1hdHRlZCBvciB1c2UgYSB1bml0IG90aGVyIHRoYW4gcHggb3IgJSwgYW5kIGVycm9yIGlzIHRocm93bi5cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9yb290TWFyZ2luIEFuIG9wdGlvbmFsIHJvb3RNYXJnaW4gdmFsdWUsXG4gKiAgICAgZGVmYXVsdGluZyB0byAnMHB4Jy5cbiAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59IEFuIGFycmF5IG9mIG1hcmdpbiBvYmplY3RzIHdpdGggdGhlIGtleXNcbiAqICAgICB2YWx1ZSBhbmQgdW5pdC5cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9wYXJzZVJvb3RNYXJnaW4gPSBmdW5jdGlvbihvcHRfcm9vdE1hcmdpbikge1xuICB2YXIgbWFyZ2luU3RyaW5nID0gb3B0X3Jvb3RNYXJnaW4gfHwgJzBweCc7XG4gIHZhciBtYXJnaW5zID0gbWFyZ2luU3RyaW5nLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKG1hcmdpbikge1xuICAgIHZhciBwYXJ0cyA9IC9eKC0/XFxkKlxcLj9cXGQrKShweHwlKSQvLmV4ZWMobWFyZ2luKTtcbiAgICBpZiAoIXBhcnRzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jvb3RNYXJnaW4gbXVzdCBiZSBzcGVjaWZpZWQgaW4gcGl4ZWxzIG9yIHBlcmNlbnQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHt2YWx1ZTogcGFyc2VGbG9hdChwYXJ0c1sxXSksIHVuaXQ6IHBhcnRzWzJdfTtcbiAgfSk7XG5cbiAgLy8gSGFuZGxlcyBzaG9ydGhhbmQuXG4gIG1hcmdpbnNbMV0gPSBtYXJnaW5zWzFdIHx8IG1hcmdpbnNbMF07XG4gIG1hcmdpbnNbMl0gPSBtYXJnaW5zWzJdIHx8IG1hcmdpbnNbMF07XG4gIG1hcmdpbnNbM10gPSBtYXJnaW5zWzNdIHx8IG1hcmdpbnNbMV07XG5cbiAgcmV0dXJuIG1hcmdpbnM7XG59O1xuXG5cbi8qKlxuICogU3RhcnRzIHBvbGxpbmcgZm9yIGludGVyc2VjdGlvbiBjaGFuZ2VzIGlmIHRoZSBwb2xsaW5nIGlzIG5vdCBhbHJlYWR5XG4gKiBoYXBwZW5pbmcsIGFuZCBpZiB0aGUgcGFnZSdzIHZpc2liaWxpdHkgc3RhdGUgaXMgdmlzaWJsZS5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fbW9uaXRvckludGVyc2VjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLl9tb25pdG9yaW5nSW50ZXJzZWN0aW9ucykge1xuICAgIHRoaXMuX21vbml0b3JpbmdJbnRlcnNlY3Rpb25zID0gdHJ1ZTtcblxuICAgIC8vIElmIGEgcG9sbCBpbnRlcnZhbCBpcyBzZXQsIHVzZSBwb2xsaW5nIGluc3RlYWQgb2YgbGlzdGVuaW5nIHRvXG4gICAgLy8gcmVzaXplIGFuZCBzY3JvbGwgZXZlbnRzIG9yIERPTSBtdXRhdGlvbnMuXG4gICAgaWYgKHRoaXMuUE9MTF9JTlRFUlZBTCkge1xuICAgICAgdGhpcy5fbW9uaXRvcmluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoXG4gICAgICAgICAgdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zLCB0aGlzLlBPTExfSU5URVJWQUwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFkZEV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuX2NoZWNrRm9ySW50ZXJzZWN0aW9ucywgdHJ1ZSk7XG4gICAgICBhZGRFdmVudChkb2N1bWVudCwgJ3Njcm9sbCcsIHRoaXMuX2NoZWNrRm9ySW50ZXJzZWN0aW9ucywgdHJ1ZSk7XG5cbiAgICAgIGlmICh0aGlzLlVTRV9NVVRBVElPTl9PQlNFUlZFUiAmJiAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4gICAgICAgIHRoaXMuX2RvbU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdGhpcy5fZG9tT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgc3VidHJlZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTdG9wcyBwb2xsaW5nIGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcy5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fdW5tb25pdG9ySW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fbW9uaXRvcmluZ0ludGVyc2VjdGlvbnMpIHtcbiAgICB0aGlzLl9tb25pdG9yaW5nSW50ZXJzZWN0aW9ucyA9IGZhbHNlO1xuXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl9tb25pdG9yaW5nSW50ZXJ2YWwpO1xuICAgIHRoaXMuX21vbml0b3JpbmdJbnRlcnZhbCA9IG51bGw7XG5cbiAgICByZW1vdmVFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9jaGVja0ZvckludGVyc2VjdGlvbnMsIHRydWUpO1xuICAgIHJlbW92ZUV2ZW50KGRvY3VtZW50LCAnc2Nyb2xsJywgdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zLCB0cnVlKTtcblxuICAgIGlmICh0aGlzLl9kb21PYnNlcnZlcikge1xuICAgICAgdGhpcy5fZG9tT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5fZG9tT2JzZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFNjYW5zIGVhY2ggb2JzZXJ2YXRpb24gdGFyZ2V0IGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcyBhbmQgYWRkcyB0aGVtXG4gKiB0byB0aGUgaW50ZXJuYWwgZW50cmllcyBxdWV1ZS4gSWYgbmV3IGVudHJpZXMgYXJlIGZvdW5kLCBpdFxuICogc2NoZWR1bGVzIHRoZSBjYWxsYmFjayB0byBiZSBpbnZva2VkLlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9jaGVja0ZvckludGVyc2VjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJvb3RJc0luRG9tID0gdGhpcy5fcm9vdElzSW5Eb20oKTtcbiAgdmFyIHJvb3RSZWN0ID0gcm9vdElzSW5Eb20gPyB0aGlzLl9nZXRSb290UmVjdCgpIDogZ2V0RW1wdHlSZWN0KCk7XG5cbiAgdGhpcy5fb2JzZXJ2YXRpb25UYXJnZXRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciB0YXJnZXQgPSBpdGVtLmVsZW1lbnQ7XG4gICAgdmFyIHRhcmdldFJlY3QgPSBnZXRCb3VuZGluZ0NsaWVudFJlY3QodGFyZ2V0KTtcbiAgICB2YXIgcm9vdENvbnRhaW5zVGFyZ2V0ID0gdGhpcy5fcm9vdENvbnRhaW5zVGFyZ2V0KHRhcmdldCk7XG4gICAgdmFyIG9sZEVudHJ5ID0gaXRlbS5lbnRyeTtcbiAgICB2YXIgaW50ZXJzZWN0aW9uUmVjdCA9IHJvb3RJc0luRG9tICYmIHJvb3RDb250YWluc1RhcmdldCAmJlxuICAgICAgICB0aGlzLl9jb21wdXRlVGFyZ2V0QW5kUm9vdEludGVyc2VjdGlvbih0YXJnZXQsIHJvb3RSZWN0KTtcblxuICAgIHZhciBuZXdFbnRyeSA9IGl0ZW0uZW50cnkgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSh7XG4gICAgICB0aW1lOiBub3coKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgYm91bmRpbmdDbGllbnRSZWN0OiB0YXJnZXRSZWN0LFxuICAgICAgcm9vdEJvdW5kczogcm9vdFJlY3QsXG4gICAgICBpbnRlcnNlY3Rpb25SZWN0OiBpbnRlcnNlY3Rpb25SZWN0XG4gICAgfSk7XG5cbiAgICBpZiAoIW9sZEVudHJ5KSB7XG4gICAgICB0aGlzLl9xdWV1ZWRFbnRyaWVzLnB1c2gobmV3RW50cnkpO1xuICAgIH0gZWxzZSBpZiAocm9vdElzSW5Eb20gJiYgcm9vdENvbnRhaW5zVGFyZ2V0KSB7XG4gICAgICAvLyBJZiB0aGUgbmV3IGVudHJ5IGludGVyc2VjdGlvbiByYXRpbyBoYXMgY3Jvc3NlZCBhbnkgb2YgdGhlXG4gICAgICAvLyB0aHJlc2hvbGRzLCBhZGQgYSBuZXcgZW50cnkuXG4gICAgICBpZiAodGhpcy5faGFzQ3Jvc3NlZFRocmVzaG9sZChvbGRFbnRyeSwgbmV3RW50cnkpKSB7XG4gICAgICAgIHRoaXMuX3F1ZXVlZEVudHJpZXMucHVzaChuZXdFbnRyeSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSByb290IGlzIG5vdCBpbiB0aGUgRE9NIG9yIHRhcmdldCBpcyBub3QgY29udGFpbmVkIHdpdGhpblxuICAgICAgLy8gcm9vdCBidXQgdGhlIHByZXZpb3VzIGVudHJ5IGZvciB0aGlzIHRhcmdldCBoYWQgYW4gaW50ZXJzZWN0aW9uLFxuICAgICAgLy8gYWRkIGEgbmV3IHJlY29yZCBpbmRpY2F0aW5nIHJlbW92YWwuXG4gICAgICBpZiAob2xkRW50cnkgJiYgb2xkRW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgdGhpcy5fcXVldWVkRW50cmllcy5wdXNoKG5ld0VudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHRoaXMpO1xuXG4gIGlmICh0aGlzLl9xdWV1ZWRFbnRyaWVzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrKHRoaXMudGFrZVJlY29yZHMoKSwgdGhpcyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBBY2NlcHRzIGEgdGFyZ2V0IGFuZCByb290IHJlY3QgY29tcHV0ZXMgdGhlIGludGVyc2VjdGlvbiBiZXR3ZWVuIHRoZW5cbiAqIGZvbGxvd2luZyB0aGUgYWxnb3JpdGhtIGluIHRoZSBzcGVjLlxuICogVE9ETyhwaGlsaXB3YWx0b24pOiBhdCB0aGlzIHRpbWUgY2xpcC1wYXRoIGlzIG5vdCBjb25zaWRlcmVkLlxuICogaHR0cHM6Ly93M2MuZ2l0aHViLmlvL0ludGVyc2VjdGlvbk9ic2VydmVyLyNjYWxjdWxhdGUtaW50ZXJzZWN0aW9uLXJlY3QtYWxnb1xuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGhlIHRhcmdldCBET00gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IHJvb3RSZWN0IFRoZSBib3VuZGluZyByZWN0IG9mIHRoZSByb290IGFmdGVyIGJlaW5nXG4gKiAgICAgZXhwYW5kZWQgYnkgdGhlIHJvb3RNYXJnaW4gdmFsdWUuXG4gKiBAcmV0dXJuIHs/T2JqZWN0fSBUaGUgZmluYWwgaW50ZXJzZWN0aW9uIHJlY3Qgb2JqZWN0IG9yIHVuZGVmaW5lZCBpZiBub1xuICogICAgIGludGVyc2VjdGlvbiBpcyBmb3VuZC5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fY29tcHV0ZVRhcmdldEFuZFJvb3RJbnRlcnNlY3Rpb24gPVxuICAgIGZ1bmN0aW9uKHRhcmdldCwgcm9vdFJlY3QpIHtcblxuICAvLyBJZiB0aGUgZWxlbWVudCBpc24ndCBkaXNwbGF5ZWQsIGFuIGludGVyc2VjdGlvbiBjYW4ndCBoYXBwZW4uXG4gIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmRpc3BsYXkgPT0gJ25vbmUnKSByZXR1cm47XG5cbiAgdmFyIHRhcmdldFJlY3QgPSBnZXRCb3VuZGluZ0NsaWVudFJlY3QodGFyZ2V0KTtcbiAgdmFyIGludGVyc2VjdGlvblJlY3QgPSB0YXJnZXRSZWN0O1xuICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50Tm9kZSh0YXJnZXQpO1xuICB2YXIgYXRSb290ID0gZmFsc2U7XG5cbiAgd2hpbGUgKCFhdFJvb3QpIHtcbiAgICB2YXIgcGFyZW50UmVjdCA9IG51bGw7XG4gICAgdmFyIHBhcmVudENvbXB1dGVkU3R5bGUgPSBwYXJlbnQubm9kZVR5cGUgPT0gMSA/XG4gICAgICAgIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudCkgOiB7fTtcblxuICAgIC8vIElmIHRoZSBwYXJlbnQgaXNuJ3QgZGlzcGxheWVkLCBhbiBpbnRlcnNlY3Rpb24gY2FuJ3QgaGFwcGVuLlxuICAgIGlmIChwYXJlbnRDb21wdXRlZFN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnKSByZXR1cm47XG5cbiAgICBpZiAocGFyZW50ID09IHRoaXMucm9vdCB8fCBwYXJlbnQgPT0gZG9jdW1lbnQpIHtcbiAgICAgIGF0Um9vdCA9IHRydWU7XG4gICAgICBwYXJlbnRSZWN0ID0gcm9vdFJlY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IGhhcyBhIG5vbi12aXNpYmxlIG92ZXJmbG93LCBhbmQgaXQncyBub3QgdGhlIDxib2R5PlxuICAgICAgLy8gb3IgPGh0bWw+IGVsZW1lbnQsIHVwZGF0ZSB0aGUgaW50ZXJzZWN0aW9uIHJlY3QuXG4gICAgICAvLyBOb3RlOiA8Ym9keT4gYW5kIDxodG1sPiBjYW5ub3QgYmUgY2xpcHBlZCB0byBhIHJlY3QgdGhhdCdzIG5vdCBhbHNvXG4gICAgICAvLyB0aGUgZG9jdW1lbnQgcmVjdCwgc28gbm8gbmVlZCB0byBjb21wdXRlIGEgbmV3IGludGVyc2VjdGlvbi5cbiAgICAgIGlmIChwYXJlbnQgIT0gZG9jdW1lbnQuYm9keSAmJlxuICAgICAgICAgIHBhcmVudCAhPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiZcbiAgICAgICAgICBwYXJlbnRDb21wdXRlZFN0eWxlLm92ZXJmbG93ICE9ICd2aXNpYmxlJykge1xuICAgICAgICBwYXJlbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgZWl0aGVyIG9mIHRoZSBhYm92ZSBjb25kaXRpb25hbHMgc2V0IGEgbmV3IHBhcmVudFJlY3QsXG4gICAgLy8gY2FsY3VsYXRlIG5ldyBpbnRlcnNlY3Rpb24gZGF0YS5cbiAgICBpZiAocGFyZW50UmVjdCkge1xuICAgICAgaW50ZXJzZWN0aW9uUmVjdCA9IGNvbXB1dGVSZWN0SW50ZXJzZWN0aW9uKHBhcmVudFJlY3QsIGludGVyc2VjdGlvblJlY3QpO1xuXG4gICAgICBpZiAoIWludGVyc2VjdGlvblJlY3QpIGJyZWFrO1xuICAgIH1cbiAgICBwYXJlbnQgPSBnZXRQYXJlbnROb2RlKHBhcmVudCk7XG4gIH1cbiAgcmV0dXJuIGludGVyc2VjdGlvblJlY3Q7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcm9vdCByZWN0IGFmdGVyIGJlaW5nIGV4cGFuZGVkIGJ5IHRoZSByb290TWFyZ2luIHZhbHVlLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgZXhwYW5kZWQgcm9vdCByZWN0LlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9nZXRSb290UmVjdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcm9vdFJlY3Q7XG4gIGlmICh0aGlzLnJvb3QpIHtcbiAgICByb290UmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdCh0aGlzLnJvb3QpO1xuICB9IGVsc2Uge1xuICAgIC8vIFVzZSA8aHRtbD4vPGJvZHk+IGluc3RlYWQgb2Ygd2luZG93IHNpbmNlIHNjcm9sbCBiYXJzIGFmZmVjdCBzaXplLlxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICByb290UmVjdCA9IHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICByaWdodDogaHRtbC5jbGllbnRXaWR0aCB8fCBib2R5LmNsaWVudFdpZHRoLFxuICAgICAgd2lkdGg6IGh0bWwuY2xpZW50V2lkdGggfHwgYm9keS5jbGllbnRXaWR0aCxcbiAgICAgIGJvdHRvbTogaHRtbC5jbGllbnRIZWlnaHQgfHwgYm9keS5jbGllbnRIZWlnaHQsXG4gICAgICBoZWlnaHQ6IGh0bWwuY2xpZW50SGVpZ2h0IHx8IGJvZHkuY2xpZW50SGVpZ2h0XG4gICAgfTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXhwYW5kUmVjdEJ5Um9vdE1hcmdpbihyb290UmVjdCk7XG59O1xuXG5cbi8qKlxuICogQWNjZXB0cyBhIHJlY3QgYW5kIGV4cGFuZHMgaXQgYnkgdGhlIHJvb3RNYXJnaW4gdmFsdWUuXG4gKiBAcGFyYW0ge09iamVjdH0gcmVjdCBUaGUgcmVjdCBvYmplY3QgdG8gZXhwYW5kLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgZXhwYW5kZWQgcmVjdC5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fZXhwYW5kUmVjdEJ5Um9vdE1hcmdpbiA9IGZ1bmN0aW9uKHJlY3QpIHtcbiAgdmFyIG1hcmdpbnMgPSB0aGlzLl9yb290TWFyZ2luVmFsdWVzLm1hcChmdW5jdGlvbihtYXJnaW4sIGkpIHtcbiAgICByZXR1cm4gbWFyZ2luLnVuaXQgPT0gJ3B4JyA/IG1hcmdpbi52YWx1ZSA6XG4gICAgICAgIG1hcmdpbi52YWx1ZSAqIChpICUgMiA/IHJlY3Qud2lkdGggOiByZWN0LmhlaWdodCkgLyAxMDA7XG4gIH0pO1xuICB2YXIgbmV3UmVjdCA9IHtcbiAgICB0b3A6IHJlY3QudG9wIC0gbWFyZ2luc1swXSxcbiAgICByaWdodDogcmVjdC5yaWdodCArIG1hcmdpbnNbMV0sXG4gICAgYm90dG9tOiByZWN0LmJvdHRvbSArIG1hcmdpbnNbMl0sXG4gICAgbGVmdDogcmVjdC5sZWZ0IC0gbWFyZ2luc1szXVxuICB9O1xuICBuZXdSZWN0LndpZHRoID0gbmV3UmVjdC5yaWdodCAtIG5ld1JlY3QubGVmdDtcbiAgbmV3UmVjdC5oZWlnaHQgPSBuZXdSZWN0LmJvdHRvbSAtIG5ld1JlY3QudG9wO1xuXG4gIHJldHVybiBuZXdSZWN0O1xufTtcblxuXG4vKipcbiAqIEFjY2VwdHMgYW4gb2xkIGFuZCBuZXcgZW50cnkgYW5kIHJldHVybnMgdHJ1ZSBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlXG4gKiB0aHJlc2hvbGQgdmFsdWVzIGhhcyBiZWVuIGNyb3NzZWQuXG4gKiBAcGFyYW0gez9JbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBvbGRFbnRyeSBUaGUgcHJldmlvdXMgZW50cnkgZm9yIGFcbiAqICAgIHBhcnRpY3VsYXIgdGFyZ2V0IGVsZW1lbnQgb3IgbnVsbCBpZiBubyBwcmV2aW91cyBlbnRyeSBleGlzdHMuXG4gKiBAcGFyYW0ge0ludGVyc2VjdGlvbk9ic2VydmVyRW50cnl9IG5ld0VudHJ5IFRoZSBjdXJyZW50IGVudHJ5IGZvciBhXG4gKiAgICBwYXJ0aWN1bGFyIHRhcmdldCBlbGVtZW50LlxuICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGEgYW55IHRocmVzaG9sZCBoYXMgYmVlbiBjcm9zc2VkLlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9oYXNDcm9zc2VkVGhyZXNob2xkID1cbiAgICBmdW5jdGlvbihvbGRFbnRyeSwgbmV3RW50cnkpIHtcblxuICAvLyBUbyBtYWtlIGNvbXBhcmluZyBlYXNpZXIsIGFuIGVudHJ5IHRoYXQgaGFzIGEgcmF0aW8gb2YgMFxuICAvLyBidXQgZG9lcyBub3QgYWN0dWFsbHkgaW50ZXJzZWN0IGlzIGdpdmVuIGEgdmFsdWUgb2YgLTFcbiAgdmFyIG9sZFJhdGlvID0gb2xkRW50cnkgJiYgb2xkRW50cnkuaXNJbnRlcnNlY3RpbmcgP1xuICAgICAgb2xkRW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gfHwgMCA6IC0xO1xuICB2YXIgbmV3UmF0aW8gPSBuZXdFbnRyeS5pc0ludGVyc2VjdGluZyA/XG4gICAgICBuZXdFbnRyeS5pbnRlcnNlY3Rpb25SYXRpbyB8fCAwIDogLTE7XG5cbiAgLy8gSWdub3JlIHVuY2hhbmdlZCByYXRpb3NcbiAgaWYgKG9sZFJhdGlvID09PSBuZXdSYXRpbykgcmV0dXJuO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50aHJlc2hvbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRocmVzaG9sZCA9IHRoaXMudGhyZXNob2xkc1tpXTtcblxuICAgIC8vIFJldHVybiB0cnVlIGlmIGFuIGVudHJ5IG1hdGNoZXMgYSB0aHJlc2hvbGQgb3IgaWYgdGhlIG5ldyByYXRpb1xuICAgIC8vIGFuZCB0aGUgb2xkIHJhdGlvIGFyZSBvbiB0aGUgb3Bwb3NpdGUgc2lkZXMgb2YgYSB0aHJlc2hvbGQuXG4gICAgaWYgKHRocmVzaG9sZCA9PSBvbGRSYXRpbyB8fCB0aHJlc2hvbGQgPT0gbmV3UmF0aW8gfHxcbiAgICAgICAgdGhyZXNob2xkIDwgb2xkUmF0aW8gIT09IHRocmVzaG9sZCA8IG5ld1JhdGlvKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSByb290IGVsZW1lbnQgaXMgYW4gZWxlbWVudCBhbmQgaXMgaW4gdGhlIERPTS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHJvb3QgZWxlbWVudCBpcyBhbiBlbGVtZW50IGFuZCBpcyBpbiB0aGUgRE9NLlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9yb290SXNJbkRvbSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMucm9vdCB8fCBjb250YWluc0RlZXAoZG9jdW1lbnQsIHRoaXMucm9vdCk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiByb290LlxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGhlIHRhcmdldCBlbGVtZW50IHRvIGNoZWNrLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiByb290LlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9yb290Q29udGFpbnNUYXJnZXQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgcmV0dXJuIGNvbnRhaW5zRGVlcCh0aGlzLnJvb3QgfHwgZG9jdW1lbnQsIHRhcmdldCk7XG59O1xuXG5cbi8qKlxuICogQWRkcyB0aGUgaW5zdGFuY2UgdG8gdGhlIGdsb2JhbCBJbnRlcnNlY3Rpb25PYnNlcnZlciByZWdpc3RyeSBpZiBpdCBpc24ndFxuICogYWxyZWFkeSBwcmVzZW50LlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9yZWdpc3Rlckluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gIGlmIChyZWdpc3RyeS5pbmRleE9mKHRoaXMpIDwgMCkge1xuICAgIHJlZ2lzdHJ5LnB1c2godGhpcyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBpbnN0YW5jZSBmcm9tIHRoZSBnbG9iYWwgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgcmVnaXN0cnkuXG4gKiBAcHJpdmF0ZVxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuX3VucmVnaXN0ZXJJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5kZXggPSByZWdpc3RyeS5pbmRleE9mKHRoaXMpO1xuICBpZiAoaW5kZXggIT0gLTEpIHJlZ2lzdHJ5LnNwbGljZShpbmRleCwgMSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSBwZXJmb3JtYW5jZS5ub3coKSBtZXRob2Qgb3IgbnVsbCBpbiBicm93c2Vyc1xuICogdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBBUEkuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBlbGFwc2VkIHRpbWUgc2luY2UgdGhlIHBhZ2Ugd2FzIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlICYmIHBlcmZvcm1hbmNlLm5vdyAmJiBwZXJmb3JtYW5jZS5ub3coKTtcbn1cblxuXG4vKipcbiAqIFRocm90dGxlcyBhIGZ1bmN0aW9uIGFuZCBkZWxheXMgaXRzIGV4ZWN1dGlvbiwgc28gaXQncyBvbmx5IGNhbGxlZCBhdCBtb3N0XG4gKiBvbmNlIHdpdGhpbiBhIGdpdmVuIHRpbWUgcGVyaW9kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVvdXQgVGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbXVzdCBwYXNzIGJlZm9yZSB0aGVcbiAqICAgICBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGFnYWluLlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZuLCB0aW1lb3V0KSB7XG4gIHZhciB0aW1lciA9IG51bGw7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aW1lcikge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBmbigpO1xuICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH07XG59XG5cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gYSBET00gbm9kZSBlbnN1cmluZyBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIERPTSBub2RlIHRvIGFkZCB0aGUgZXZlbnQgaGFuZGxlciB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBldmVudCBoYW5kbGVyIHRvIGFkZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0X3VzZUNhcHR1cmUgT3B0aW9uYWxseSBhZGRzIHRoZSBldmVuIHRvIHRoZSBjYXB0dXJlXG4gKiAgICAgcGhhc2UuIE5vdGU6IHRoaXMgb25seSB3b3JrcyBpbiBtb2Rlcm4gYnJvd3NlcnMuXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50KG5vZGUsIGV2ZW50LCBmbiwgb3B0X3VzZUNhcHR1cmUpIHtcbiAgaWYgKHR5cGVvZiBub2RlLmFkZEV2ZW50TGlzdGVuZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIG9wdF91c2VDYXB0dXJlIHx8IGZhbHNlKTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2Ygbm9kZS5hdHRhY2hFdmVudCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgZXZlbnQgaGFuZGxlciBmcm9tIGEgRE9NIG5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIERPTSBub2RlIHRvIHJlbW92ZSB0aGUgZXZlbnQgaGFuZGxlciBmcm9tLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGV2ZW50IGhhbmRsZXIgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtib29sZWFufSBvcHRfdXNlQ2FwdHVyZSBJZiB0aGUgZXZlbnQgaGFuZGxlciB3YXMgYWRkZWQgd2l0aCB0aGlzXG4gKiAgICAgZmxhZyBzZXQgdG8gdHJ1ZSwgaXQgc2hvdWxkIGJlIHNldCB0byB0cnVlIGhlcmUgaW4gb3JkZXIgdG8gcmVtb3ZlIGl0LlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudChub2RlLCBldmVudCwgZm4sIG9wdF91c2VDYXB0dXJlKSB7XG4gIGlmICh0eXBlb2Ygbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyID09ICdmdW5jdGlvbicpIHtcbiAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBvcHRfdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIG5vZGUuZGV0YXRjaEV2ZW50ID09ICdmdW5jdGlvbicpIHtcbiAgICBub2RlLmRldGF0Y2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdHdvIHJlY3Qgb2JqZWN0cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSByZWN0MSBUaGUgZmlyc3QgcmVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSByZWN0MiBUaGUgc2Vjb25kIHJlY3QuXG4gKiBAcmV0dXJuIHs/T2JqZWN0fSBUaGUgaW50ZXJzZWN0aW9uIHJlY3Qgb3IgdW5kZWZpbmVkIGlmIG5vIGludGVyc2VjdGlvblxuICogICAgIGlzIGZvdW5kLlxuICovXG5mdW5jdGlvbiBjb21wdXRlUmVjdEludGVyc2VjdGlvbihyZWN0MSwgcmVjdDIpIHtcbiAgdmFyIHRvcCA9IE1hdGgubWF4KHJlY3QxLnRvcCwgcmVjdDIudG9wKTtcbiAgdmFyIGJvdHRvbSA9IE1hdGgubWluKHJlY3QxLmJvdHRvbSwgcmVjdDIuYm90dG9tKTtcbiAgdmFyIGxlZnQgPSBNYXRoLm1heChyZWN0MS5sZWZ0LCByZWN0Mi5sZWZ0KTtcbiAgdmFyIHJpZ2h0ID0gTWF0aC5taW4ocmVjdDEucmlnaHQsIHJlY3QyLnJpZ2h0KTtcbiAgdmFyIHdpZHRoID0gcmlnaHQgLSBsZWZ0O1xuICB2YXIgaGVpZ2h0ID0gYm90dG9tIC0gdG9wO1xuXG4gIHJldHVybiAod2lkdGggPj0gMCAmJiBoZWlnaHQgPj0gMCkgJiYge1xuICAgIHRvcDogdG9wLFxuICAgIGJvdHRvbTogYm90dG9tLFxuICAgIGxlZnQ6IGxlZnQsXG4gICAgcmlnaHQ6IHJpZ2h0LFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9O1xufVxuXG5cbi8qKlxuICogU2hpbXMgdGhlIG5hdGl2ZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBJRS5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZWwgVGhlIGVsZW1lbnQgd2hvc2UgYm91bmRpbmcgcmVjdCB0byBnZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSAocG9zc2libHkgc2hpbW1lZCkgcmVjdCBvZiB0aGUgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsKSB7XG4gIHZhciByZWN0O1xuXG4gIHRyeSB7XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBJZ25vcmUgV2luZG93cyA3IElFMTEgXCJVbnNwZWNpZmllZCBlcnJvclwiXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3czYy9JbnRlcnNlY3Rpb25PYnNlcnZlci9wdWxsLzIwNVxuICB9XG5cbiAgaWYgKCFyZWN0KSByZXR1cm4gZ2V0RW1wdHlSZWN0KCk7XG5cbiAgLy8gT2xkZXIgSUVcbiAgaWYgKCEocmVjdC53aWR0aCAmJiByZWN0LmhlaWdodCkpIHtcbiAgICByZWN0ID0ge1xuICAgICAgdG9wOiByZWN0LnRvcCxcbiAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0LFxuICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCxcbiAgICAgIHdpZHRoOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuICAgICAgaGVpZ2h0OiByZWN0LmJvdHRvbSAtIHJlY3QudG9wXG4gICAgfTtcbiAgfVxuICByZXR1cm4gcmVjdDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYW4gZW1wdHkgcmVjdCBvYmplY3QuIEFuIGVtcHR5IHJlY3QgaXMgcmV0dXJuZWQgd2hlbiBhbiBlbGVtZW50XG4gKiBpcyBub3QgaW4gdGhlIERPTS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGVtcHR5IHJlY3QuXG4gKi9cbmZ1bmN0aW9uIGdldEVtcHR5UmVjdCgpIHtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwXG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHBhcmVudCBlbGVtZW50IGNvbnRhaW5zIGEgY2hpbGQgZWxlbWVudCAoaW5jbHVkaW5nIGluc2lkZVxuICogc2hhZG93IERPTSkuXG4gKiBAcGFyYW0ge05vZGV9IHBhcmVudCBUaGUgcGFyZW50IGVsZW1lbnQuXG4gKiBAcGFyYW0ge05vZGV9IGNoaWxkIFRoZSBjaGlsZCBlbGVtZW50LlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGFyZW50IG5vZGUgY29udGFpbnMgdGhlIGNoaWxkIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zRGVlcChwYXJlbnQsIGNoaWxkKSB7XG4gIHZhciBub2RlID0gY2hpbGQ7XG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUgPT0gcGFyZW50KSByZXR1cm4gdHJ1ZTtcblxuICAgIG5vZGUgPSBnZXRQYXJlbnROb2RlKG5vZGUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKipcbiAqIEdldHMgdGhlIHBhcmVudCBub2RlIG9mIGFuIGVsZW1lbnQgb3IgaXRzIGhvc3QgZWxlbWVudCBpZiB0aGUgcGFyZW50IG5vZGVcbiAqIGlzIGEgc2hhZG93IHJvb3QuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIG5vZGUgd2hvc2UgcGFyZW50IHRvIGdldC5cbiAqIEByZXR1cm4ge05vZGV8bnVsbH0gVGhlIHBhcmVudCBub2RlIG9yIG51bGwgaWYgbm8gcGFyZW50IGV4aXN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFyZW50Tm9kZShub2RlKSB7XG4gIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgaWYgKHBhcmVudCAmJiBwYXJlbnQubm9kZVR5cGUgPT0gMTEgJiYgcGFyZW50Lmhvc3QpIHtcbiAgICAvLyBJZiB0aGUgcGFyZW50IGlzIGEgc2hhZG93IHJvb3QsIHJldHVybiB0aGUgaG9zdCBlbGVtZW50LlxuICAgIHJldHVybiBwYXJlbnQuaG9zdDtcbiAgfVxuICByZXR1cm4gcGFyZW50O1xufVxuXG5cbi8vIEV4cG9zZXMgdGhlIGNvbnN0cnVjdG9ycyBnbG9iYWxseS5cbndpbmRvdy5JbnRlcnNlY3Rpb25PYnNlcnZlciA9IEludGVyc2VjdGlvbk9ic2VydmVyO1xud2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkgPSBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5O1xuXG59KHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qIVxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcgSWNvTW9vbi5pb1xuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0tleWFtb29uL3N2Z3h1c2VcbiAqIEB2ZXJzaW9uICAgMS4yLjZcbiAqL1xuLypqc2xpbnQgYnJvd3NlcjogdHJ1ZSAqL1xuLypnbG9iYWwgWERvbWFpblJlcXVlc3QsIE11dGF0aW9uT2JzZXJ2ZXIsIHdpbmRvdyAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBob2xkcyB4aHIgb2JqZWN0cyB0byBwcmV2ZW50IG11bHRpcGxlIHJlcXVlc3RzXG4gICAgICAgIHZhciBjaGVja1VzZUVsZW1zO1xuICAgICAgICB2YXIgdGlkOyAvLyB0aW1lb3V0IGlkXG4gICAgICAgIHZhciBkZWJvdW5jZWRDaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWQpO1xuICAgICAgICAgICAgdGlkID0gc2V0VGltZW91dChjaGVja1VzZUVsZW1zLCAxMDApO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdW5vYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2VkQ2hlY2spO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01TdWJ0cmVlTW9kaWZpZWRcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTVN1YnRyZWVNb2RpZmllZFwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNyZWF0ZVJlcXVlc3QgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAvLyBJbiBJRSA5LCBjcm9zcyBvcmlnaW4gcmVxdWVzdHMgY2FuIG9ubHkgYmUgc2VudCB1c2luZyBYRG9tYWluUmVxdWVzdC5cbiAgICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IHdvdWxkIGZhaWwgaWYgQ09SUyBoZWFkZXJzIGFyZSBub3Qgc2V0LlxuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCBYRG9tYWluUmVxdWVzdCBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggY3Jvc3Mgb3JpZ2luIHJlcXVlc3RzLlxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0T3JpZ2luKGxvYykge1xuICAgICAgICAgICAgICAgIHZhciBhO1xuICAgICAgICAgICAgICAgIGlmIChsb2MucHJvdG9jb2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gbG9jO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgYS5ocmVmID0gbG9jO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wcm90b2NvbC5yZXBsYWNlKC86L2csIFwiXCIpICsgYS5ob3N0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIFJlcXVlc3Q7XG4gICAgICAgICAgICB2YXIgb3JpZ2luO1xuICAgICAgICAgICAgdmFyIG9yaWdpbjI7XG4gICAgICAgICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIG9yaWdpbiA9IGdldE9yaWdpbihsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgb3JpZ2luMiA9IGdldE9yaWdpbih1cmwpO1xuICAgICAgICAgICAgICAgIGlmIChSZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9PT0gdW5kZWZpbmVkICYmIG9yaWdpbjIgIT09IFwiXCIgJiYgb3JpZ2luMiAhPT0gb3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBYRG9tYWluUmVxdWVzdCB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IFhNTEh0dHBSZXF1ZXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZXF1ZXN0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgeGxpbmtOUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiO1xuICAgICAgICBjaGVja1VzZUVsZW1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2U7XG4gICAgICAgICAgICB2YXIgYmNyO1xuICAgICAgICAgICAgdmFyIGZhbGxiYWNrID0gXCJcIjsgLy8gb3B0aW9uYWwgZmFsbGJhY2sgVVJMIGluIGNhc2Ugbm8gYmFzZSBwYXRoIHRvIFNWRyBmaWxlIHdhcyBnaXZlbiBhbmQgbm8gc3ltYm9sIGRlZmluaXRpb24gd2FzIGZvdW5kLlxuICAgICAgICAgICAgdmFyIGhhc2g7XG4gICAgICAgICAgICB2YXIgaHJlZjtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGluUHJvZ3Jlc3NDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgaXNIaWRkZW47XG4gICAgICAgICAgICB2YXIgUmVxdWVzdDtcbiAgICAgICAgICAgIHZhciB1cmw7XG4gICAgICAgICAgICB2YXIgdXNlcztcbiAgICAgICAgICAgIHZhciB4aHI7XG4gICAgICAgICAgICBmdW5jdGlvbiBvYnNlcnZlSWZEb25lKCkge1xuICAgICAgICAgICAgICAgIC8vIElmIGRvbmUgd2l0aCBtYWtpbmcgY2hhbmdlcywgc3RhcnQgd2F0Y2hpbmcgZm9yIGNoYWduZXMgaW4gRE9NIGFnYWluXG4gICAgICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50IC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGluUHJvZ3Jlc3NDb3VudCA9PT0gMCkgeyAvLyBpZiBhbGwgeGhycyB3ZXJlIHJlc29sdmVkXG4gICAgICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMoKTsgLy8gbWFrZSBzdXJlIHRvIHJlbW92ZSBvbGQgaGFuZGxlcnNcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUNoYW5nZXMoKTsgLy8gd2F0Y2ggZm9yIGNoYW5nZXMgdG8gRE9NXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gYXR0clVwZGF0ZUZ1bmMoc3BlYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVtzcGVjLmJhc2VdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjLnVzZUVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwieGxpbms6aHJlZlwiLCBcIiNcIiArIHNwZWMuaGFzaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy51c2VFbC5oYXNBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy51c2VFbC5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiI1wiICsgc3BlYy5oYXNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbmxvYWRGdW5jKHhocikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwieFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ZztcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHguaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgc3ZnID0geC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN2Z1wiKVswXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN2Zykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS53aWR0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUuaGVpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5Lmluc2VydEJlZm9yZShzdmcsIGJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yVGltZW91dCh4aHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbnRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMoKTsgLy8gc3RvcCB3YXRjaGluZyBmb3IgY2hhbmdlcyB0byBET01cbiAgICAgICAgICAgIC8vIGZpbmQgYWxsIHVzZSBlbGVtZW50c1xuICAgICAgICAgICAgdXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidXNlXCIpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHVzZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBiY3IgPSB1c2VzW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmYWlsZWQgdG8gZ2V0IGJvdW5kaW5nIHJlY3RhbmdsZSBvZiB0aGUgdXNlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgYmNyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhyZWYgPSB1c2VzW2ldLmdldEF0dHJpYnV0ZShcImhyZWZcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHVzZXNbaV0uZ2V0QXR0cmlidXRlTlMoeGxpbmtOUywgXCJocmVmXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCB1c2VzW2ldLmdldEF0dHJpYnV0ZShcInhsaW5rOmhyZWZcIik7XG4gICAgICAgICAgICAgICAgaWYgKGhyZWYgJiYgaHJlZi5zcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSBocmVmLnNwbGl0KFwiI1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSBbXCJcIiwgXCJcIl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UgPSB1cmxbMF07XG4gICAgICAgICAgICAgICAgaGFzaCA9IHVybFsxXTtcbiAgICAgICAgICAgICAgICBpc0hpZGRlbiA9IGJjciAmJiBiY3IubGVmdCA9PT0gMCAmJiBiY3IucmlnaHQgPT09IDAgJiYgYmNyLnRvcCA9PT0gMCAmJiBiY3IuYm90dG9tID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChiY3IgJiYgYmNyLndpZHRoID09PSAwICYmIGJjci5oZWlnaHQgPT09IDAgJiYgIWlzSGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSB1c2UgZWxlbWVudCBpcyBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIHJlZmVyZW5jZSB0byBhbiBleHRlcm5hbCBTVkcsIHRyeSB0byBmZXRjaCBpdFxuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIG9wdGlvbmFsIGZhbGxiYWNrIFVSTCBpZiB0aGVyZSBpcyBubyByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgU1ZHXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWxsYmFjayAmJiAhYmFzZS5sZW5ndGggJiYgaGFzaCAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBmYWxsYmFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlc1tpXS5oYXNBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VzW2ldLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwieGxpbms6aHJlZlwiLCBocmVmKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjaGVkdWxlIHVwZGF0aW5nIHhsaW5rOmhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IGNhY2hlW2Jhc2VdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhociAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRydWUgc2lnbmlmaWVzIHRoYXQgcHJlcGVuZGluZyB0aGUgU1ZHIHdhcyBub3QgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGF0dHJVcGRhdGVGdW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRWw6IHVzZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdChiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVxdWVzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IG5ldyBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0geGhyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub25sb2FkID0gb25sb2FkRnVuYyh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IG9uRXJyb3JUaW1lb3V0KHhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vbnRpbWVvdXQgPSBvbkVycm9yVGltZW91dCh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0hpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlW2Jhc2VdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1lbWJlciB0aGlzIFVSTCBpZiB0aGUgdXNlIGVsZW1lbnQgd2FzIG5vdCBlbXB0eSBhbmQgbm8gcmVxdWVzdCB3YXMgc2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FjaGVbYmFzZV0ub25sb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgdHVybnMgb3V0IHRoYXQgcHJlcGVuZGluZyB0aGUgU1ZHIGlzIG5vdCBuZWNlc3NhcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWJvcnQgdGhlIGluLXByb2dyZXNzIHhoci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXS5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjYWNoZVtiYXNlXS5vbmxvYWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UubGVuZ3RoICYmIGNhY2hlW2Jhc2VdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGF0dHJVcGRhdGVGdW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VFbDogdXNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXMgPSBcIlwiO1xuICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50ICs9IDE7XG4gICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB3aW5Mb2FkO1xuICAgICAgICB3aW5Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHdpbkxvYWQsIGZhbHNlKTsgLy8gdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgIC8vIFRoZSBsb2FkIGV2ZW50IGZpcmVzIHdoZW4gYWxsIHJlc291cmNlcyBoYXZlIGZpbmlzaGVkIGxvYWRpbmcsIHdoaWNoIGFsbG93cyBkZXRlY3Rpbmcgd2hldGhlciBTVkcgdXNlIGVsZW1lbnRzIGFyZSBlbXB0eS5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCB3aW5Mb2FkLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyIGlmIHRoZSBkb2N1bWVudCBpcyBhbHJlYWR5IGxvYWRlZCwgaW5pdGlhbGl6ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgICAgIHdpbkxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0oKSk7XG4iLCJpbXBvcnQgeyBldmVudHMgfSBmcm9tICcuLi91dGlsaXRpZXMvY3VzdG9tLWV2ZW50cyc7XG5cbmNvbnN0IEFOSU1BVElPTl9EVVJBVElPTiA9IDEwMDA7IC8vIG1pbGlzZWNvbmRzXG5jb25zdCBSRUZSRVNIX1JBVEUgPSBBTklNQVRJT05fRFVSQVRJT04gLyA2MDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgaWQsXG4gICAgbG9hZGluZ0NsYXNzLFxuICB9KSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cbiAgICBsZXQgYW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAvLyBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIGhhbmRsZVN0YXJ0TG9hZGVyKCkge1xuICAgICAgYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGFuaW1hdGluZyA9IGZhbHNlOyB9LCBBTklNQVRJT05fRFVSQVRJT04pO1xuXG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKGxvYWRpbmdDbGFzcyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZVN0b3BMb2FkZXIoKSB7XG4gICAgICBpZiAoYW5pbWF0aW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoaGFuZGxlU3RvcExvYWRlciwgUkVGUkVTSF9SQVRFKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUobG9hZGluZ0NsYXNzKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLnN0YXJ0TG9hZGVyLCBoYW5kbGVTdGFydExvYWRlcik7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLnN0b3BMb2FkZXIsIGhhbmRsZVN0b3BMb2FkZXIpO1xuICB9XG59XG5cbiIsImltcG9ydCB7IGV2ZW50cyB9IGZyb20gJy4uL3V0aWxpdGllcy9jdXN0b20tZXZlbnRzJztcbmltcG9ydCB7IHNjcm9sbFRvcCB9IGZyb20gJy4uL3V0aWxpdGllcy9zY3JvbGwnO1xuXG5jb25zdCBBTklNQVRJT05fRFVSQVRJT04gPSA1MDA7IC8vIG1pbGlzZWNvbmRzXG5jb25zdCBSRUZSRVNIX1JBVEUgPSBBTklNQVRJT05fRFVSQVRJT04gLyA2MDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgaWQsXG4gICAgbG9ja2VkQ2xhc3MsXG4gICAgYWN0aXZlQ2xhc3MsXG4gICAgdW5sb2FkaW5nQ2xhc3MsXG4gIH0pIHtcbiAgICAvLyBFbGVtZW50cyBhbmQgY2xhc3MgdmFyaWFibGVzXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cbiAgICAvLyBTdGF0ZSB2YXJpYWJsZXNcbiAgICBsZXQgYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgbGV0IHNjcm9sbGluZyA9IGZhbHNlO1xuXG4gICAgLy8gRXZlbnQgaGFuZGxlciBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2NrU2Nyb2xsKGUpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChsb2NrZWRDbGFzcyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZVVubG9ja1Njcm9sbCgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShsb2NrZWRDbGFzcyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZVVubG9hZFJvdXRlKCkge1xuICAgICAgZnVuY3Rpb24gc2Nyb2xsKCkge1xuICAgICAgICBzY3JvbGxpbmcgPSB0cnVlO1xuXG4gICAgICAgIHNjcm9sbFRvcChkb2N1bWVudC5ib2R5LCAwLCAoKSA9PiB7XG4gICAgICAgICAgc2Nyb2xsaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhbmltYXRlKCkge1xuICAgICAgICBhbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgc2Nyb2xsKCk7XG4gICAgICAgIH0sIEFOSU1BVElPTl9EVVJBVElPTik7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuaW1hdGUgcGFnZSB1bmxvYWRcbiAgICAgIGVsLmNsYXNzTGlzdC5hZGQodW5sb2FkaW5nQ2xhc3MpO1xuICAgICAgYW5pbWF0ZSgpO1xuICAgIH1cblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnNcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudHMubG9ja1Njcm9sbCwgaGFuZGxlTG9ja1Njcm9sbCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLnVubG9ja1Njcm9sbCwgaGFuZGxlVW5sb2NrU2Nyb2xsKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudHMudW5sb2FkUm91dGUsIGhhbmRsZVVubG9hZFJvdXRlKTtcblxuICAgIC8vIEluaXRpYWxpemVcbiAgICBlbC5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBldmVudHMsIGVtaXRFdmVudCB9IGZyb20gJy4uL3V0aWxpdGllcy9jdXN0b20tZXZlbnRzJztcbmltcG9ydCB7IGluamVjdE1hcmt1cCB9IGZyb20gJy4uL3V0aWxpdGllcy9jb21wb25lbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgaWQsXG4gICAgb3ZlcmxheUhhbmRsZSxcbiAgICBjbG9zZUhhbmRsZSxcbiAgICBjb250ZW50SGFuZGxlLFxuICAgIGFjdGl2ZUNsYXNzLFxuICB9KSB7XG4gICAgLy8gRWxlbWVudHMgYW5kIGNsYXNzIHZhcmlhYmxlc1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGNvbnN0IG92ZXJsYXkgPSBlbC5xdWVyeVNlbGVjdG9yKG92ZXJsYXlIYW5kbGUpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBlbC5xdWVyeVNlbGVjdG9yKGNvbnRlbnRIYW5kbGUpO1xuICAgIGNvbnN0IGNsb3NlID0gZWwucXVlcnlTZWxlY3RvcihjbG9zZUhhbmRsZSk7XG5cbiAgICAvLyBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIGhhbmRsZUtleXVwKGUpIHtcbiAgICAgIC8vIE9ubHkgY2FyIGFib3V0IGVzY2FwZSBrZXlcbiAgICAgIGlmIChlLmtleUNvZGUgIT09IDI3KSByZXR1cm47XG5cbiAgICAgIGVtaXRFdmVudChldmVudHMuY2xvc2VNb2RhbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZU9wZW5Nb2RhbCgpIHtcbiAgICAgIGVtaXRFdmVudChldmVudHMubG9ja1Njcm9sbCk7XG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcblxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVLZXl1cCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsb3NlTW9kYWwoKSB7XG4gICAgICBlbWl0RXZlbnQoZXZlbnRzLnVubG9ja1Njcm9sbCk7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGFjdGl2ZUNsYXNzKTtcblxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVLZXl1cCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvYWRNb2RhbChlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIG1hcmt1cCxcbiAgICAgICAgZnVsbCA9ICdmYWxzZScsXG4gICAgICAgIHBvc2l0aW9uID0gJ2NlbnRlcicsXG4gICAgICAgIHNpemUgPSAnbGcnLFxuICAgICAgfSA9IGUuZGV0YWlsO1xuXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtZnVsbCcsIGZ1bGwpO1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXBvc2l0aW9uJywgcG9zaXRpb24pO1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXNpemUnLCBzaXplKTtcbiAgICAgIGluamVjdE1hcmt1cChjb250ZW50LCBtYXJrdXApO1xuICAgICAgaGFuZGxlT3Blbk1vZGFsKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgZW1pdEV2ZW50KGV2ZW50cy5jbG9zZU1vZGFsKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLm9wZW5Nb2RhbCwgaGFuZGxlT3Blbk1vZGFsKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudHMuY2xvc2VNb2RhbCwgaGFuZGxlQ2xvc2VNb2RhbCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLmxvYWRNb2RhbCwgaGFuZGxlTG9hZE1vZGFsKTtcbiAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrKTtcbiAgICBvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2xpY2spO1xuICB9XG59XG5cbiIsImV4cG9ydCBjb25zdCBzaXRlSGFuZGxlID0gJ3dpbGxpYW1zY29uY3JldGVjb250cmFjdGluZyc7XG4iLCJpbXBvcnQgJy4vcG9seWZpbGxzJztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IExvYWRlciBmcm9tICcuL2NvbXBvbmVudHMvbG9hZGVyJztcbmltcG9ydCBNYWluIGZyb20gJy4vY29tcG9uZW50cy9tYWluJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL2NvbXBvbmVudHMvbW9kYWwnO1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGluc3RhbnRpYXRlIH0gZnJvbSAnLi91dGlsaXRpZXMvY29tcG9uZW50cyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIHF1b3RlLXByb3BzICovXG5jb25zdCBjbGFzc01hcCA9IHtcbiAgJ2xvYWRlcic6IExvYWRlcixcbiAgJ21haW4nOiBNYWluLFxuICAnbW9kYWwnOiBNb2RhbCxcbn07XG4vKiBlc2xpbnQtZW5hYmxlIHF1b3RlLXByb3BzICovXG5cbi8vIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBoYW5kbGVET01Db25lbnRMb2FkZWQoKSB7XG4gIC8vIENhbGwgY29tcG9uZW50IGNvbnN0cnVjdG9yc1xuICBpbnN0YW50aWF0ZShjbGFzc01hcCk7XG59XG5cbi8vIEFkZCBldmVudCBsaXN0ZW5lcnNcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBoYW5kbGVET01Db25lbnRMb2FkZWQpO1xuXG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkucHJvdG90eXBlLmZpbmQgY2FsbGVkIG9uIG51bGwgb3IgdW5kZWZpbmVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH0pO1xufVxuIiwiaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kSW5kZXgnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5wcm90b3R5cGUuZmluZEluZGV4IGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgdmFyIGxpc3QgPSBPYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogZmFsc2VcbiAgfSk7XG59XG5cbiIsIi8vIGZyb206aHR0cHM6Ly9naXRodWIuY29tL2pzZXJ6L2pzX3BpZWNlL2Jsb2IvbWFzdGVyL0RPTS9DaGlsZE5vZGUvcmVtb3ZlKCkvcmVtb3ZlKCkubWRcbihmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncmVtb3ZlJywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKFtFbGVtZW50LnByb3RvdHlwZSwgQ2hhcmFjdGVyRGF0YS5wcm90b3R5cGUsIERvY3VtZW50VHlwZS5wcm90b3R5cGVdKTtcblxuIiwiaWYgKCFBcnJheS5mcm9tKSB7XG4gIEFycmF5LmZyb20gPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgfHwgdG9TdHIuY2FsbChmbikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcbiAgICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChpc05hTihudW1iZXIpKSB7IHJldHVybiAwOyB9XG4gICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH07XG4gICAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgICByZXR1cm4gZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcbiAgICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgICAgdmFyIEMgPSB0aGlzO1xuXG4gICAgICAvLyAyLiBMZXQgaXRlbXMgYmUgVG9PYmplY3QoYXJyYXlMaWtlKS5cbiAgICAgIHZhciBpdGVtcyA9IE9iamVjdChhcnJheUxpa2UpO1xuXG4gICAgICAvLyAzLiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoYXJyYXlMaWtlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvYmplY3QgLSBub3QgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIDQuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgbWFwcGluZyBiZSBmYWxzZS5cbiAgICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCB1bmRlZmluZWQ7XG4gICAgICB2YXIgVDtcbiAgICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIDUuIGVsc2VcbiAgICAgICAgLy8gNS4gYSBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIGIuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlblZhbHVlIGJlIEdldChpdGVtcywgXCJsZW5ndGhcIikuXG4gICAgICAvLyAxMS4gTGV0IGxlbiBiZSBUb0xlbmd0aChsZW5WYWx1ZSkuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcblxuICAgICAgLy8gMTMuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gMTMuIGEuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2Qgb2YgQyB3aXRoIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gbGVuLlxuICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTYuIExldCBrIGJlIDAuXG4gICAgICB2YXIgayA9IDA7XG4gICAgICAvLyAxNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gdHlwZW9mIFQgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oa1ZhbHVlLCBrKSA6IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIC8vIDE4LiBMZXQgcHV0U3RhdHVzIGJlIFB1dChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAyMC4gUmV0dXJuIEEuXG4gICAgICByZXR1cm4gQTtcbiAgICB9O1xuICB9KCkpO1xufVxuXG4iLCIvLyBPdmVyd3JpdGVzIG5hdGl2ZSAnY2hpbGRyZW4nIHByb3RvdHlwZS5cbi8vIEFkZHMgRG9jdW1lbnQgJiBEb2N1bWVudEZyYWdtZW50IHN1cHBvcnQgZm9yIElFOSAmIFNhZmFyaS5cbi8vIFJldHVybnMgYXJyYXkgaW5zdGVhZCBvZiBIVE1MQ29sbGVjdGlvbi5cbjsoZnVuY3Rpb24oY29uc3RydWN0b3IpIHtcbiAgaWYgKGNvbnN0cnVjdG9yICYmXG4gICAgY29uc3RydWN0b3IucHJvdG90eXBlICYmXG4gICAgY29uc3RydWN0b3IucHJvdG90eXBlLmNoaWxkcmVuID09IG51bGwpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCAnY2hpbGRyZW4nLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSA9IDAsIG5vZGUsIG5vZGVzID0gdGhpcy5jaGlsZE5vZGVzLCBjaGlsZHJlbiA9IFtdO1xuICAgICAgICB3aGlsZSAobm9kZSA9IG5vZGVzW2krK10pIHtcbiAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KSh3aW5kb3cuTm9kZSB8fCB3aW5kb3cuRWxlbWVudCk7XG4iLCJpbXBvcnQgJ2NsYXNzbGlzdC1wb2x5ZmlsbCc7XG5pbXBvcnQgJ2ludGVyc2VjdGlvbi1vYnNlcnZlcic7XG5pbXBvcnQgJ3N2Z3h1c2UnO1xuaW1wb3J0ICcuL2FycmF5LWZpbmQnO1xuaW1wb3J0ICcuL2FycmF5LWZpbmRpbmRleCc7XG5pbXBvcnQgJy4vYXJyYXktZm9yZWFjaCc7XG5pbXBvcnQgJy4vYXJyYXktZnJvbSc7XG5pbXBvcnQgJy4vZWxlbWVudC1jaGlsZHJlbic7XG5pbXBvcnQgJy4vb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgJy4vc3RyaW5nLWluY2x1ZGVzJztcbmltcG9ydCAnLi93aW5kb3ctY3VzdG9tZXZlbnQnO1xuaW1wb3J0ICcuL3dpbmRvdy1yZXF1ZXN0YW5pbWF0aW9uZnJhbWUnO1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT0gJ2Z1bmN0aW9uJykge1xuICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24odGFyZ2V0LCB2YXJBcmdzKSB7IC8vIC5sZW5ndGggb2YgZnVuY3Rpb24gaXMgMlxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodGFyZ2V0ID09IG51bGwpIHsgLy8gVHlwZUVycm9yIGlmIHVuZGVmaW5lZCBvciBudWxsXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG5cbiAgICAgIGlmIChuZXh0U291cmNlICE9IG51bGwpIHsgLy8gU2tpcCBvdmVyIGlmIHVuZGVmaW5lZCBvciBudWxsXG4gICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gbmV4dFNvdXJjZSkge1xuICAgICAgICAgIC8vIEF2b2lkIGJ1Z3Mgd2hlbiBoYXNPd25Qcm9wZXJ0eSBpcyBzaGFkb3dlZFxuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobmV4dFNvdXJjZSwgbmV4dEtleSkpIHtcbiAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvO1xuICB9O1xufVxuXG4iLCJpZiAoIVN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMpIHtcbiAgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uKHNlYXJjaCwgc3RhcnQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBzdGFydCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgXG4gICAgaWYgKHN0YXJ0ICsgc2VhcmNoLmxlbmd0aCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmluZGV4T2Yoc2VhcmNoLCBzdGFydCkgIT09IC0xO1xuICAgIH1cbiAgfTtcbn1cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICBpZiAoIHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09IFwiZnVuY3Rpb25cIiApIHJldHVybiBmYWxzZTtcblxuICBmdW5jdGlvbiBDdXN0b21FdmVudCAoIGV2ZW50LCBwYXJhbXMgKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHsgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlLCBkZXRhaWw6IHVuZGVmaW5lZCB9O1xuICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ0N1c3RvbUV2ZW50JyApO1xuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoIGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwgKTtcbiAgICByZXR1cm4gZXZ0O1xuICAgfVxuXG4gIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGU7XG5cbiAgd2luZG93LkN1c3RvbUV2ZW50ID0gQ3VzdG9tRXZlbnQ7XG59KSgpO1xuXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuLy8gTUlUIGxpY2Vuc2VcbihmdW5jdGlvbigpIHtcbiAgdmFyIGxhc3RUaW1lID0gMDtcbiAgdmFyIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddO1xuICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gIH1cblxuICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIHRpbWVUb0NhbGwpO1xuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfTtcblxuICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICB9O1xufSgpKTtcblxuIiwiLy8gQ29uZmlnXG5pbXBvcnQgeyBzaXRlSGFuZGxlIH0gZnJvbSAnLi4vY29uZmlnJztcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBzcHlTZWN0aW9ucywgc3RpY2sgfSBmcm9tICcuL3NweSc7XG5cbmxldCBfY2xhc3NNYXAgPSBudWxsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlXG5cbi8qKlxuICogSW5zdGFudGlhdGUgYW55IGNvbXBvbmVudHMgcHVzaGVkIG9udG8gZ2xvYmFsIGNvbXBvbmVudHMgYXJyYXlcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW50aWF0ZShtYXAgPSBudWxsKSB7XG4gIGlmIChtYXAgIT09IG51bGwpIHtcbiAgICBfY2xhc3NNYXAgPSBtYXA7XG4gIH1cblxuICBpZiAoX2NsYXNzTWFwID09PSBudWxsKSByZXR1cm47XG5cbiAgd2hpbGUgKHdpbmRvd1tzaXRlSGFuZGxlXS5jb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB7IGNvbXBvbmVudHMsIHN0YXRlIH0gPSB3aW5kb3dbc2l0ZUhhbmRsZV07XG4gICAgY29uc3QgY29uZmlnID0gY29tcG9uZW50cy5zaGlmdCgpO1xuICAgIGNvbnN0IENsYXNzID0gX2NsYXNzTWFwW2NvbmZpZy5oYW5kbGVdO1xuXG4gICAgaWYgKHR5cGVvZiBDbGFzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbmV3IENsYXNzKHsgLi4uY29uZmlnLCBzdGF0ZSB9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgICB9XG4gIH1cblxuICBzcHlTZWN0aW9ucygpO1xuICBzdGljaygpO1xufVxuXG4vKipcbiAqIEluamVjdCBuZXcgbWFya3VwIGludG8gRE9NIGFmdGVyIGFkZGluZyBjb25maWdzIHRvIGdsb2JhbFxuICogY29tcG9uZW50cyBhcnJheSB0aGVuIGluc3RhbnRpYXRlIG5ld2x5IGFkZGVkIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7bm9kZX0gY29udGFpbmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWFya3VwXG4gKiBAcGFyYW0ge2Jvb2x9IGFwcGVuZFxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdE1hcmt1cChjb250YWluZXIgPSBudWxsLCBtYXJrdXAgPSAnJywgYXBwZW5kID0gZmFsc2UpIHtcbiAgaWYgKCFjb250YWluZXIpIHJldHVybjtcblxuICAvLyBBZGQgbWFya3VwIHRvIGNvbnRhaW5lclxuICBpZiAoYXBwZW5kKSB7XG4gICAgY29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gbWFya3VwO1xuICB9XG5cbiAgLy8gUHVzaCBjb21wb25lbnRzIGNvbmZpZ3MgdG8gZ2xvYmFsIG9iamVjdFxuICBjb25zdCBzY3JpcHRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpO1xuXG4gIC8vIEV2YWx1YXRlIHNjcmlwdHMgcmV0dXJuZWQgZnJvbSBjb21wb25lbnQgbWFya3VwIGlmIGZvciBuZXcgY29tcG9uZW50XG4gIEFycmF5LmZyb20oc2NyaXB0cylcbiAgICAuZmlsdGVyKHNjcmlwdCA9PiBzY3JpcHQudGV4dENvbnRlbnQuaW5jbHVkZXMoYCR7c2l0ZUhhbmRsZX1gKSlcbiAgICAuZm9yRWFjaChzY3JpcHQgPT4geyBldmFsKHNjcmlwdC50ZXh0Q29udGVudCk7IH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV2YWxcblxuICAvLyBJbnN0YW50aWF0ZSBjb21wb25lbnRzXG4gIGluc3RhbnRpYXRlKCk7XG59XG5cbiIsImV4cG9ydCBjb25zdCBldmVudHMgPSB7XG4gIC8vIEFjdGlvbiBldmVudHNcbiAgbG9ja1Njcm9sbDogJ2xvY2stc2Nyb2xsJyxcbiAgdW5sb2NrU2Nyb2xsOiAndW5sb2NrLXNjcm9sbCcsXG4gIGxvYWRSb3V0ZTogJ2xvYWQtcm91dGUnLFxuICB1bmxvYWRSb3V0ZTogJ3VubG9hZC1yb3V0ZScsXG4gIHNob3dIZWFkZXI6ICdzaG93LWhlYWRlcicsXG4gIGhpZGVIZWFkZXI6ICdoaWRlLWhlYWRlcicsXG4gIG9wZW5Nb2RhbDogJ29wZW4tbW9kYWwnLFxuICBjbG9zZU1vZGFsOiAnY2xvc2UtbW9kYWwnLFxuICBsb2FkTW9kYWw6ICdsb2FkLW1vZGFsJyxcbiAgc3RhcnRMb2FkZXI6ICdzdGFydC1sb2FkZXInLFxuICBzdG9wTG9hZGVyOiAnc3RvcC1sb2FkZXInLFxuICBzaG93Rm9ybUVycm9yczogJ3Nob3ctZm9ybS1lcnJvcnMnLFxufTtcblxuLyoqXG4gKiBFbWl0IGV2ZW50IC0gd3JhcHBlciBhcm91bmQgQ3VzdG9tRXZlbnQgQVBJXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRIYW5kbGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudERldGFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVtaXRFdmVudChldmVudEhhbmRsZSwgZXZlbnREZXRhaWxzKSB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50SGFuZGxlLCB7IGRldGFpbDogZXZlbnREZXRhaWxzIH0pO1xuXG4gIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuIiwiLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4vLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGZ1bmMsIHdhaXQgPSAwLCBpbW1lZGlhdGUpIHtcbiAgbGV0IHRpbWVvdXQ7XG4gIHJldHVybiBmdW5jdGlvbiB0cm90dGxlKCkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgY29uc3QgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICBmdW5jdGlvbiBsYXRlcigpIHtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICB9O1xufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG4iLCIvKipcbiAqIExpYnJhcnkgZm9yIGhhbmRsaW5nIHNjcm9sbGluZyBmdW5jdGlvbmFsaXR5XG4gKi9cblxuY29uc3QgU0NST0xMX1JBVEUgPSAxIC8gMTA7XG5jb25zdCBGQVNUX1NDUk9MTF9SQVRFID0gMSAvIDI7XG5cbmxldCB0aW1lciA9IDA7XG5sZXQgdGltZXJGdW5jdGlvbiA9IG51bGw7XG5cbmZ1bmN0aW9uIHNjcm9sbCh0YXJnZXQsIGNiLCBmYXN0ID0gZmFsc2UpIHtcbiAgLy8gTG9ncml0aG1pYyBzY3JvbGwgcmF0ZSAoaGlnaGVyIHNjcm9sbHMgZmFzdGVyKVxuICBjb25zdCBzY3JvbGxSYXRlID0gZmFzdCA/IEZBU1RfU0NST0xMX1JBVEUgOiBTQ1JPTExfUkFURTtcbiAgLy8gQ3VycmVudCBzY3JvbGwgcG9zaXRpb25cbiAgY29uc3QgY3VycmVudCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgLy8gU2V0IGZsYWcgZm9yIHNjcm9sbCBkaXJlY3Rpb25cbiAgY29uc3QgZG93biA9IGN1cnJlbnQgPCB0YXJnZXQ7XG4gIC8vIFNldCBzdGVwIGJhc2VkIG9uIHNjcm9sbCByYXRlXG4gIGNvbnN0IHN0ZXAgPSAoTWF0aC5hYnMoY3VycmVudCAtIHRhcmdldCkgKiBzY3JvbGxSYXRlKSArIDE7XG4gIC8vIFNldCBuZXh0IHBvc2l0aW9uIGJhc2VkIG9uIHNjcm9sbCBkaXJlY3Rpb25cbiAgY29uc3QgbmV4dCA9IGRvd24gPyBjdXJyZW50ICsgc3RlcCA6IGN1cnJlbnQgLSBzdGVwO1xuICAvLyBTZXQgcGFzdCBmbGFnIGJhc2VkIG9uIHNjcm9sbCBkaXJlY3Rpb25cbiAgY29uc3QgaXNQYXN0ID0gZG93biA/IG5leHQgPj0gdGFyZ2V0IDogbmV4dCA8PSB0YXJnZXQ7XG4gIC8vIFNldCBmbGFnIHRvIGNoZWNrIGlmIGF0IGJvdHRvbSBvZiB3aW5kb3cgZm9yIHNjcm9sbGluZyBkb3duXG4gIGNvbnN0IHRvbGVyYW5jZSA9IDU7XG4gIGNvbnN0IGF0Qm90dG9tID0gZG93blxuICAgID8gKHdpbmRvdy5pbm5lckhlaWdodCArIHdpbmRvdy5wYWdlWU9mZnNldCArIHRvbGVyYW5jZSkgPj0gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHRcbiAgICA6IGZhbHNlO1xuXG4gIC8vIFNjcm9sbCB0byBuZXh0IHBvc2l0aW9uXG4gIHdpbmRvdy5zY3JvbGxUbygwLCBuZXh0KTtcblxuICBpZiAoIWlzUGFzdCAmJiAhYXRCb3R0b20gJiYgdGltZXIpIHtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNjcm9sbCh0YXJnZXQsIGNiKSk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoY2IpIGNiKCk7XG59XG5cbi8qKlxuICogU3RvcCByZXF1ZXN0aW5nIGFuaW1hdGlvbiBmcmFtZXMgYWZ0ZXIgcnVubmluZyBmb3IgbiBzZWNvbmRzXG4gKiBUaGlzIGZpeGVzIGNhc2Ugb2Ygc2Nyb2xsIGZ1bmN0aW9uIG5ldmVyIGZpbmlzaGluZyBpZiBjYWxsZWQgdHdpY2UgYmVmb3JlIHRoZSBmaXJzdCBmaW5pc2hlc1xuICovXG5mdW5jdGlvbiBzZXRUaW1lcigpIHtcbiAgdGltZXIgPSAxO1xuICB0aW1lckZ1bmN0aW9uID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdGltZXIgPSAwO1xuICB9LCAyNTAwKTtcbn1cblxuLyoqXG4gKiBTY3JvbGwgdG8gZWxlbWVudCBzcGVjaWZpZWQgYnkgaWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBhbmNob3IgLSBlbGVtZW50IGlkXG4gKiBAcGFyYW0ge2ludH0gb2Zmc2V0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjcm9sbFRvKGFuY2hvciwgb2Zmc2V0ID0gMCwgY2IgPSBudWxsKSB7XG4gIC8vIEdldCBlbGVtZW50IHRvIHNjcm9sbFxuICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuY2hvcik7XG4gIC8vIEdldCBwb3NpdGlvbiBvZiBlbGVtZW50XG4gIGNvbnN0IHRvcCA9IChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQpIC0gb2Zmc2V0O1xuXG4gIGNsZWFyVGltZW91dCh0aW1lckZ1bmN0aW9uKTtcbiAgc2V0VGltZXIoKTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBzY3JvbGwodG9wLCBjYikpO1xuXG4gIC8vIFVwZGF0ZSBVUkwgaGFzaFxuICBpZiAod2luZG93Lmhpc3RvcnkgJiYgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHdpbmRvdy5oaXN0b3J5LnN0YXRlLCBudWxsLCBgIyR7YW5jaG9yfWApO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYCMke2FuY2hvcn1gO1xuICB9XG59XG5cbi8qKlxuICogU2Nyb2xsIHRvIHRvcCBvZiBlbGVtZW50XG4gKiBAcGFyYW0ge25vZGV9IGVsZW1lbnRcbiAqIEBwYXJhbSB7aW50fSBvZmZzZXRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2Nyb2xsVG9wKGVsID0gZG9jdW1lbnQuYm9keSwgb2Zmc2V0ID0gMCwgY2IgPSBudWxsLCBmYXN0ID0gZmFsc2UpIHtcbiAgLy8gR2V0IHRvcCBwb3NpdGlvbiBvZiBlbGVtZW50XG4gIGNvbnN0IHRvcCA9IChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQpIC0gb2Zmc2V0O1xuXG4gIGNsZWFyVGltZW91dCh0aW1lckZ1bmN0aW9uKTtcbiAgc2V0VGltZXIoKTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBzY3JvbGwodG9wLCBjYiwgZmFzdCkpO1xufVxuXG4vKipcbiAqIFNjcm9sbCB0byBib3R0b20gb2YgZWxlbWVudFxuICogQHBhcmFtIHtub2RlfSBlbGVtZW50XG4gKiBAcGFyYW0ge2ludH0gb2Zmc2V0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjcm9sbEJvdHRvbShlbCA9IGRvY3VtZW50LmJvZHksIG9mZnNldCA9IDAsIGNiID0gbnVsbCkge1xuICAvLyBHZXQgYm90dG9tIHBvc2l0aW9uIG9mIGVsZW1lbnRcbiAgY29uc3QgYm90dG9tID0gKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIGVsLm9mZnNldEhlaWdodCArIHdpbmRvdy5wYWdlWU9mZnNldCkgLSBvZmZzZXQ7XG5cbiAgY2xlYXJUaW1lb3V0KHRpbWVyRnVuY3Rpb24pO1xuICBzZXRUaW1lcigpO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNjcm9sbChib3R0b20sIGNiKSk7XG59XG5cbiIsIi8vIGltcG9ydCBTdGlja3lGaWxsIGZyb20gJ3N0aWNreWZpbGxqcyc7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnLi4vdXRpbGl0aWVzL2RlYm91bmNlcic7XG5cbi8qKlxuICogU3B5IHNlY3Rpb25zIGFuZCBhZGQgY2xhc3Mgd2hlbiBpbiB2aWV3XG4gKiBAcGFyYW0ge3N0cmluZ30gc2VjdGlvbkhhbmRsZVxuICogQHBhcmFtIHtzdHJpbmd9IGluVmlld0NsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcHlTZWN0aW9ucyhzZWN0aW9uSGFuZGxlID0gJy5zcHknLCBpblZpZXdDbGFzcyA9ICdpbi12aWV3Jykge1xuICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VjdGlvbkhhbmRsZSk7XG5cbiAgLy8gRXZlbnQgaGFuZGxlciBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGVudHJpZXMsIG9ic2VydmVyKSB7XG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgQXJyYXkuZnJvbShlbnRyaWVzKVxuICAgICAgLmZpbHRlcihlbnRyeSA9PiAoXG4gICAgICAgIGVudHJ5LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoaW5WaWV3Q2xhc3MpXG4gICAgICAgIHx8IGVudHJ5LmludGVyc2VjdGlvblJhdGlvID4gKGVudHJ5LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhyZXNob2xkJykgfHwgMC41KVxuICAgICAgKSlcbiAgICAgIC5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgZW50cnkudGFyZ2V0LmNsYXNzTGlzdC5hZGQoaW5WaWV3Q2xhc3MpO1xuICAgICAgICBvYnNlcnZlci51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZVxuICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihoYW5kbGVTY3JvbGwsIHtcbiAgICAvLyBDYWxsIGF0IG11bHRpcGxlIHRocmVzaG9sZHMgdG8gYWxsb3cgZm9yIGN1c3RvbWl6YXRpb24gdmlhIGRhdGEgYXR0cmlidXRlXG4gICAgdGhyZXNob2xkOiBbMCwgMC4yNSwgMC41LCAwLjc1LCAxXSxcbiAgfSk7XG4gIEFycmF5LmZyb20oc2VjdGlvbnMpLmZvckVhY2goc2VjdGlvbiA9PiB7IG9ic2VydmVyLm9ic2VydmUoc2VjdGlvbik7IH0pO1xufVxuXG4vKipcbiAqIFNweSBzZWN0aW9uIGFuZCBzZXQgY29ycmVzcG9uZCBsaW5rIHRvIGFjdGl2ZVxuICogQHBhcmFtIHtvYmplY3R9XG4gKiB8X0BwYXJhbSB7bm9kZUxpc3R9IGxpbmtzXG4gKiB8X0BwYXJhbSB7bm9kZUxpc3R9IGxpbmtzXG4gKiB8X0BwYXJhbSB7c3RyaW5nfSBhY3RpdmVDbGFzc1xuICogfF9AcGFyYW0ge2Zsb2F0fSB0aHJlc2hvbGRcbiAqIHxfQHBhcmFtIHtmdW5jdGlvbn0gY2JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNweUFuY2hvcnMoe1xuICBsaW5rcyA9IFtdLFxuICBzZWN0aW9ucyA9IFtdLFxuICBhY3RpdmVDbGFzcyA9ICdpcy1hY3RpdmUnLFxuICB0aHJlc2hvbGQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyLFxuICBzY3JvbGxDb250YWluZXIgPSB3aW5kb3csXG4gIGNiID0gbnVsbCxcbn0pIHtcbiAgaWYgKCFzZWN0aW9ucykgcmV0dXJuO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZVNjcm9sbCgpIHtcbiAgICBBcnJheS5mcm9tKHNlY3Rpb25zKS5mb3JFYWNoKChzZWN0aW9uLCBpKSA9PiB7XG4gICAgICBjb25zdCByZWN0ID0gc2VjdGlvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHJlY3QudG9wID4gdGhyZXNob2xkIHx8IHJlY3QuYm90dG9tIDwgdGhyZXNob2xkKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGFjdGl2ZUFuY2hvcnMgPSBBcnJheS5mcm9tKGxpbmtzKVxuICAgICAgICAuZmlsdGVyKChsaW5rLCBpaSkgPT4gbGluay5jbGFzc0xpc3QudG9nZ2xlKGFjdGl2ZUNsYXNzLCBpID09PSBpaSkpO1xuXG4gICAgICBpZiAoIWNiKSByZXR1cm47XG5cbiAgICAgIGNiKGFjdGl2ZUFuY2hvcnNbMF0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2Nyb2xsQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbCk7XG59XG5cbi8qKlxuICogU3B5IHNlY3Rpb24gYW5kIHNldCBjb3JyZXNwb25kIGxpbmsgdG8gYWN0aXZlXG4gKiBAcGFyYW0ge29iamVjdH1cbiAqIHxfQHBhcmFtIHtub2RlfSBlbCAtIHRoZSBET00gZWxlbWVudCB0byB3YXRjaFxuICogfF9AcGFyYW0ge3N0cmluZ30gZml4ZWRDbGFzc1xuICogfF9AcGFyYW0ge2Zsb2F0fSB0aHJlc2hvbGRcbiAqIHxfQHBhcmFtIHtmdW5jdGlvbn0gY2JcbiAqICAgfF9AcGFyYW0ge2Jvb2x9IGZpeGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcHlOYXYoe1xuICBlbCxcbiAgbmF2ID0gZWwsXG4gIGZpeGVkQ2xhc3MgPSAnaXMtZml4ZWQnLFxuICB0aHJlc2hvbGQgPSAxLFxuICBjYixcbn0pIHtcbiAgY29uc3QgZGVsdGEgPSA1O1xuXG4gIC8vIFN0YXRlIHZhcmlhYmxlc1xuICBsZXQgZW5hYmxlZCA9IGZhbHNlO1xuICBsZXQgbGFzdFkgPSAwO1xuXG4gIC8vIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25zXG4gIGNvbnN0IGhhbmRsZVNjcm9sbCA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAvLyBPbmx5IHBlZWsgaGVhZGVyIGlmIG5hdiB0byBzcHkgaXMgZml4ZWQvZW5hYmxlZFxuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgbGFzdFkgPSAwO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGhpc1kgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cbiAgICAvLyBBZGQgZGVsdGEgZm9yIHNlbnNpdGl2aXR5IHRocmVzaG9sZFxuICAgIGlmIChNYXRoLmFicyh0aGlzWSAtIGxhc3RZKSA8IGRlbHRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2IodGhpc1kgPiBsYXN0WSk7XG5cbiAgICBsYXN0WSA9IHRoaXNZO1xuICB9LCAyNTApO1xuICBmdW5jdGlvbiBoYW5kbGVGaXhPYnNlcnZlcihlbnRyaWVzKSB7XG4gICAgLy8gVG9nZ2xlIGVuYWJsZWQgc3RhdGUgdmFyaWFibGUgdG8gY29uZGl0aW9uYWxseSBwcm9jZXNzIGhlYWRlciBwZWVrIG9uIHNjcm9sbCB1cFxuICAgIGVuYWJsZWQgPSBlbC5jbGFzc0xpc3QudG9nZ2xlKGZpeGVkQ2xhc3MsIGVudHJpZXNbMF0uYm91bmRpbmdDbGllbnRSZWN0LnRvcCA8IDApO1xuXG4gICAgY2IoZW5hYmxlZCk7XG4gIH1cblxuICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpO1xuICBjb25zdCBmaXhPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihoYW5kbGVGaXhPYnNlcnZlciwgeyB0aHJlc2hvbGQgfSk7XG4gIGZpeE9ic2VydmVyLm9ic2VydmUobmF2KTtcbn1cblxuLyoqXG4gKiBQb2x5ZmlsbCBhbmQgcG9zaXRpb24gc3RpY2t5IGVsZW1lbnRzIGJhc2VkIG9uIGRhdGEgYXR0cmlidXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGljaygpIHtcbi8vICAgY29uc3Qgc3RpY2tpZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zdGlja3k9XCJ0cnVlXCJdJyk7XG4vLyBcbi8vICAgQXJyYXkuZnJvbShzdGlja2llcylcbi8vICAgICAvLyBPbmx5IHN0aWNrIGVsZW1lbnRzIHRoYXQgaGF2ZSBub3QgYmVlbiBzdHVja1xuLy8gICAgIC5maWx0ZXIoc3RpY2t5ID0+ICFzdGlja3kuZ2V0QXR0cmlidXRlKCdkYXRhLXN0dWNrJykpXG4vLyAgICAgLy8gQXBwbHkgcG9seWZpbGwgc2NyaXB0IGZvciBJRSBhbmQgYWRkIHN0dWNrIGRhdGEgYXR0cmlidXRlXG4vLyAgICAgLmZvckVhY2goc3RpY2t5ID0+IHtcbi8vICAgICAgIFN0aWNreUZpbGwuYWRkT25lKHN0aWNreSk7XG4vLyBcbi8vICAgICAgIHN0aWNreS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3R1Y2snLCB0cnVlKTtcbi8vICAgICB9KTtcbn1cbiJdfQ==
