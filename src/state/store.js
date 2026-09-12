/**
 * CivicQuest User State Store
 * Manages user profile, Civic Coins balance, impact statistics, and recent activity.
 * Supports reactive subscriptions so UI components automatically update.
 */

const STORAGE_KEY = 'civicquest_user_state_v1';

const defaultState = {
  user: {
    name: 'Alex Stone',
    handle: '@alex_civic',
    avatar: 'AS',
    level: 7,
    badge: 'Civic Champion',
    neighborhood: 'Maplewood, Portland',
    crew: 'Maplewood crew',
    crewRank: 2,
  },
  // Gamified currency: Civic Coins (CC)
  civicCoins: 1240,
  xp: 2840,
  nextLevelXp: 3500,

  // Civic Impact summary metrics
  impact: {
    issuesReported: 14,
    issuesResolved: 11,
    treesFunded: 6,
  },

  // Chronological activity stream
  recentActivity: [
    {
      id: 'act-1',
      type: 'report_verified',
      icon: '✓',
      title: 'Pothole report verified',
      location: 'Maple Ave & 23rd St',
      time: 'Today, 9:42 AM',
      points: '+50 CC',
      status: 'Verified',
    },
    {
      id: 'act-2',
      type: 'badge_unlocked',
      icon: '✧',
      title: 'Badge unlocked: Eyes on the Ground',
      location: 'Maplewood District',
      time: 'Yesterday',
      points: '+100 CC',
      status: 'Awarded',
    },
    {
      id: 'act-3',
      type: 'crew_mission',
      icon: '♧',
      title: 'Joined Maplewood crew clean-up',
      location: 'Fremont Park',
      time: '2 days ago',
      points: '+200 CC',
      status: 'Completed',
    },
  ],

  // Submitted reports
  reports: [
    {
      id: 'CQ-2026-7819',
      category: 'Pothole',
      title: 'Severe Pothole on Maple Ave near 23rd St',
      location: 'Maple Ave & 23rd St',
      coordinates: { lat: 45.5152, lng: -122.6784 },
      status: 'In Review',
      reportedAt: 'Yesterday, 3:15 PM',
      upvotes: 12,
      description: 'Deep asphalt depression causing vehicles to swerve near the crosswalk.',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'CQ-2026-7241',
      category: 'Broken Streetlight',
      title: 'Dark intersection light blinking erratically',
      location: 'Fremont St & 14th Ave',
      coordinates: { lat: 45.5190, lng: -122.6710 },
      status: 'Reported',
      reportedAt: '3 days ago',
      upvotes: 5,
      description: 'Light flickers at night making the pedestrian crossing dangerous.',
      photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    },
  ],
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
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
    const issueId = report.id || `CQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
   * Reset data to defaults (useful for testing and reset buttons)
   */
  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this._saveState();
  }
}

export const store = new Store();
