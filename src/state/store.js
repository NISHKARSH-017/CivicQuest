/**
 * CivicQuest User State Store
 * Manages user profile, Civic Coins balance, impact statistics, and recent activity.
 * Supports reactive subscriptions so UI components automatically update.
 */

const STORAGE_KEY = 'civicquest_user_state_v1';

const defaultState = {
  user: {
    name: 'Civic Citizen',
    handle: '@citizen',
    avatar: 'CC',
    level: 1,
    badge: 'New Citizen',
    neighborhood: 'Your City',
    crew: 'Community',
    crewRank: 0,
  },

  civicCoins: 0,
  xp: 0,
  nextLevelXp: 500,

  impact: {
    issuesReported: 0,
    issuesResolved: 0,
    treesFunded: 0,
  },

  recentActivity: [],

  reports: [],
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this._loadState();
  }

  _loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultState, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Unable to load state from localStorage:', e);
    }

    return JSON.parse(JSON.stringify(defaultState));
  }

  _saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.state)
        );
      }
    } catch (e) {
      console.warn('Unable to persist state to localStorage:', e);
    }

    this._notify();
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);

    // Call immediately with current state
    listener(this.state);

    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  /**
   * Award Civic Coins to the citizen
   * @param {number} amount
   * @param {string} reason
   */
  addCoins(amount = 10, reason = 'Issue Reported') {
    this.state.civicCoins += amount;
    this.state.xp += amount * 5;
    this._saveState();
  }

  /**
   * Record a newly submitted issue and award +10 Civic Coins
   * @param {Object} report
   * @returns {Object} savedReport
   */
  recordSubmission(report) {
    const issueId =
      report.id ||
      `CQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport = {
      ...report,
      id: issueId,
      status: 'Reported',
      reportedAt: 'Just now',
      upvotes: 1,
    };

    // Add report to store
    this.state.reports.unshift(newReport);

    // Update impact statistics
    this.state.impact.issuesReported += 1;

    // Award +10 Civic Coins
    this.state.civicCoins += 10;
    this.state.xp += 50;

    // Add entry to recent activity
    this.state.recentActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'report_submitted',
      icon: '＋',
      title: `${newReport.category} reported`,
      location: newReport.location,
      time: 'Just now',
      points: '+10 CC',
      status: 'Reported',
      reportId: issueId,
    });

    this._saveState();

    return newReport;
  }

  /**
   * Reset data to defaults
   * Useful for testing and reset buttons
   */
  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this._saveState();
  }
}

export const store = new Store();
