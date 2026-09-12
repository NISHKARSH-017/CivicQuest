/**
 * CivicQuest Client-Side Hash Router
 *
 * TEAMMATE EXTENSION GUIDE:
 * To connect your page (e.g. Missions, Leaderboard, Impact Wallet), simply import `router`
 * and register your page handler:
 *
 *   import { router } from './src/router.js';
 *   router.register('missions', (container, params) => {
 *     container.innerHTML = '<h1>My Missions Page</h1>';
 *     // or mount your component
 *   });
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.container = null;
    this.current = null;
    this.beforeHooks = [];
    this.afterHooks = [];

    // Bind event
    window.addEventListener('hashchange', () => this._handleRoute());
  }

  /**
   * Set root container where views will be rendered
   * @param {HTMLElement} containerElement
   */
  init(containerElement) {
    this.container = containerElement;
    // Initial route handling
    this._handleRoute();
  }

  /**
   * Register a route handler
   * @param {string} routeName - e.g. 'home', 'report', 'missions', 'leaderboard', 'wallet'
   * @param {Function} handler - Function(container, params)
   */
  register(routeName, handler) {
    this.routes.set(routeName.toLowerCase().replace(/^#\/?/, ''), handler);
  }

  /**
   * Programmatic navigation
   * @param {string} routeName
   * @param {Object} [params]
   */
  navigate(routeName, params = {}) {
    const cleanRoute = routeName.replace(/^#\/?/, '');
    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    window.location.hash = `#/${cleanRoute}${queryString}`;
  }

  /**
   * Add middleware before route change
   */
  beforeEach(fn) {
    this.beforeHooks.push(fn);
  }

  /**
   * Add middleware after route change
   */
  afterEach(fn) {
    this.afterHooks.push(fn);
  }

  _parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '') || 'home';
    const [pathPart, queryPart] = raw.split('?');
    const path = pathPart.toLowerCase() || 'home';
    const params = {};

    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    return { path, params };
  }

  _handleRoute() {
    if (!this.container) return;

    const { path, params } = this._parseHash();
    this.current = path;

    // Run before hooks
    for (const hook of this.beforeHooks) {
      const proceed = hook(path, params);
      if (proceed === false) return;
    }

    // Lookup handler
    const handler = this.routes.get(path) || this.routes.get('home');

    if (handler) {
      // Clear container and render new view
      this.container.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
      handler(this.container, params);
    } else {
      console.warn(`Route not found: ${path}`);
    }

    // Update active nav highlights in sidebar & header
    this._updateNavHighlights(path);

    // Run after hooks
    for (const hook of this.afterHooks) {
      hook(path, params);
    }
  }

  _updateNavHighlights(activeRoute) {
    document.querySelectorAll('[data-route]').forEach((el) => {
      const target = el.getAttribute('data-route');
      if (target === activeRoute) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  getCurrentRoute() {
    return this.current || 'home';
  }
}

export const router = new Router();
