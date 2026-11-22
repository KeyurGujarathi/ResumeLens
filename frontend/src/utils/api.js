const configuredBase = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

function resolveApiBase() {
  if (configuredBase) return configuredBase;

  if (import.meta.env.DEV) {
    const { hostname, protocol } = window.location;
    return `${protocol}//${hostname}:8000`;
  }

  return "https://resumelens-zmh3.onrender.com";
}

const API_BASE = resolveApiBase();

export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("resumelens_auth_token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default API_BASE;