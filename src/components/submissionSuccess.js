/**
 * Issue Submission Success Modal Component
 * Displays +10 Civic Coins reward, generated Issue ID, status tracker, and return/view buttons.
 */

import { router } from '../router.js';
import { showReportDetailModal } from './reportDetailModal.js';

export function showSubmissionSuccessModal(submittedReport) {
  // Remove existing success modal if open
  const existing = document.querySelector('#submission-success-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'submission-success-modal';
  modal.className = 'modal-bg open success-modal-overlay';

  modal.innerHTML = `
    <div class="panel success-card">
      <button type="button" class="close success-close-btn" aria-label="Close">×</button>
      <div class="coin-reward-badge">
        <div class="coin-icon-glow">✦</div>
        <span class="reward-text">+10 CIVIC COINS EARNED!</span>
      </div>

      <h1 class="success-title">Issue Reported Successfully!</h1>
      <p class="success-subtitle">Your report is logged on the neighborhood registry.</p>

      <div class="ticket-info-box">
        <div class="ticket-row">
          <span class="ticket-label">ISSUE TRACKING ID</span>
          <strong class="ticket-id" id="copy-ticket-id">${submittedReport.id}</strong>
        </div>

        <div class="ticket-row">
          <span class="ticket-label">STATUS</span>
          <span class="status-pill status-reported">● Reported</span>
        </div>

        <div class="status-tracker">
          <div class="tracker-step completed">
            <span class="step-circle">✓</span>
            <small>Reported</small>
          </div>
          <div class="tracker-line"></div>
          <div class="tracker-step">
            <span class="step-circle">2</span>
            <small>Verified</small>
          </div>
          <div class="tracker-line"></div>
          <div class="tracker-step">
            <span class="step-circle">3</span>
            <small>In Progress</small>
          </div>
          <div class="tracker-line"></div>
          <div class="tracker-step">
            <span class="step-circle">4</span>
            <small>Resolved</small>
          </div>
        </div>

        <div class="ticket-summary">
          <div><small>CATEGORY</small><strong>${submittedReport.category}</strong></div>
          <div><small>LOCATION</small><strong>${submittedReport.location}</strong></div>
        </div>
      </div>

      <div class="success-actions">
        <button class="btn btn-secondary view-report-btn" type="button">
          👁 View Submitted Report
        </button>
        <button class="btn btn-primary return-home-btn" type="button">
          🏠 Return to Citizen Home
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
    router.navigate('home');
  };

  modal.querySelector('.success-close-btn').addEventListener('click', closeModal);
  modal.querySelector('.return-home-btn').addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // View submitted report
  modal.querySelector('.view-report-btn').addEventListener('click', () => {
    showReportDetailModal(submittedReport);
  });
}
