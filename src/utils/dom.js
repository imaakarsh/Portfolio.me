/**
 * DOM utility functions for safer element selection and manipulation
 */

/**
 * Safely get an element by ID with proper typing
 * @param {string} id - The element ID
 * @returns {Element|null} The element or null if not found
 */
export function byId(id) {
  try {
    return document.getElementById(id);
  } catch {
    console.warn(`Failed to get element with id: ${id}`);
    return null;
  }
}

/**
 * Query all elements matching a selector
 * @param {string} selector - CSS selector
 * @param {Document|Element} parent - Parent element to query within (defaults to document)
 * @returns {Element[]} Array of matching elements
 */
export function queryAll(selector, parent = document) {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch {
    console.warn(`Failed to query elements with selector: ${selector}`);
    return [];
  }
}

/**
 * Query a single element
 * @param {string} selector - CSS selector
 * @param {Document|Element} parent - Parent element to query within (defaults to document)
 * @returns {Element|null} The element or null
 */
export function query(selector, parent = document) {
  try {
    return parent.querySelector(selector) ?? null;
  } catch {
    console.warn(`Failed to query element with selector: ${selector}`);
    return null;
  }
}

/**
 * Safely add/remove classes with error handling
 */
export const classList = {
  add(element, ...classes) {
    if (!element) return;
    try {
      element.classList.add(...classes);
    } catch {
      console.warn('Failed to add classes', classes);
    }
  },
  remove(element, ...classes) {
    if (!element) return;
    try {
      element.classList.remove(...classes);
    } catch {
      console.warn('Failed to remove classes', classes);
    }
  },
  toggle(element, className, force) {
    if (!element) return;
    try {
      element.classList.toggle(className, force);
    } catch {
      console.warn('Failed to toggle class', className);
    }
  },
  has(element, className) {
    if (!element) return false;
    try {
      return element.classList.contains(className);
    } catch {
      return false;
    }
  },
};

/**
 * Debounce a function to limit call frequency
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId = null;

  return (...args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle a function to limit call frequency
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId = null;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    } else if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
}