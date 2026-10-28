import API_BASE from "../utils/api.js";
import { useState } from "react";

function BulletChecker({ bullet }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeBullet = async () => {
    const cleanedBullet = bullet.trim();

    if (!cleanedBullet) {
      setError("Write a bullet first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/bullets/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bullet: cleanedBullet,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Bullet analysis failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setError(
        "Could not analyze the bullet. Make sure the ResumeLens backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getFindingStyle = (type) => {
    switch (type) {
      case "weak_opener":
        return {
          label: "Weak Opener",
          icon: "⚠",
          className:
            "border-amber-500/30 bg-amber-500/10 text-amber-300",
        };

      case "missing_metric":
        return {
          label: "Missing Metric",
          icon: "📊",
          className:
            "border-blue-500/30 bg-blue-500/10 text-blue-300",
        };

      case "missing_action":
        return {
          label: "Missing Action",
          icon: "→",
          className:
            "border-rose-500/30 bg-rose-500/10 text-rose-300",
        };

      default:
        return {
          label: "Suggestion",
          icon: "•",
          className:
            "border-slate-500/30 bg-slate-500/10 text-slate-300",
        };
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={analyzeBullet}
        disabled={loading}
        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Bullet"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-rose-400">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bullet Analysis
            </p>

            {result.findings?.length === 0 && (
              <span className="text-xs font-semibold text-emerald-400">
                Looks good
              </span>
            )}
          </div>

          {result.findings?.length > 0 ? (
            <div className="space-y-2">
              {result.findings.map((finding, index) => {
                const style = getFindingStyle(finding.type);

                return (
                  <div
                    key={`${finding.type}-${index}`}
                    className={`rounded-lg border px-3 py-2 ${style.className}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">
                        {style.icon}
                      </span>

                      <div>
                        <p className="text-xs font-semibold">
                          {style.label}
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          {finding.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs leading-5 text-slate-300">
              This bullet does not have any major issues detected by
              ResumeLens.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BulletChecker;
