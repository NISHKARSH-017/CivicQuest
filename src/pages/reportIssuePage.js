/**
 * Report Issue Page Component
 * Complete frontend reporting form featuring category selection, interactive map pin selector,
 * photo upload with live preview, form validation, and AI duplicate detection trigger.
 */

import { router } from '../router.js';
import { store } from '../state/store.js';
import { showDuplicateDetectionModal } from '../components/duplicateModal.js';
import { showSubmissionSuccessModal } from '../components/submissionSuccess.js';

const CATEGORIES = [
  { id: 'Pothole', name: 'Pothole', icon: '🕳️', desc: 'Road crater, sunken asphalt, or tire hazard' },
  { id: 'Overflowing Garbage', name: 'Overflowing Garbage', icon: '🗑️', desc: 'Full public bin, litter pile, or dumping' },
  { id: 'Broken Streetlight', name: 'Broken Streetlight', icon: '💡', desc: 'Flickering bulb, dark lamp, or fallen pole' },
  { id: 'Water Leakage', name: 'Water Leakage', icon: '💧', desc: 'Water main burst, flooding, or hydrant leak' },
  { id: 'Unsafe Public Area', name: 'Unsafe Public Area', icon: '⚠️', desc: 'Missing manhole, broken rail, or hazard' },
  { id: 'Other', name: 'Other', icon: '📋', desc: 'Signage, vandalism, benches, or general concern' },
];

const SAMPLE_PHOTOS = {
  Pothole: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  'Overflowing Garbage': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  'Broken Streetlight': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  'Water Leakage': 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
  'Unsafe Public Area': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1581852017103-68ac65514be0?auto=format&fit=crop&w=800&q=80',
};

