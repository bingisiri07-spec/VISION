/**
 * storage.js
 * Persistent storage manager for VISION.
 * Ensures guest users and authenticated users have isolated, reliable state persistence.
 * - Guest workflow state is maintained in sessionStorage (with localStorage mirroring)
 * - Authenticated user state is isolated by user ID
 */

const GUEST_STORAGE_KEY = 'vision_guest_workflow_state_v1';
const LEGACY_STORAGE_KEY = 'vision_platform_state_v1';
const USER_STORAGE_PREFIX = 'vision_user_state_';

export const initialProjectState = {
  projectId: null,
  startupName: '',
  title: '',
  lastActiveStage: 'Overview',
  problem: null,
  ideas: [],
  selectedIdea: null,
  journeyStarted: false,
  journeyStartedAt: null,
  roadmap: null,
  budget: {
    availableBudget: 150000,
    expectedExpenses: 120000,
    runwayMonths: 3,
    teamSize: 1,
    timeAvailableHoursPerWeek: 20,
    essentialExpenses: [],
    optionalExpenses: [],
    allocations: [],
  },
  decisions: [],
  tasks: [],
  notes: [],
  competitorAnalysis: null,
  chatHistory: [
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your VISION Co-Pilot. As you describe your problem, select an idea, and build your roadmap, I will use your exact project context to advise your next strategic moves.",
      timestamp: new Date().toISOString(),
    }
  ],
  apiKey: '',
};

/**
 * Load saved state based on current user context (userId if logged in, null if guest)
 */
export function loadSavedState(userId = null) {
  try {
    if (userId) {
      const userRaw = localStorage.getItem(`${USER_STORAGE_PREFIX}${userId}`);
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        return { ...initialProjectState, ...parsed };
      }
      return initialProjectState;
    }

    // Guest user state: check sessionStorage first, then localStorage guest key, then legacy fallback
    let guestRaw = null;
    try {
      guestRaw = sessionStorage.getItem(GUEST_STORAGE_KEY);
    } catch (e) {
      // sessionStorage unavailable
    }

    if (!guestRaw) {
      guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
    }

    if (!guestRaw) {
      guestRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!guestRaw) return initialProjectState;

    const parsed = JSON.parse(guestRaw);
    return { ...initialProjectState, ...parsed };
  } catch (err) {
    console.error("Failed to load state from storage:", err);
    return initialProjectState;
  }
}

/**
 * Save state based on current user context (userId if logged in, null if guest)
 */
export function saveState(state, userId = null) {
  if (!state) return;
  try {
    const serialized = JSON.stringify(state);
    if (userId) {
      localStorage.setItem(`${USER_STORAGE_PREFIX}${userId}`, serialized);
    } else {
      // Save for guest in both sessionStorage and localStorage guest key to prevent data loss on tab reload
      try {
        sessionStorage.setItem(GUEST_STORAGE_KEY, serialized);
      } catch (e) {
        // sessionStorage might fail in rare quota limits
      }
      localStorage.setItem(GUEST_STORAGE_KEY, serialized);
    }
  } catch (err) {
    console.error("Failed to save state to storage:", err);
  }
}

/**
 * Clears temporary guest state (called after successfully saving venture to cloud)
 */
export function clearGuestState() {
  try {
    try {
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (e) {}
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear guest storage:", err);
  }
}

/**
 * Returns raw guest state if present
 */
export function getGuestState() {
  try {
    let raw = null;
    try {
      raw = sessionStorage.getItem(GUEST_STORAGE_KEY);
    } catch (e) {}
    if (!raw) raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function resetProjectState(userId = null) {
  try {
    if (userId) {
      localStorage.removeItem(`${USER_STORAGE_PREFIX}${userId}`);
    } else {
      clearGuestState();
    }
  } catch (err) {
    console.error("Failed to reset project storage:", err);
  }
  return initialProjectState;
}
