let saved = null;
function createEmptyState() {
  const now = new Date().toISOString();
  return {
    version: 9,
    profile: null,
    subjects: [],
    goals: [],
    dailyActivity: {},
    testAttempts: [],
    studySessions: [],
    exams: [],
    planner: { date: now.slice(0,10), availableMinutes: 120, completedTaskIds: [], updatedAt: now },
    activeFocus: null,
    flashcardProgress: {},
    achievements: {},
    notes: [],
    notifications: [],
    notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now },
    createdAt: now,
    updatedAt: now,
  };
}
const storage = {
  load() { return saved ? structuredClone(saved) : createEmptyState(); },
  save(state) { saved = structuredClone(state); },
  clear() { saved = null; },
  __seed(state) { saved = structuredClone(state); },
  __peek() { return saved ? structuredClone(saved) : null; },
};
module.exports = { createEmptyState, storage };
