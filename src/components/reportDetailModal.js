/**
 * Report Detail Modal Component
 * Displays complete details for an existing duplicate or a newly submitted report.
 */

export function showReportDetailModal(report) {
  // Remove any existing detail modal
  const existing = document.querySelector('#report-detail-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'report-detail-modal';
  modal.className = 'modal-bg open report-detail-overlay';

  const photoHtml = report.photoUrl
    ? `<div class="detail-photo-wrap">
        <img src="${report.photoUrl}" alt="Issue photo" class="detail-photo" onerror="this.parentElement.style.display='none'">
       </div>`
    : '';

  modal.innerHTML = `
    <div class="panel detail-modal-card">
      <button type="button" class="close detail-close-btn" aria-label="Close">×</button>
      
      <div class="detail-header">
        <span class="detail-badge ${report.status === 'Reported' ? 'status-reported' : 'status-in-review'}">
          ${report.status || 'Reported'}
        </span>
        <span class="detail-id">${report.id || 'CQ-2026'}</span>
      </div>

      <h2 class="detail-title">${report.title || `${report.category} Issue`}</h2>
      <div class="detail-meta">
        ${report.category ? `<span class="category-tag">${report.category}</span>` : ''}
        <span>📍 ${report.location}</span>
        ${report.distance ? `<span class="detail-dist">· ${report.distance}</span>` : ''}
        <span>🕒 ${report.reportedAt || 'Recent'}</span>
      </div>

      ${photoHtml}

      <div class="detail-body">
        <small class="detail-label">DESCRIPTION</small>
        <p class="detail-desc">${report.description || 'No additional details provided.'}</p>
      </div>

      <div class="detail-footer">
        <button class="btn btn-secondary close-action-btn">Close</button>
        ${report.upvotes !== undefined ? `
          <button class="btn btn-primary upvote-btn">
            👍 Upvote Report <span class="upvote-count">${report.upvotes}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();

  modal.querySelector('.detail-close-btn').addEventListener('click', closeModal);
  modal.querySelector('.close-action-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const upvoteBtn = modal.querySelector('.upvote-btn');
  if (upvoteBtn) {
    let hasUpvoted = false;
    upvoteBtn.addEventListener('click', () => {
      if (!hasUpvoted) {
        hasUpvoted = true;
        const countSpan = upvoteBtn.querySelector('.upvote-count');
        countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;
        upvoteBtn.classList.add('upvoted');
        upvoteBtn.innerHTML = `✓ Upvoted <span class="upvote-count">${countSpan.textContent}</span>`;
      }
    });
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);
}
