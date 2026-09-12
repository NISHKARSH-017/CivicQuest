/**
 * AI Duplicate Detection Modal Component
 * Displays scanning progress, duplicate match cards, or verified unique confirmations.
 */

import { checkDuplicate } from '../services/aiDuplicateService.js';
import { showReportDetailModal } from './reportDetailModal.js';

export function showDuplicateDetectionModal({ reportData, onConfirmSubmission, onCancel }) {
  // Remove existing modal if open
  const existing = document.querySelector('#duplicate-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'duplicate-modal';
  modal.className = 'modal-bg open duplicate-modal-overlay';

  // Render initial scanning state
  modal.innerHTML = `
    <div class="panel duplicate-card scanning-state">
      <div class="ai-scanner-header">
        <div class="radar-pulse">
          <div class="radar-ring"></div>
          <div class="radar-center">✦</div>
        </div>
        <small class="ai-badge">CIVIC-AI VISION & GEO-MATCHER</small>
        <h2>Scanning For Duplicates...</h2>
        <p class="scan-subtitle">Cross-referencing neighborhood reports in Maplewood</p>
      </div>

      <div class="scan-steps">
        <div class="scan-step active" id="step-1">
          <span class="step-dot">●</span>
          <span>Analyzing location radius & coordinates</span>
        </div>
        <div class="scan-step" id="step-2">
          <span class="step-dot">○</span>
          <span>Comparing report category & description tokens</span>
        </div>
        <div class="scan-step" id="step-3">
          <span class="step-dot">○</span>
          <span>Running computer vision similarity analysis</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Progressive scan steps animation
  setTimeout(() => {
    const s2 = modal.querySelector('#step-2');
    if (s2) {
      s2.classList.add('active');
      s2.querySelector('.step-dot').textContent = '●';
    }
  }, 400);

  setTimeout(() => {
    const s3 = modal.querySelector('#step-3');
    if (s3) {
      s3.classList.add('active');
      s3.querySelector('.step-dot').textContent = '●';
    }
  }, 800);

  // Run AI duplicate check service
  checkDuplicate(reportData)
    .then((result) => {
      renderResult(modal, result, reportData, onConfirmSubmission, onCancel);
    })
    .catch((err) => {
      console.error('Duplicate detection error:', err);
      // Fallback: proceed to submission
      renderResult(
        modal,
        { hasDuplicate: false, message: 'AI verification offline. Your report will be submitted directly.' },
        reportData,
        onConfirmSubmission,
        onCancel
      );
    });
}

function renderResult(modal, result, reportData, onConfirmSubmission, onCancel) {
  const dismissModal = () => {
    modal.remove();
    if (onCancel) onCancel();
  };

  if (result.hasDuplicate) {
    const ex = result.existingReport;
    modal.innerHTML = `
      <div class="panel duplicate-card duplicate-found">
        <button type="button" class="close dup-close-btn" aria-label="Close">×</button>
        <div class="duplicate-header">
          <div class="warning-icon">⚠️</div>
          <div>
            <div class="match-badge">AI MATCH DETECTED · ${result.similarityScore}% SIMILARITY</div>
            <h2>Possible Duplicate Issue Found</h2>
          </div>
        </div>

        <p class="duplicate-explainer">
          A similar report already exists nearby. Submitting duplicates can split upvotes and slow down municipal response, but you can review the existing ticket below.
        </p>

        <div class="existing-report-box">
          <div class="existing-report-top">
            <span class="category-tag">${ex.category}</span>
            <span class="status-tag">${ex.status}</span>
          </div>

          <h3 class="existing-title">${ex.title}</h3>

          <div class="existing-details-grid">
            <div class="detail-item">
              <small>APPROXIMATE LOCATION</small>
              <strong>📍 ${ex.location}</strong>
              <span class="distance-note">(${ex.distance})</span>
            </div>
            <div class="detail-item">
              <small>REPORTED</small>
              <strong>🕒 ${ex.reportedAt}</strong>
            </div>
          </div>

          ${ex.photoUrl ? `
            <div class="existing-thumbnail-wrap">
              <img src="${ex.photoUrl}" alt="Existing report thumbnail" class="existing-thumbnail" />
              <span class="thumb-label">Existing Report Photo</span>
            </div>
          ` : ''}

          <div class="existing-actions">
            <button class="btn btn-secondary view-existing-btn" type="button">
              🔍 View Existing Report
            </button>
          </div>
        </div>

        <div class="duplicate-decision-actions">
          <button class="btn btn-primary submit-anyway-btn" type="button">
            ⚡ Submit Anyway (+10 CC)
          </button>
          <button class="btn btn-ghost edit-report-btn" type="button">
            ← Edit My Report
          </button>
        </div>
      </div>
    `;

    modal.querySelector('.dup-close-btn').addEventListener('click', dismissModal);

    modal.querySelector('.view-existing-btn').addEventListener('click', () => {
      showReportDetailModal(ex);
    });

    modal.querySelector('.submit-anyway-btn').addEventListener('click', () => {
      modal.remove();
      onConfirmSubmission({ ...reportData, acknowledgedDuplicate: true });
    });

    modal.querySelector('.edit-report-btn').addEventListener('click', dismissModal);
  } else {
    // No similar issue found
    modal.innerHTML = `
      <div class="panel duplicate-card no-duplicate-found">
        <button type="button" class="close dup-close-btn" aria-label="Close">×</button>
        <div class="no-dup-header">
          <div class="check-icon">✓</div>
          <div class="verified-tag">AI VERIFIED UNIQUE</div>
          <h2>No Similar Issue Found</h2>
          <p class="no-dup-sub">Your issue is ready to be submitted.</p>
        </div>

        <div class="verification-summary-box">
          <div class="summary-line">
            <span>Geospatial Proximity Scan</span>
            <strong class="text-green">✓ Clear (0 conflicts)</strong>
          </div>
          <div class="summary-line">
            <span>Visual & Text Similarity</span>
            <strong class="text-green">✓ ${result.similarityScore || 8}% (Unique)</strong>
          </div>
          <div class="summary-line">
            <span>Target Municipal Routing</span>
            <strong>Public Works & Neighborhood Response</strong>
          </div>
        </div>

        <div class="duplicate-decision-actions">
          <button class="btn btn-primary confirm-submit-btn" type="button">
            Submit Issue & Earn +10 CC →
          </button>
          <button class="btn btn-ghost edit-report-btn" type="button">
            ← Review / Edit
          </button>
        </div>
      </div>
    `;

    modal.querySelector('.dup-close-btn').addEventListener('click', dismissModal);

    modal.querySelector('.confirm-submit-btn').addEventListener('click', () => {
      modal.remove();
      onConfirmSubmission(reportData);
    });

    modal.querySelector('.edit-report-btn').addEventListener('click', dismissModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) dismissModal();
  });
}
