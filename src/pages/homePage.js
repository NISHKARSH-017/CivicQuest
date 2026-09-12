/**
 * Citizen Home / Dashboard Page Component
 * Displays user profile, Civic Coins balance, Level 7 Civic Champion badge,
 * 4 Quick Action cards, Civic Impact summary metrics, Recent Activity,
 * 3D Antigravity City, and local neighborhood issues map.
 */

import { router } from '../router.js';
import { store } from '../state/store.js';
import { initCity3D } from '../components/city3d.js';
import { showReportDetailModal } from '../components/reportDetailModal.js';

export function renderHomePage(container) {
  const state = store.getState();

  container.innerHTML = `
    <div class="wrap home-dashboard-wrap">
      <!-- 1. Welcome & Primary Action Banner -->
      <section class="welcome dashboard-welcome">
        <div>
          <small class="today-date">TODAY IN VELLORE, TAMIL NADU</small>
          <h1>Hello! ${state.user.name.split(' ')[0]} <em>✦</em></h1>
          <p>You are a <strong class="badge-highlight">${state.user.badge}</strong>. Small local actions make a big neighborhood difference.</p>
        </div>
        <button class="btn btn-primary hero-report-btn" id="hero-report-btn">
          ＋ Report an Issue <kbd>R</kbd>
        </button>
      </section>

      <!-- 2. User Stats & Civic Coins Balance -->
      <section class="stats dashboard-stats">
        <article class="stat-card stat-coins">
          <b class="stat-icon-coin">✦</b>
          <span>
            <small>CIVIC COINS BALANCE</small>
            <strong id="dashboard-coins">${state.civicCoins.toLocaleString()} <span class="currency-unit">CC</span></strong>
            <small class="green">↑ +10 CC per verified report</small>
          </span>
        </article>

        <article class="stat-card stat-level">
          <b>✧</b>
          <span>
            <small>CURRENT LEVEL & BADGE</small>
            <strong>Lvl ${state.user.level} · <span class="badge-title">${state.user.badge}</span></strong>
            <small class="green">${state.xp.toLocaleString()} / ${state.nextLevelXp.toLocaleString()} XP</small>
          </span>
        </article>

        <article class="stat-card stat-rank">
          <b>♧</b>
          <span>
            <small>COMMUNITY RANK</small>
            <strong>#${state.user.crewRank} <small>in ${state.user.crew}</small></strong>
            <small class="green">↑ Top 5% this week</small>
          </span>
        </article>

        <article class="stat-card stat-impact-preview">
          <b>♢</b>
          <span>
            <small>IMPACT REWARDS</small>
            <strong>${state.impact.treesFunded} Trees <small>Funded</small></strong>
            <small class="green link-hint" id="link-to-wallet">Open Wallet →</small>
          </span>
        </article>
      </section>

      <!-- 3. Quick Action Cards (User requested: Report Issue, Missions, Leaderboard, Impact Wallet) -->
      <section class="quick-actions-section">
        <div class="quick-actions-header">
          <h2>Quick Actions</h2>
          <small>Pick a civic task or view your community standings</small>
        </div>

        <div class="quick-actions-grid">
          <!-- Action 1: Report an Issue -->
          <div class="quick-action-card action-report" id="qa-report">
            <div class="qa-top">
              <span class="qa-icon">＋</span>
              <span class="qa-badge highlight">+10 CC</span>
            </div>
            <h3>Report an Issue</h3>
            <p>Spot potholes, trash, leaks, or dark lights. AI scans for duplicates instantly.</p>
            <span class="qa-arrow">Launch Form →</span>
          </div>

          <!-- Action 2: Missions -->
          <div class="quick-action-card action-missions" id="qa-missions">
            <div class="qa-top">
              <span class="qa-icon">◒</span>
              <span class="qa-badge">3 Active</span>
            </div>
            <h3>Missions</h3>
            <p>Join crew neighborhood clean-ups, photo-walks, and seasonal challenges.</p>
            <span class="qa-arrow">View Missions →</span>
          </div>

          <!-- Action 3: Leaderboard -->
          <div class="quick-action-card action-leaderboard" id="qa-leaderboard">
            <div class="qa-top">
              <span class="qa-icon">🏆</span>
              <span class="qa-badge">#2 Crew</span>
            </div>
            <h3>Leaderboard</h3>
            <p>See Maplewood rankings, top citizen contributors, and block streaks.</p>
            <span class="qa-arrow">View Standings →</span>
          </div>

          <!-- Action 4: Impact Wallet -->
          <div class="quick-action-card action-wallet" id="qa-wallet">
            <div class="qa-top">
              <span class="qa-icon">♢</span>
              <span class="qa-badge">${state.civicCoins} CC</span>
            </div>
            <h3>Impact Wallet</h3>
            <p>Redeem Civic Coins for tree planting, transit vouchers, and local coffee.</p>
            <span class="qa-arrow">Open Wallet →</span>
          </div>
        </div>
      </section>

      <!-- 4. Civic Impact Summary Cards -->
      <section class="panel impact-summary-panel">
        <div class="heading">
          <span>
            <h2>Civic Impact Summary</h2>
            <p>Real-world municipal improvements driven by your reports</p>
          </span>
          <span class="impact-badge-pill">Verified Citizen Impact</span>
        </div>

        <div class="impact-metrics-grid">
          <div class="impact-metric-box">
            <div class="metric-icon">📢</div>
            <strong id="impact-reported">${state.impact.issuesReported}</strong>
            <small>Issues Reported</small>
            <span class="metric-sub">Across Maplewood & Fremont</span>
          </div>

          <div class="impact-metric-box">
            <div class="metric-icon">✅</div>
            <strong id="impact-resolved">${state.impact.issuesResolved}</strong>
            <small>Issues Resolved</small>
            <span class="metric-sub">78% resolution rate</span>
          </div>

          <div class="impact-metric-box">
            <div class="metric-icon">🌱</div>
            <strong id="impact-trees">${state.impact.treesFunded}</strong>
            <small>Trees Funded</small>
            <span class="metric-sub">Via Civic Coin redemptions</span>
          </div>
        </div>
      </section>

      <!-- 5. 3D Antigravity City Feature Scene -->
      <section class="antigravity panel">
        <div class="scene-copy">
          <small>ANTIGRAVITY CITY · VELLORE DISTRICT</small>
          <h2>Turn good deeds<br>into <span>real change.</span></h2>
          <p>Interactive 3D simulation of civic activity, public infrastructure, and active missions.</p>
          <button id="launch-3d" class="btn btn-secondary">✦ Enter 3D View</button>
        </div>
        <canvas id="city3d" aria-label="Interactive 3D antigravity city"></canvas>
        <div class="orbit-label label-a">+50 <small>REPORT</small></div>
        <div class="orbit-label label-b">+100 <small>MISSION</small></div>
        <div class="scene-hint">DRAG TO EXPLORE · SCROLL TO ZOOM</div>
      </section>

      <!-- 6. Local Issues Map & Level Progress Columns -->
      <div class="columns">
        <section class="panel map-panel">
          <div class="heading">
            <span>
              <h2>Issues near you</h2>
              <p>Active community hazard markers in Maplewood</p>
            </span>
            <button class="btn btn-secondary" id="btn-filter-map">☷ Filters <i>3</i></button>
          </div>
          <div class="map" id="home-map">
            <div class="grid-lines"></div>
            <span class="road road-a"></span>
            <span class="road road-b"></span>
            <span class="road road-c"></span>
            <button class="map-pin orange" style="left:24%;top:39%" data-issue-id="CQ-2026-7819" title="Pothole on Maple Ave">●</button>
            <button class="map-pin blue" style="left:68%;top:23%" data-issue-id="CQ-2026-7241" title="Broken streetlight">●</button>
            <button class="map-pin orange" style="left:46%;top:69%" title="Overflowing trash bin">●</button>
            <button class="map-pin green" style="left:78%;top:54%" title="Resolved curb damage">✓</button>
            <small class="map-name">MAPLE AVE</small>
            <small class="map-name two">FREMONT ST</small>
          </div>
          <footer>
            <span><b>24</b> active civic issues in your area</span>
            <a href="#/report" id="link-report-map">+ Report an issue nearby →</a>
          </footer>
        </section>

        <div class="right">
          <section class="panel progress">
            <div class="heading">
              <span>
                <h2>Level progress</h2>
                <p>Keep going, Civic Champion!</p>
              </span>
              <b>LVL ${state.user.level}</b>
            </div>
            <div class="level">
              <strong>${state.user.level}</strong>
              <span>
                <i></i>
                <small>${state.xp.toLocaleString()} pts <em>${state.nextLevelXp.toLocaleString()} pts</em></small>
              </span>
              <strong>${state.user.level + 1}</strong>
            </div>
            <div class="reward">
              ♢ <span><strong>Next reward: $5 local coffee voucher</strong><small>660 pts to unlock</small></span>→
            </div>
          </section>

          <section class="panel missions">
            <div class="heading">
              <span>
                <h2>Quick missions</h2>
                <p>Earn Civic Coins while helping out</p>
              </span>
              <b>•••</b>
            </div>
            <button class="mission-item-btn" data-mission="report">
              <b>▣</b>
              <span><strong>Report a civic issue</strong><small>Verified report</small></span>
              <em>+10 CC ›</em>
            </button>
            <button class="mission-item-btn" data-mission="walk">
              <b>♧</b>
              <span><strong>Walk & spot sidewalk safety</strong><small>15 min community scan</small></span>
              <em>+50 CC ›</em>
            </button>
            <button class="mission-item-btn" data-mission="invite">
              <b>♧</b>
              <span><strong>Invite a neighbor to Maplewood crew</strong><small>Grow your crew</small></span>
              <em>+100 CC ›</em>
            </button>
            <a href="#/missions" class="see-all-missions">See all missions →</a>
          </section>
        </div>
      </div>

      <!-- 7. Bottom Grid: Recent Activity & Crew Leaderboard Preview -->
      <div class="bottom-grid">
        <!-- Recent Activity Feed -->
        <section class="panel activity">
          <div class="heading">
            <span>
              <h2>Recent activity</h2>
              <p>Your civic submissions and earned rewards</p>
            </span>
            <button class="btn btn-secondary">This week ⌄</button>
          </div>

          <div class="activity-list" id="activity-feed">
            ${state.recentActivity.map((act) => `
              <div class="activity-row ${act.reportId ? 'clickable-activity' : ''}" data-report-id="${act.reportId || ''}">
                <span class="act-icon">${act.icon}</span>
                <div class="act-info">
                  <strong>${act.title}</strong>
                  <small>${act.location} · ${act.time}</small>
                </div>
                <b class="act-points">${act.points}</b>
              </div>
            `).join('')}
          </div>
          <a href="#/report" class="view-all-link">Submit a new report →</a>
        </section>

        <!-- Neighborhood Leaderboard Preview -->
        <section class="panel leaderboard">
          <div class="heading">
            <span>
              <h2>Neighborhood leaderboard</h2>
              <p>Vellore crew is on a roll 🔥</p>
            </span>
            <a href="#/leaderboard" class="view-lead-link">View all →</a>
          </div>
          <p>1　🟠　<strong>Jordan Miller</strong><b>3,420 CC</b></p>
          <p>2　🟢　<strong>Sam Kim</strong><b>3,110 CC</b></p>
          <p class="you">3　🟣　<strong>You <small>YOU</small></strong><b>${state.civicCoins.toLocaleString()} CC</b></p>
          <footer>↗ <b>+6 places</b> since last week in Portland</footer>
        </section>
      </div>
    </div>
  `;

  // --- WIRING & EVENT HANDLERS ---

  // Hero Report Button
  container.querySelector('#hero-report-btn').addEventListener('click', () => {
    router.navigate('report');
  });

  // Quick Action: Report an Issue
  container.querySelector('#qa-report').addEventListener('click', () => {
    router.navigate('report');
  });

  // Quick Action: Missions (Teammate page)
  container.querySelector('#qa-missions').addEventListener('click', () => {
    router.navigate('missions');
  });

  // Quick Action: Leaderboard (Teammate page)
  container.querySelector('#qa-leaderboard').addEventListener('click', () => {
    router.navigate('leaderboard');
  });

  // Quick Action: Impact Wallet (Teammate page)
  container.querySelector('#qa-wallet').addEventListener('click', () => {
    router.navigate('wallet');
  });

  const walletLink = container.querySelector('#link-to-wallet');
  if (walletLink) {
    walletLink.addEventListener('click', () => router.navigate('wallet'));
  }

  // Quick mission buttons
  container.querySelectorAll('.mission-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-mission');
      if (type === 'report') router.navigate('report');
      else router.navigate('missions');
    });
  });

  // Clickable activity items
  container.querySelectorAll('.clickable-activity').forEach((row) => {
    row.addEventListener('click', () => {
      const reportId = row.getAttribute('data-report-id');
      const report = state.reports.find((r) => r.id === reportId);
      if (report) {
        showReportDetailModal(report);
      }
    });
  });

  // Map pin clicks
  container.querySelectorAll('.map-pin').forEach((pin) => {
    pin.addEventListener('click', () => {
      const issueId = pin.getAttribute('data-issue-id');
      if (issueId) {
        const report = state.reports.find((r) => r.id === issueId);
        if (report) showReportDetailModal(report);
      }
    });
  });

  // 3D Antigravity Canvas Initialization
  const canvas = container.querySelector('#city3d');
  if (canvas) {
    initCity3D(canvas);
  }

  const launchBtn = container.querySelector('#launch-3d');
  if (launchBtn && canvas) {
    launchBtn.addEventListener('click', () => {
      canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
      canvas.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }],
        { duration: 700 }
      );
    });
  }

  // 3D Panel Tilt on Mouse Move (preserves teammate interaction)
  container.querySelectorAll('.panel').forEach((panel) => {
    panel.addEventListener('pointermove', (event) => {
      const box = panel.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - 0.5) * 5;
      const y = ((event.clientY - box.top) / box.height - 0.5) * -5;
      panel.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`;
    });
    panel.addEventListener('pointerleave', () => {
      panel.style.transform = '';
    });
  });
}
