import API_BASE from "../utils/api.js";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Could not load admin analytics.");
      setData(result);
    } catch (err) { setError(err.message || "Could not load admin analytics."); }
    finally { setBusy(false); }
  }, [token]);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const inspectUser = async (entry) => {
    setSelectedUser(entry);
    setUserData(null);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${entry.id}/data`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Could not load user data.");
      setUserData(result);
    } catch (err) { setError(err.message || "Could not load user data."); }
  };

  if (loading) return <main className="mx-auto max-w-6xl p-8 text-slate-600">Checking access…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold text-slate-900">Admin access only</h1><p className="mt-2 text-slate-600">This account is not configured as the ResumeLens administrator.</p><Link className="mt-4 inline-block text-violet-700 underline" to="/dashboard">Return to dashboard</Link></main>;

  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-violet-600">ResumeLens</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Admin analytics</h1><p className="mt-2 text-slate-600">Account totals, recent activity, and saved user data.</p></div><button onClick={loadOverview} disabled={busy} className="rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{busy ? "Refreshing…" : "Refresh data"}</button></div>
    {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-7 grid gap-4 sm:grid-cols-3">{[["Registered users", data?.stats.total_users], ["Saved data items", data?.stats.saved_items], ["Activity events", data?.stats.activity_events]].map(([label, value]) => <article key={label} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value ?? "—"}</p></article>)}</section>
    <section className="mt-8 grid gap-6 xl:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Registered accounts</h2><p className="text-sm text-slate-500">Select a user to inspect their saved ResumeLens data.</p></div><div className="max-h-[520px] overflow-auto">{(data?.users || []).map(entry => <button key={entry.id} onClick={() => inspectUser(entry)} className={`block w-full border-b border-slate-100 px-5 py-4 text-left hover:bg-violet-50 ${selectedUser?.id === entry.id ? "bg-violet-50" : ""}`}><span className="block font-semibold text-slate-800">{entry.name}</span><span className="block text-sm text-slate-500">{entry.email}</span><span className="mt-1 block text-xs text-slate-500">{entry.saved_items} saved items · joined {entry.created_at ? new Date(entry.created_at).toLocaleString() : "date unavailable"}</span></button>)}{!data?.users?.length && <p className="p-5 text-sm text-slate-500">No registered accounts yet.</p>}</div></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Recent activity</h2><p className="text-sm text-slate-500">Sign-ins, page views, and feature events.</p></div><div className="max-h-[520px] overflow-auto">{(data?.activity || []).map(event => <div key={event.id} className="border-b border-slate-100 px-5 py-3"><p className="font-medium text-slate-800">{event.event.replaceAll("_", " ")}</p><p className="text-sm text-slate-500">{event.name} · {event.page || "No page recorded"}</p><p className="text-xs text-slate-400">{event.created_at ? new Date(event.created_at).toLocaleString() : ""}</p></div>)}{!data?.activity?.length && <p className="p-5 text-sm text-slate-500">No activity recorded yet.</p>}</div></div></section>
    {selectedUser && <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Saved data: {selectedUser.name}</h2><p className="text-sm text-slate-500">Resume and career information can be sensitive; view only when needed for administration.</p>{!userData ? <p className="mt-4 text-sm text-slate-500">Loading saved data…</p> : <div className="mt-4 space-y-3">{userData.items.map(item => <details key={item.key} className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer font-semibold text-slate-700">{item.key} <span className="font-normal text-slate-400">· updated {new Date(item.updated_at).toLocaleString()}</span></summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{(() => { try { return JSON.stringify(JSON.parse(item.value), null, 2); } catch { return item.value; } })()}</pre></details>)}{!userData.items.length && <p className="text-sm text-slate-500">No saved items for this account yet.</p>}</div>}</section>}
  </main>;
}

export default AdminDashboard;
