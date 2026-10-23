/**
 * storage.js
 * Persistent LocalStorage manager for VISION.
 * Ensures user does not lose progress across page reloads.
 * Structured cleanly to easily sync to Supabase when connected.
 */

const STORAGE_KEY = 'vision_platform_state_v1';

export const initialProjectState = {
  problem: null,
  ideas: [],
  selectedIdea: null,
  journeyStarted: false,
  journeyStartedAt: null,
  roadmap: [],
  budget: {
    availableBudget: 1500,
    expectedExpenses: 1200,
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

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProjectState;
    const parsed = JSON.parse(raw);
    return { ...initialProjectState, ...parsed };
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
    return initialProjectState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function resetProjectState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear localStorage:", err);
  }
  return initialProjectState;
}
