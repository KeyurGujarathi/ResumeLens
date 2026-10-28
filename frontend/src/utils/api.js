// Central API URL resolver. Set VITE_API_BASE_URL for a separately hosted backend.
// In local development, using the same hostname lets phones on the same Wi-Fi reach the API.
const configuredBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

function resolveApiBase() {
  if (configuredBase) return configuredBase;
  if (typeof window === "undefined") return "http://127.0.0.1:8000";

  const { hostname, protocol, port } = window.location;
  const isViteDev = port === "5173" || port === "5174";
  if (isViteDev) return `${protocol}//${hostname}:8000`;

  // When frontend and backend are deployed behind the same domain/reverse proxy.
  return "";
}

const API_BASE = resolveApiBase();
export default API_BASE;
