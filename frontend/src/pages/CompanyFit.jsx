import API_BASE from "../utils/api.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


function StatCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function SkillCard({ skill }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{skill.skill}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {skill.category || "General"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            skill.has_skill
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {skill.has_skill ? "You have it" : "Skill gap"}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Company demand</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {skill.posting_count} postings
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Coverage</p>
          <p className="mt-1 text-lg font-semibold text-cyan-400">
            {skill.percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}

function CompanyFit() {
  const navigate = useNavigate();

  const [careerProfile, setCareerProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [companies, setCompanies] = useState([]);
 const [selectedCompany, setSelectedCompany] = useState(() => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("resumelens_company_fit") || "null"
    );

    return (
      localStorage.getItem("resumelens_company_fit_selected") ||
      saved?.company ||
      ""
    );
  } catch {
    return "";
  }
});

const [result, setResult] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("resumelens_company_fit") || "null"
    );
  } catch {
    return null;
  }
});

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "resumelens_career_profile"
    );

    const savedSkills = localStorage.getItem(
      "resumelens_resume_skills"
    );

    if (savedProfile) {
      try {
        setCareerProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error(
          "Career profile parsing failed:",
          err
        );
      }
    }

    if (savedSkills) {
      try {
        setSkills(JSON.parse(savedSkills));
      } catch (err) {
        console.error(
          "Resume skills parsing failed:",
          err
        );
      }
    }
  }, []);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/api/companies`
        );

        if (!response.ok) {
          throw new Error(
            "Could not load companies."
          );
        }

        const data = await response.json();

        setCompanies(
          Array.isArray(data) ? data : []
        );

        if (Array.isArray(data) && data.length > 0) {
          setSelectedCompany(data[0].name);
        }
      } catch (err) {
        console.error(
          "Company loading error:",
          err
        );

        setError(
          "Unable to load companies. Make sure the backend is running."
        );
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const careerInterests = useMemo(() => {
    if (
      !careerProfile ||
      !Array.isArray(
        careerProfile.career_interests
      )
    ) {
      return [];
    }

    return careerProfile.career_interests;
  }, [careerProfile]);

  const analyzeCompanyFit = async () => {
    setError("");
    setResult(null);

    if (!careerProfile) {
      setError(
        "Career profile not found. Please complete Career Focus first."
      );
      return;
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      setError(
        "Resume skills were not found. Please analyze your resume first."
      );
      return;
    }

    if (!careerInterests.length) {
      setError(
        "No career interests were selected. Please update your career profile."
      );
      return;
    }

    if (!selectedCompany) {
      setError(
        "Please select a company."
      );
      return;
    }

    setLoadingAnalysis(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/company-fit`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            company: selectedCompany,
            skills,
            career_interests:
              careerInterests,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Company analysis failed."
        );
      }

     setResult(data);

localStorage.setItem(
  "resumelens_company_fit",
  JSON.stringify(data)
);

localStorage.setItem(
  "resumelens_company_fit_selected",
  selectedCompany
);
    } catch (err) {
      console.error(
        "Company fit analysis error:",
        err
      );

      setError(
        err.message ||
          "Company analysis failed."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const matchedSkills =
    result?.skills?.filter(
      (skill) => skill.has_skill
    ) || [];

  const missingSkills =
    result?.skills?.filter(
      (skill) => skill.gap
    ) || [];

  const totalRelevantSkills =
    result?.skills?.length || 0;

  const matchedCount =
    matchedSkills.length;

  const gapCount =
    missingSkills.length;

  const matchPercentage =
    totalRelevantSkills > 0
      ? Math.round(
          (matchedCount /
            totalRelevantSkills) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Company Fit
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            See how your resume skills compare with
            companies relevant to your selected career
            direction.
          </p>
        </div>

        {/* CAREER PROFILE */}
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">
                Your Career Profile
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {careerProfile?.branch ||
                  "Career profile not found"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Career interests:
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {careerInterests.length > 0 ? (
                  careerInterests.map(
                    (interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                      >
                        {interest}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-sm text-slate-500">
                    No career interests selected.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/resume-analyzer"
                )
              }
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Change Career Profile
            </button>
          </div>
        </section>

        {/* COMPANY SELECTOR */}
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm font-medium text-cyan-400">
            Choose a Company
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Which company would you like to explore?
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            ResumeLens uses your selected career
            directions when comparing company skills.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <select
              value={selectedCompany}
              onChange={(event) =>
                setSelectedCompany(
                  event.target.value
                )
              }
              disabled={
                loadingCompanies ||
                companies.length === 0
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              {loadingCompanies ? (
                <option>
                  Loading companies...
                </option>
              ) : companies.length === 0 ? (
                <option>
                  No companies available
                </option>
              ) : (
                companies.map((company) => (
                  <option
                    key={company.name}
                    value={company.name}
                  >
                    {company.name} —{" "}
                    {company.posting_count} postings
                  </option>
                ))
              )}
            </select>

            <button
              type="button"
              onClick={
                analyzeCompanyFit
              }
              disabled={
                loadingAnalysis ||
                loadingCompanies
              }
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAnalysis
                ? "Analyzing..."
                : "Analyze Company Fit"}
            </button>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <section className="mt-8 space-y-8">
            {/* RESULT HEADER */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Company Analysis
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {result.company}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Based on {result.total_postings}{" "}
                    company job postings in the
                    ResumeLens dataset.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-4 text-center">
                  <p className="text-xs uppercase tracking-widest text-cyan-300">
                    Resume Match
                  </p>

                  <p className="mt-2 text-4xl font-bold text-cyan-400">
                    {matchPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Relevant Skills"
                value={totalRelevantSkills}
                description="Career-relevant company skills analyzed"
              />

              <StatCard
                label="You Have"
                value={matchedCount}
                description="Relevant skills already found in your resume"
              />

              <StatCard
                label="Skill Gaps"
                value={gapCount}
                description="Relevant company skills not detected in your resume"
              />
            </div>

            {/* EXPLANATION */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-sm font-medium text-cyan-400">
                Why this match?
              </p>

              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
                ResumeLens compares your resume skills
                with company skills that are relevant to
                your selected career directions. A higher
                match means more of those relevant company
                skills are already present in your resume.
                Missing skills are shown as areas you can
                consider strengthening, not mandatory
                requirements.
              </p>
            </div>

            {/* MATCHED */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">
                  Skills You Already Have
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Relevant company skills detected in your
                  resume.
                </p>
              </div>

              {matchedSkills.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-500">
                  No matching relevant skills were
                  detected.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matchedSkills.map(
                    (skill) => (
                      <SkillCard
                        key={skill.skill}
                        skill={skill}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* GAPS */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">
                  Skills to Consider
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Relevant company skills not detected
                  in your resume. These are suggestions,
                  not mandatory requirements.
                </p>
              </div>

              {missingSkills.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">
                  No relevant skill gaps were detected
                  for this company analysis.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {missingSkills.map(
                    (skill) => (
                      <SkillCard
                        key={skill.skill}
                        skill={skill}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* NEXT STEP */}
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <p className="text-sm font-medium text-cyan-400">
                Next Step
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Turn your skill gaps into a learning plan
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                ResumeLens can use the same career profile
                to build a learning roadmap around the
                skills most relevant to your selected
                direction.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/career-roadmap"
                  )
                }
                className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
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

export default CompanyFit;