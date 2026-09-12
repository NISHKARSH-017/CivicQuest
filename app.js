/**
 * CivicQuest Application Entry Point
 * Wires reactive state store, client-side router, citizen home view,
 * report issue flow, and teammate route placeholders.
 */

import { router } from './src/router.js';
import { store } from './src/state/store.js';
import { renderHomePage } from './src/pages/homePage.js';
import { renderReportIssuePage } from './src/pages/reportIssuePage.js';
import { renderPlaceholderPage } from './src/components/placeholderPage.js';

// 1. REGISTER ROUTES
// Route: Citizen Home / Dashboard
router.register('home', (container) => {
  renderHomePage(container);
});

// Route: Report an Issue
router.register('report', (container) => {
  renderReportIssuePage(container);
});

// Route: Missions (Placeholder ready for teammate integration)
router.register('missions', (container) => {
  renderPlaceholderPage(container, {
    title: 'Civic Missions & Quests',
    subtitle: 'Join neighborhood cleanup crews, spot hazards, and complete crew challenges.',
    icon: '◒',
    badge: 'ASSIGNED TO TEAMMATE',
    description: 'This page will be built by our teammate. It will showcase active Maplewood crew missions, verification tasks, and cooperative community objectives.',
    filename: 'missionsPage.js',
    routeName: 'missions',
  });
});

// Route: Leaderboard (Placeholder ready for teammate integration)
router.register('leaderboard', (container) => {
  renderPlaceholderPage(container, {
    title: 'Neighborhood Leaderboard',
    subtitle: 'See Maplewood community standings, top contributors, and neighborhood crew rankings.',
    icon: '🏆',
    badge: 'ASSIGNED TO TEAMMATE',
    description: 'This page will be built by our teammate. It will feature weekly leaderboards, street-by-street rankings, and contributor streaks across Portland.',
    filename: 'leaderboardPage.js',
    routeName: 'leaderboard',
  });
});

// Route: Impact Wallet & Badges (Placeholder ready for teammate integration)
router.register('wallet', (container) => {
  const coins = store.getState().civicCoins;
  renderPlaceholderPage(container, {
    title: 'Impact Wallet & Rewards',
    subtitle: `Current Balance: ${coins} Civic Coins · Redeemable for local goods & tree planting.`,
    icon: '♢',
    badge: 'ASSIGNED TO TEAMMATE',
    description: 'This page will be built by our teammate. It will display the citizen\'s Civic Coin ledger, tree funding certificates, local coffee vouchers, and unlocked badges.',
    filename: 'walletPage.js',
    routeName: 'wallet',
  });
});

// 2. INITIALIZE ROUTER
const viewContainer = document.querySelector('#view-container');
router.init(viewContainer);

// 3. GLOBAL ROUTE NAVIGATION BINDING
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-route]');
  if (target) {
    const route = target.getAttribute('data-route');
    if (route) {
      e.preventDefault();
      router.navigate(route);
    }
  }
});

// 4. KEYBOARD SHORTCUT: 'R' TO QUICKLY REPORT AN ISSUE
document.addEventListener('keydown', (e) => {
  if (
    e.key.toLowerCase() === 'r' &&
    !e.metaKey &&
    !e.ctrlKey &&
    !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
  ) {
    e.preventDefault();
    router.navigate('report');
  }
});

// 5. REACTIVE USER PROFILE SYNC
store.subscribe((state) => {
  const nameEl = document.querySelector('#sidebar-user-name');
  const badgeEl = document.querySelector('#sidebar-user-badge');
  if (nameEl) nameEl.textContent = state.user.name;
  if (badgeEl) badgeEl.textContent = `Level ${state.user.level} · ${state.user.badge}`;
});

// 6. GLOBAL TOAST HELPER
export function showGlobalToast(title, message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  const titleEl = toast.querySelector('#toast-title');
  const descEl = toast.querySelector('#toast-desc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