export function renderReportIssuePage(container) {
  let selectedCategory = 'Pothole';
  let uploadedPhotoUrl = '';
  let pinCoordinates = { lat: 45.5155, lng: -122.6780, xPercent: 42, yPercent: 45 };

  container.innerHTML = `
    <div class="wrap reporting-page-container">
      <div class="reporting-page-header">
        <button type="button" class="back-link-btn" id="btn-back-home">
          ← Back to Citizen Home
        </button>
        <div class="reporting-title-wrap">
          <h1>Report a Civic Issue</h1>
          <p>Help municipal crews resolve neighborhood issues faster. Earn <strong>+10 Civic Coins</strong> for every valid report.</p>
        </div>
      </div>

      <form id="issue-reporting-form" class="reporting-form-layout" novalidate>
        <!-- Left Column: Form Fields -->
        <div class="form-main-col">
          <!-- 1. Category Selection -->
          <section class="panel form-section">
            <div class="section-title-row">
              <span class="step-num">1</span>
              <div>
                <h2>Select Issue Category</h2>
                <p>Choose the category that best describes what you spotted.</p>
              </div>
            </div>

            <div class="category-grid" role="radiogroup" aria-label="Issue category selection">
              ${CATEGORIES.map((cat) => `
                <label class="category-card ${cat.id === selectedCategory ? 'selected' : ''}" data-cat-id="${cat.id}">
                  <input type="radio" name="category" value="${cat.id}" ${cat.id === selectedCategory ? 'checked' : ''} />
                  <span class="cat-icon">${cat.icon}</span>
                  <span class="cat-info">
                    <strong>${cat.name}</strong>
                    <small>${cat.desc}</small>
                  </span>
                </label>
              `).join('')}
            </div>
            <div class="form-error-msg" id="category-error">Please select an issue category.</div>
          </section>

          <!-- 2. Location Selection UI -->
          <section class="panel form-section">
            <div class="section-title-row">
              <span class="step-num">2</span>
              <div>
                <h2>Pin Issue Location</h2>
                <p>Click on the map or type the street address / landmark.</p>
              </div>
            </div>

            <div class="location-picker-wrap">
              <!-- Interactive Map Picker -->
              <div class="interactive-map-box" id="map-pin-box" title="Click anywhere on the map to place the location pin">
                <div class="grid-lines"></div>
                <span class="road road-a"></span>
                <span class="road road-b"></span>
                <span class="road road-c"></span>
                
                <div class="interactive-pin" id="map-active-pin" style="left: ${pinCoordinates.xPercent}%; top: ${pinCoordinates.yPercent}%">
                  <span class="pin-head">●</span>
                  <span class="pin-pulse"></span>
                  <div class="pin-tooltip" id="pin-coords-tooltip">45.5155° N, 122.6780° W</div>
                </div>

                <small class="map-label street-a">MAPLE AVE</small>
                <small class="map-label street-b">FREMONT ST</small>
                <small class="map-label street-c">23RD ST</small>

                <div class="map-overlay-instructions">
                  📍 Click map to reposition pin
                </div>
              </div>

              <!-- Location Input Controls -->
              <div class="location-controls-bar">
                <div class="location-input-group">
                  <label for="location-input">STREET ADDRESS OR LANDMARK</label>
                  <div class="input-with-icon">
                    <span class="input-icon">📍</span>
                    <input 
                      type="text" 
                      id="location-input" 
                      name="location" 
                      placeholder="e.g. Maple Ave & 23rd St, Portland" 
                      value="Maple Ave & 23rd St" 
                      required 
                    />
                  </div>
                  <div class="form-error-msg" id="location-error">Please provide a valid location.</div>
                </div>

                <button type="button" class="btn btn-secondary gps-btn" id="btn-use-gps">
                  <span class="gps-icon">⌖</span>
                  <span>Use My Location</span>
                </button>
              </div>

              <div class="quick-locations">
                <small>QUICK PRESETS:</small>
                <button type="button" class="preset-chip" data-loc="Maple Ave & 23rd St" data-x="42" data-y="45">Maple & 23rd</button>
                <button type="button" class="preset-chip" data-loc="Fremont St & 14th Ave" data-x="68" data-y="28">Fremont & 14th</button>
                <button type="button" class="preset-chip" data-loc="Maplewood Park Gate" data-x="25" data-y="65">Maplewood Park</button>
              </div>
            </div>
          </section>

          <!-- 3. Description -->
          <section class="panel form-section">
            <div class="section-title-row">
              <span class="step-num">3</span>
              <div>
                <h2>Issue Description</h2>
                <p>Provide details to help city crews bring the right equipment.</p>
              </div>
            </div>

            <div class="description-wrap">
              <textarea 
                id="description-input" 
                name="description" 
                rows="4" 
                maxlength="500"
                placeholder="Describe the severity, exact hazard, or danger to pedestrians/cars (e.g. Deep pothole right in front of the bike lane crosswalk, causing cars to swerve)."
              >Large pothole in the right lane right before the crosswalk. Vehicles are swerving into oncoming traffic to avoid it.</textarea>
              <div class="desc-footer">
                <small class="tip">💡 Mention size, nearby landmarks, or urgent safety hazards.</small>
                <small id="char-count" class="char-count">115 / 500</small>
              </div>
              <div class="form-error-msg" id="description-error">Please provide at least 10 characters describing the issue.</div>
            </div>
          </section>
        </div>

        <!-- Right Column: Photo Upload & Submission Summary -->
        <div class="form-sidebar-col">
          <!-- 4. Photo Upload -->
          <section class="panel form-section photo-section">
            <div class="section-title-row">
              <span class="step-num">4</span>
              <div>
                <h2>Photo Evidence <small class="optional-tag">(Optional)</small></h2>
                <p>Photos increase resolution speed by 3x.</p>
              </div>
            </div>

            <div class="photo-upload-container" id="photo-drop-zone">
              <input type="file" id="photo-file-input" accept="image/*" class="file-input-hidden" />
              
              <!-- Empty Upload State -->
              <div class="photo-drop-empty" id="photo-empty-view">
                <div class="upload-icon-circle">📷</div>
                <strong>Drag & drop an image here</strong>
                <p>or click to browse from device</p>
                <span class="upload-specs">PNG, JPG, WEBP up to 10MB</span>
                <button type="button" class="btn btn-secondary browse-btn" id="btn-browse-photo">Select Image</button>
                <button type="button" class="btn btn-ghost sample-photo-btn" id="btn-sample-photo">Use Sample Photo</button>
              </div>

              <!-- Preview State (Initially Hidden) -->
              <div class="photo-preview-wrap" id="photo-preview-view" style="display: none;">
                <img id="photo-preview-img" src="" alt="Issue Preview" />
                <div class="preview-overlay-bar">
                  <span id="photo-preview-name" class="photo-name">issue-evidence.jpg</span>
                  <button type="button" class="remove-photo-btn" id="btn-remove-photo" title="Remove photo">✕</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 5. Submission Card & AI Duplicate Check Notice -->
          <section class="panel form-section submit-box-panel">
            <div class="submit-rewards-notice">
              <div class="reward-coin-badge">✦ +10 CC</div>
              <div>
                <strong>Civic Contribution Reward</strong>
                <p>Earn 10 Civic Coins towards local rewards upon report confirmation.</p>
              </div>
            </div>

            <div class="ai-shield-notice">
              <span class="shield-icon">🛡️</span>
              <div>
                <small>POWERED BY CIVIC-AI</small>
                <p>Reports are scanned in real-time to avoid duplicates and expedite city response.</p>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-large submit-issue-btn" id="btn-submit-issue">
              Submit Issue & Check Duplicates →
            </button>
          </section>
        </div>
      </form>
    </div>
  `;

  // --- WIRING & INTERACTIONS ---

  // Back home button
  container.querySelector('#btn-back-home').addEventListener('click', () => {
    router.navigate('home');
  });

  // Category Selection
  const categoryCards = container.querySelectorAll('.category-card');
  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      categoryCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedCategory = card.getAttribute('data-cat-id');
      container.querySelector('#category-error').style.display = 'none';
    });
  });

  // Location Map Pin Click Handling
  const mapBox = container.querySelector('#map-pin-box');
  const activePin = container.querySelector('#map-active-pin');
  const coordsTooltip = container.querySelector('#pin-coords-tooltip');
  const locationInput = container.querySelector('#location-input');

  mapBox.addEventListener('click', (e) => {
    const rect = mapBox.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    pinCoordinates = {
      xPercent: x.toFixed(1),
      yPercent: y.toFixed(1),
      lat: (45.5100 + (y / 100) * 0.015).toFixed(4),
      lng: (-122.6850 + (x / 100) * 0.020).toFixed(4),
    };

    activePin.style.left = `${pinCoordinates.xPercent}%`;
    activePin.style.top = `${pinCoordinates.yPercent}%`;
    coordsTooltip.textContent = `${pinCoordinates.lat}° N, ${pinCoordinates.lng}° W`;

    // Guess nearby street
    let guessedStreet = 'Maple Ave & 23rd St';
    if (x > 55 && y < 45) guessedStreet = 'Fremont St & 14th Ave';
    else if (y > 60) guessedStreet = 'Maplewood Park Entrance';
    else if (x < 30) guessedStreet = 'Oak Street Crosswalk';

    locationInput.value = guessedStreet;
    container.querySelector('#location-error').style.display = 'none';
  });

  // Location Preset Chips
  container.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const loc = chip.getAttribute('data-loc');
      const x = chip.getAttribute('data-x');
      const y = chip.getAttribute('data-y');

      locationInput.value = loc;
      pinCoordinates.xPercent = x;
      pinCoordinates.yPercent = y;
      activePin.style.left = `${x}%`;
      activePin.style.top = `${y}%`;
      container.querySelector('#location-error').style.display = 'none';
    });
  });

  // GPS Location Simulation Button
  container.querySelector('#btn-use-gps').addEventListener('click', () => {
    const btn = container.querySelector('#btn-use-gps');
    btn.classList.add('loading');
    btn.querySelector('span:last-child').textContent = 'Acquiring GPS...';

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.querySelector('span:last-child').textContent = 'GPS Locked ✓';
      locationInput.value = 'Maple Ave & 23rd St, Portland (Current Location)';
      pinCoordinates = { xPercent: 42, yPercent: 45, lat: '45.5152', lng: '-122.6784' };
      activePin.style.left = '42%';
      activePin.style.top = '45%';
      coordsTooltip.textContent = '45.5152° N, -122.6784° W';
      container.querySelector('#location-error').style.display = 'none';
    }, 600);
  });

  // Description character count
  const descInput = container.querySelector('#description-input');
  const charCount = container.querySelector('#char-count');
  descInput.addEventListener('input', () => {
    charCount.textContent = `${descInput.value.length} / 500`;
    if (descInput.value.trim().length >= 10) {
      container.querySelector('#description-error').style.display = 'none';
    }
  });

  // Photo Upload Handling
  const dropZone = container.querySelector('#photo-drop-zone');
  const fileInput = container.querySelector('#photo-file-input');
  const emptyView = container.querySelector('#photo-empty-view');
  const previewView = container.querySelector('#photo-preview-view');
  const previewImg = container.querySelector('#photo-preview-img');
  const previewName = container.querySelector('#photo-preview-name');
  const browseBtn = container.querySelector('#btn-browse-photo');
  const sampleBtn = container.querySelector('#btn-sample-photo');
  const removeBtn = container.querySelector('#btn-remove-photo');

  browseBtn.addEventListener('click', () => fileInput.click());
  emptyView.addEventListener('click', (e) => {
    if (e.target !== sampleBtn) fileInput.click();
  });

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhotoUrl = event.target.result;
      previewImg.src = uploadedPhotoUrl;
      previewName.textContent = file.name;
      emptyView.style.display = 'none';
      previewView.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Sample photo button for quick hackathon demo
  sampleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadedPhotoUrl = SAMPLE_PHOTOS[selectedCategory] || SAMPLE_PHOTOS.Pothole;
    previewImg.src = uploadedPhotoUrl;
    previewName.textContent = `sample-${selectedCategory.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    emptyView.style.display = 'none';
    previewView.style.display = 'block';
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadedPhotoUrl = '';
    fileInput.value = '';
    previewImg.src = '';
    emptyView.style.display = 'flex';
    previewView.style.display = 'none';
  });

  // Drag & drop support
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // --- FORM SUBMISSION & VALIDATION ---
  const form = container.querySelector('#issue-reporting-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate category
    if (!selectedCategory) {
      container.querySelector('#category-error').style.display = 'block';
      isValid = false;
    } else {
      container.querySelector('#category-error').style.display = 'none';
    }

    // Validate location
    const locValue = locationInput.value.trim();
    if (!locValue) {
      container.querySelector('#location-error').style.display = 'block';
      locationInput.focus();
      isValid = false;
    } else {
      container.querySelector('#location-error').style.display = 'none';
    }

    // Validate description
    const descValue = descInput.value.trim();
    if (descValue.length < 10) {
      container.querySelector('#description-error').style.display = 'block';
      if (isValid) descInput.focus();
      isValid = false;
    } else {
      container.querySelector('#description-error').style.display = 'none';
    }

    if (!isValid) return;

    // Build report payload
    const reportData = {
      category: selectedCategory,
      location: locValue,
      coordinates: pinCoordinates,
      description: descValue,
      photoUrl: uploadedPhotoUrl || null,
      title: `${selectedCategory} near ${locValue}`,
    };

    // Step: Trigger AI Duplicate Detection Modal
    showDuplicateDetectionModal({
      reportData,
      onConfirmSubmission: (confirmedReport) => {
        // Save to store and credit +10 Civic Coins
        const saved = store.recordSubmission(confirmedReport);
        // Show success modal
        showSubmissionSuccessModal(saved);
      },
      onCancel: () => {
        // User chose to edit their report
      },
    });
  });
}
