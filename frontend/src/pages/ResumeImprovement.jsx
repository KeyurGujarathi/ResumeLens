import API_BASE from "../utils/api.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


const findingGuidance = {
  weak_opener: {
    title: "Use a stronger opening",
    description:
      "Start the bullet with a clear action verb that shows what you actually did.",
    example:
      "Built, developed, designed, implemented, automated, optimized, analyzed",
  },

  missing_metric: {
    title: "Add a measurable result",
    description:
      "Add numbers, scale, time, performance improvement, quantity, or another concrete result.",
    example:
      "Reduced processing time by 30%, handled 500+ records, completed in 3 weeks",
  },

  missing_action: {
    title: "Show clear action",
    description:
      "Make the bullet describe a specific action you performed instead of only mentioning a technology or project.",
    example:
      "Developed an ESP32-based monitoring system using sensors and Wi-Fi",
  },
};

function getGuidance(type) {
  return (
    findingGuidance[type] || {
      title: "Strengthen this bullet",
      description:
        "Make the statement more specific, action-oriented, and focused on your contribution.",
      example:
        "Use a strong action verb and include the technology, task, and measurable result where possible.",
    }
  );
}

function FindingCard({ finding }) {
  const guidance = getGuidance(finding.type);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-400">
          !
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
            {finding.type.replaceAll("_", " ")}
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            {guidance.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {finding.message}
          </p>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              How to improve
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {guidance.description}
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Example ideas:{" "}
              <span className="text-slate-400">
                {guidance.example}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeImprovement() {
  const navigate = useNavigate();

  const [bullet, setBullet] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedBullet = localStorage.getItem(
      "resumelens_improvement_bullet"
    );

    const savedResult = localStorage.getItem(
      "resumelens_improvement_result"
    );

    if (savedBullet) {
      setBullet(savedBullet);
    }

    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (err) {
        console.error(
          "Saved improvement result parsing failed:",
          err
        );
      }
    }
  }, []);

  const analyzeBullet = async () => {
    setError("");
    setResult(null);

    const cleanedBullet = bullet.trim();

    if (!cleanedBullet) {
      setError("Please enter a resume bullet first.");
      return;
    }

    setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Bullet analysis failed."
        );
      }

      setResult(data);

      localStorage.setItem(
        "resumelens_improvement_bullet",
        cleanedBullet
      );

      localStorage.setItem(
        "resumelens_improvement_result",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        "Resume improvement error:",
        err
      );

      setError(
        err.message ||
          "Unable to analyze the resume bullet."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setBullet("");
    setResult(null);
    setError("");

    localStorage.removeItem(
      "resumelens_improvement_bullet"
    );

    localStorage.removeItem(
      "resumelens_improvement_result"
    );
  };

  const findingCount = result?.findings?.length || 0;

  const resultMessage = useMemo(() => {
    if (!result) {
      return "";
    }

    if (findingCount === 0) {
      return "No improvement issues were detected by the current ResumeLens checks.";
    }

    if (findingCount === 1) {
      return "One improvement area was detected in this bullet.";
    }

    return `${findingCount} improvement areas were detected in this bullet.`;
  }, [result, findingCount]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Resume Improvement
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Check individual resume bullets for weak openings,
            missing measurable results, unclear actions, and
            other issues that can make your experience harder
            to understand.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Bullet Analyzer
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Improve one resume bullet
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Paste one bullet from your resume and ResumeLens
              will identify areas that could be strengthened.
            </p>
          </div>

          <textarea
            value={bullet}
            onChange={(event) =>
              setBullet(event.target.value)
            }
            placeholder="Example: Worked on projects using Python and ESP32"
            rows={6}
            className="mt-6 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={analyzeBullet}
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Bullet"}
            </button>

            <button
              type="button"
              onClick={clearAnalysis}
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-sm font-medium text-cyan-400">
                Analysis Result
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Your bullet
              </h2>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm leading-7 text-slate-300">
                  {result.bullet}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  {resultMessage}
                </p>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    findingCount === 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {findingCount === 0
                    ? "Looks good"
                    : `${findingCount} issue${
                        findingCount === 1
                          ? ""
                          : "s"
                      } found`}
                </div>
              </div>
            </div>

            {findingCount > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">
                    What to improve
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Use these findings to make your bullet
                    more specific and impactful.
                  </p>
                </div>

                <div className="space-y-4">
                  {result.findings.map(
                    (finding, index) => (
                      <FindingCard
                        key={`${finding.type}-${index}`}
                        finding={finding}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <p className="text-sm font-medium text-cyan-400">
                Strong Bullet Formula
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Action + What you did + Technology + Result
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                A strong resume bullet should make your
                contribution clear. Start with an action,
                explain the work you performed, mention useful
                technologies, and add a measurable result when
                available.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm font-medium text-slate-300">
                  Example structure
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  <span className="text-cyan-400">
                    Developed
                  </span>{" "}
                  an ESP32-based monitoring system using
                  sensors and Wi-Fi,{" "}
                  <span className="text-cyan-400">
                    reducing manual monitoring effort by 40%
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate("/resume-analyzer")
                }
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Back to Resume Analyzer
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/career-roadmap")
                }
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Open Career Roadmap
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ResumeImprovement;