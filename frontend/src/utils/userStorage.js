import API_BASE from "./api.js";
const ACTIVE_USER_ID_KEY = "resumelens_user_id";
const AUTH_TOKEN_KEY = "resumelens_auth_token";

const LEGACY_KEYS = [
  "resumelens_resume_analysis", "resumelens_career_profile",
  "resumelens_resume_skills", "resumelens_company_fit",
  "resumelens_improvement_result", "resumelens_improvement_bullet",
  "resumelens_resume_builder", "careerSkillGap", "resumelens_skill_progress",
];
const LEGACY_PREFIXES = ["resumelens_placement_progress_", "resumelens_placement_quiz_"];
const isAppDataKey = (key, userId) => LEGACY_KEYS.includes(key) || LEGACY_PREFIXES.some(p => key.startsWith(p)) || key.startsWith(`resumelens_user_${userId}_`);

function getActiveUserId() { return localStorage.getItem(ACTIVE_USER_ID_KEY); }
function getUserStorageKey(key, userId = getActiveUserId()) { return userId ? `resumelens_user_${userId}_${key}` : null; }
function getUserItem(key) {
  const storageKey = getUserStorageKey(key);
  if (storageKey && localStorage.getItem(storageKey) !== null) return localStorage.getItem(storageKey);
  return localStorage.getItem(key);
}
function syncItem(key, value) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token || !key || key === AUTH_TOKEN_KEY || key === ACTIVE_USER_ID_KEY) return;
  fetch(`${API_BASE}/api/data`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) }).catch(() => {});
}
function setUserItem(key, value) {
  const storageKey = getUserStorageKey(key);
  if (!storageKey) return;
  localStorage.setItem(storageKey, value);
  localStorage.setItem(key, value);
  syncItem(key, value);
}
function removeUserItem(key) {
  const storageKey = getUserStorageKey(key);
  if (storageKey) localStorage.removeItem(storageKey);
  localStorage.removeItem(key);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && key) {
    fetch(`${API_BASE}/api/data/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}
function migrateLegacyUserData(userId) {
  if (!userId) return;
  localStorage.setItem(ACTIVE_USER_ID_KEY, String(userId));
  const keys = new Set(LEGACY_KEYS);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && LEGACY_PREFIXES.some(prefix => key.startsWith(prefix))) keys.add(key);
  }
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value === null) return;
    const destination = getUserStorageKey(key, String(userId));
    if (destination && localStorage.getItem(destination) === null) localStorage.setItem(destination, value);
    localStorage.removeItem(key);
  });
}
function clearActiveUser() { localStorage.removeItem(ACTIVE_USER_ID_KEY); }
function clearLegacyUserData() {
  for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && LEGACY_PREFIXES.some(prefix => key.startsWith(prefix))) localStorage.removeItem(key);
  }
}

async function pushLocalData(token, userId) {
  const prefix = `resumelens_user_${userId}_`;
  const items = new Map();
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (!storageKey || !isAppDataKey(storageKey, userId)) continue;
    if (storageKey.startsWith(prefix)) {
      const logicalKey = storageKey.slice(prefix.length);
      items.set(logicalKey, localStorage.getItem(storageKey));
    } else {
      items.set(storageKey, localStorage.getItem(storageKey));
    }
  }
  for (const [key, value] of items) {
    if (value === null) continue;
    await fetch(`${API_BASE}/api/data/import`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) });
  }
}

async function hydrateUserData(token, userId) {
  const response = await fetch(`${API_BASE}/api/data`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Unable to load saved account data.");
  const result = await response.json();
  const prefix = `resumelens_user_${userId}_`;
  // Clear old shared/legacy values first to prevent data appearing in another account.
  [...LEGACY_KEYS].forEach(key => localStorage.removeItem(key));
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && LEGACY_PREFIXES.some(p => key.startsWith(p))) localStorage.removeItem(key);
  }
  for (const item of result.items || []) {
    localStorage.setItem(`${prefix}${item.key}`, item.value);
    localStorage.setItem(item.key, item.value); // legacy pages still read these keys
  }
}

function startAutoSync(token, userId) {
  let previous = new Map();
  const syncNow = () => {
    if (localStorage.getItem(AUTH_TOKEN_KEY) !== token || getActiveUserId() !== String(userId)) return;
    const prefix = `resumelens_user_${userId}_`;
    const seen = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey || !isAppDataKey(storageKey, userId)) continue;
      let logicalKey = storageKey.startsWith(prefix) ? storageKey.slice(prefix.length) : storageKey;
      if (storageKey.startsWith(prefix) && localStorage.getItem(logicalKey) !== null) continue;
      if (seen.has(logicalKey)) continue;
      seen.add(logicalKey);
      const value = localStorage.getItem(storageKey);
      if (value === null || previous.get(logicalKey) === value) continue;
      previous.set(logicalKey, value);
      syncItem(logicalKey, value);
    }
  };
  syncNow();
  const interval = window.setInterval(syncNow, 2000);
  return () => window.clearInterval(interval);
}

async function logActivity(token, event, page = null) {
  if (!token) return;
  try {
    await fetch(`${API_BASE}/api/activity`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ event, page }) });
  } catch { /* Analytics must not block the app. */ }
}

export { ACTIVE_USER_ID_KEY, AUTH_TOKEN_KEY, getActiveUserId, getUserStorageKey, getUserItem, setUserItem, removeUserItem, migrateLegacyUserData, clearActiveUser, clearLegacyUserData, hydrateUserData, pushLocalData, startAutoSync, logActivity };
