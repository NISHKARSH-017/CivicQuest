/**
 * Teammate Section Placeholder Component
 * Displays a clean, developer-friendly card while teammates build their respective pages.
 */

import { router } from '../router.js';

export function renderPlaceholderPage(container, config) {
  const { title, subtitle, icon, badge, description, filename, routeName } = config;

  container.innerHTML = `
    <div class="wrap placeholder-container">
      <div class="panel placeholder-card">
        <div class="placeholder-header">
          <div class="placeholder-icon">${icon}</div>
          <div class="placeholder-tag">${badge}</div>
        </div>

        <h1 class="placeholder-title">${title}</h1>
        <p class="placeholder-subtitle">${subtitle}</p>

        <div class="placeholder-info-box">
          <p class="placeholder-desc">${description}</p>
          <div class="placeholder-code-tip">
            <small>HOW TEAMMATES CONNECT THIS PAGE:</small>
            <code>
// In your module (e.g. ${filename}):
import { router } from './src/router.js';
router.register('${routeName}', (container) => {
  // Render your ${title} page here
});
            </code>
          </div>
        </div>

        <div class="placeholder-actions">
          <button class="btn btn-secondary back-home-btn">← Back to Citizen Home</button>
          <button class="btn btn-primary go-report-btn">＋ Report an Issue</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('.back-home-btn').addEventListener('click', () => {
    router.navigate('home');
  });

  container.querySelector('.go-report-btn').addEventListener('click', () => {
    router.navigate('report');
  });
}
