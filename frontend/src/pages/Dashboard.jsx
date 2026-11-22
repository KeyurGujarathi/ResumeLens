import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { getUserItem } from "../utils/userStorage.js";

function StatCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ActionCard({
  eyebrow,
  title,
  description,
  buttonText,
  onClick,
  primary = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 rounded-xl px-5 py-3 text-sm font-semibold transition ${
          primary
            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            : "border border-slate-700 text-slate-300 hover:bg-slate-800"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const placementSummary = useMemo(() => {
    if (!user?.id) return null;

    try {
      const saved = localStorage.getItem(
        `resumelens_user_${user.id}_placement_summary`
      );

      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const resumeAnalysis = useMemo(() => {
    try {
      const saved = getUserItem("resumelens_resume_analysis");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const resumeBuilderData = useMemo(() => {
    if (!user?.id) return null;

    try {
      const saved =
        localStorage.getItem(
          `resumelens_user_${user.id}_resumelens_resume_builder`
        ) ?? getUserItem("resumelens_resume_builder");

      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const personal = parsed?.personal || {};

      const hasResumeContent = Boolean(
        personal.name ||
          personal.email ||
          personal.phone ||
          personal.summary ||
          (Array.isArray(parsed.education) &&
            parsed.education.some((item) =>
              Object.values(item || {}).some(Boolean)
            )) ||
          (Array.isArray(parsed.experience) &&
            parsed.experience.some((item) =>
              Object.values(item || {}).some(Boolean)
            )) ||
          (Array.isArray(parsed.projects) &&
            parsed.projects.some((item) =>
              Object.values(item || {}).some(Boolean)
            )) ||
          (Array.isArray(parsed.skills) && parsed.skills.length > 0)
      );

      return hasResumeContent ? parsed : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const careerProfile = useMemo(() => {
    try {
      const saved = getUserItem("resumelens_career_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const resumeSkills = useMemo(() => {
    try {
      const parsed = JSON.parse(
        getUserItem("resumelens_resume_skills") || "[]"
      );

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [user?.id]);

  const skillGap = useMemo(() => {
    try {
      const saved = getUserItem("careerSkillGap");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const companyFit = useMemo(() => {
    try {
      const saved = getUserItem("resumelens_company_fit");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const improvementResult = useMemo(() => {
    try {
      const saved = getUserItem("resumelens_improvement_result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.id]);

  const score =
    typeof resumeAnalysis?.resume_score === "object"
      ? resumeAnalysis?.resume_score?.overall_score
      : resumeAnalysis?.resume_score;

  const careerTracks = Array.isArray(skillGap?.career_tracks)
    ? skillGap.career_tracks
    : [];

  const careerInterests = Array.isArray(
    careerProfile?.career_interests
  )
    ? careerProfile.career_interests
    : [];

  const totalRelevantSkills = careerTracks.reduce(
    (total, track) =>
      total + Number(track.relevant_skill_count || 0),
    0
  );

  const totalMatchedSkills = careerTracks.reduce(
    (total, track) => total + Number(track.matched_count || 0),
    0
  );

  const uniqueMissingSkills = Array.from(
    new Set(
      careerTracks.flatMap((track) =>
        Array.isArray(track.missing_skills)
          ? track.missing_skills.map((item) => item.skill)
          : []
      )
    )
  );

  const totalMissingSkills = uniqueMissingSkills.length;

  const overallCareerMatch =
    totalRelevantSkills > 0
      ? Math.round(
          (totalMatchedSkills / totalRelevantSkills) * 100
        )
      : 0;

  const companySkills = Array.isArray(companyFit?.skills)
    ? companyFit.skills
    : [];

  const companyMatchedCount = companySkills.filter(
    (skill) => skill.has_skill
  ).length;

  const companyMatch =
    companySkills.length > 0
      ? Math.round(
          (companyMatchedCount / companySkills.length) * 100
        )
      : null;

  const improvementCount =
    improvementResult?.findings?.length || 0;

  const profileCompletion = [
    Boolean(resumeAnalysis),
    careerInterests.length > 0,
    Boolean(skillGap),
    Boolean(companyFit),
  ].filter(Boolean).length;

  const completionPercentage = Math.round(
    (profileCompletion / 4) * 100
  );

  const hasData = Boolean(
    resumeAnalysis ||
      careerProfile ||
      resumeBuilderData ||
      resumeSkills.length > 0
  );
  // Public dashboard: never display personal data when logged out.
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              ResumeLens
            </p>

            <h1 className="mt-4 text-4xl font-bold">
              Welcome to Your Career Dashboard
            </h1>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Build your resume, analyze your skills, explore career
              opportunities, identify skill gaps, and prepare for placements
              with ResumeLens.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Login to Your Account
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              ResumeLens
            </p>

            <h1 className="mt-3 text-4xl font-bold">Dashboard</h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Your central career dashboard. Track your resume strength,
              career direction, skill gaps, company fit, and placement
              preparation in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/resume")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              {resumeBuilderData ? "Edit Resume" : "Build Resume"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/resume-analyzer")}
              className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Analyze Resume
            </button>
          </div>
        </div>

        {!hasData ? (
          <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
            <p className="text-sm font-medium text-cyan-400">
              Welcome to ResumeLens
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Build or analyze your resume
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Start by creating a resume in the Resume Builder or upload
              an existing resume for analysis. ResumeLens can then help
              you understand your skills, career direction, skill gaps,
              and company fit.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/resume")}
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Build Resume
              </button>

              <button
                type="button"
                onClick={() => navigate("/resume-analyzer")}
                className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Analyze Existing Resume
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Resume Score"
                value={score ?? "—"}
                description="Overall resume quality"
              />

              <StatCard
                label="Skills Detected"
                value={resumeSkills.length}
                description="Skills identified from your resume"
              />

              <StatCard
                label="Career Match"
                value={
                  careerTracks.length > 0
                    ? `${overallCareerMatch}%`
                    : "—"
                }
                description="Across your selected career directions"
              />

              <StatCard
                label="Skill Gaps"
                value={
                  careerTracks.length > 0 ? totalMissingSkills : "—"
                }
                description="Areas to consider strengthening"
              />
            </section>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-400">
                    Resume Builder
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {resumeBuilderData
                      ? "Resume saved in this account"
                      : "No resume content saved yet"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {resumeBuilderData
                      ? `Layout: ${
                          resumeBuilderData.pageLayout === "two"
                            ? "Two pages"
                            : "Single page"
                        } · Theme: ${
                          resumeBuilderData.theme || "classic"
                        }`
                      : "Create your resume and your saved content will appear here when you return to the Dashboard."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/resume")}
                  className="shrink-0 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  {resumeBuilderData
                    ? "Open Resume Builder"
                    : "Create Resume"}
                </button>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 lg:col-span-2">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-400">
                      Career Profile
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      {careerProfile?.branch || "Branch not selected"}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {careerInterests.length > 0 ? (
                        careerInterests.map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          No career direction selected yet.
                        </span>
                      )}
                    </div>

                    {careerProfile?.passion && (
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        Interest:{" "}
                        <span className="text-slate-300">
                          {careerProfile.passion}
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/resume-analyzer")}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
                <p className="text-sm font-medium text-cyan-400">
                  Profile Progress
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {completionPercentage}%
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {profileCompletion} of 4 major analysis stages completed.
                </p>
              </div>
            </section>

            {/* PLACEMENT PREPARATION DASHBOARD SUMMARY */}

            <section className="mt-8">
              <div className="mb-4">
                <p className="text-sm font-medium text-cyan-400">
                  Placement Preparation
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Your preparation overview
                </h2>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-6">
                {placementSummary ? (
                  <>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">
                          Current preparation track
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {placementSummary.career}
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {placementSummary.completedTopics} of{" "}
                          {placementSummary.totalTopics} topics completed
                          · {placementSummary.practicedQuestions} questions
                          practiced
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-7 py-5 text-center">
                        <p className="text-xs uppercase tracking-widest text-cyan-300">
                          Preparation Readiness
                        </p>

                        <p className="mt-2 text-4xl font-bold text-cyan-400">
                          {placementSummary.preparationReadiness ?? 0}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          Practice progress
                        </span>

                        <span className="font-semibold text-cyan-400">
                          {placementSummary.preparationProgress ?? 0}%
                        </span>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                placementSummary.preparationProgress || 0,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        {
                          label: "Topics remaining",
                          value: placementSummary.remainingTopics ?? 0,
                        },
                        {
                          label: "Questions answered",
                          value: placementSummary.answeredQuestions ?? 0,
                        },
                        {
                          label: "Correct answers",
                          value: placementSummary.correctAnswers ?? 0,
                        },
                        {
                          label: "Quiz score",
                          value:
                            placementSummary.answeredQuestions > 0
                              ? `${placementSummary.quizScore}%`
                              : "—",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-slate-950 p-4"
                        >
                          <p className="text-xs text-slate-500">
                            {item.label}
                          </p>

                          <p className="mt-2 text-2xl font-bold text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Start your placement preparation
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Your topic progress, practiced questions, and quiz
                      results will appear here after you begin preparing.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/placement-preparation")}
                  className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {placementSummary
                    ? "Continue Preparation"
                    : "Start Preparation"}
                </button>
              </div>
            </section>

            {careerTracks.length > 0 && (
              <section className="mt-10">
                <div className="mb-4">
                  <p className="text-sm font-medium text-cyan-400">
                    Career Intelligence
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Your Career Tracks
                  </h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {careerTracks.map((track) => (
                    <div
                      key={track.career}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold text-white">
                            {track.career}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {track.relevant_skill_count} relevant skills analyzed
                          </p>
                        </div>

                        <span className="text-3xl font-bold text-cyan-400">
                          {track.match_percentage}%
                        </span>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{
                            width: `${Math.min(
                              Math.max(track.match_percentage || 0, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          {
                            label: "Relevant",
                            value: track.relevant_skill_count,
                            color: "text-white",
                          },
                          {
                            label: "Have",
                            value: track.matched_count,
                            color: "text-emerald-400",
                          },
                          {
                            label: "Gaps",
                            value: track.missing_count,
                            color: "text-amber-400",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl bg-slate-950 p-4"
                          >
                            <p className="text-xs text-slate-500">
                              {item.label}
                            </p>

                            <p
                              className={`mt-1 text-lg font-semibold ${item.color}`}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <div className="mb-4">
                <p className="text-sm font-medium text-cyan-400">
                  Career Progress
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Continue Your Journey
                </h2>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ActionCard
                  eyebrow="Resume Builder"
                  title={
                    resumeBuilderData
                      ? "Continue Your Resume"
                      : "Build a Resume"
                  }
                  description={
                    resumeBuilderData
                      ? "Your resume content is saved. Open the builder to keep editing and previewing it."
                      : "Create a resume with your personal details, education, projects, skills, and experience."
                  }
                  buttonText={
                    resumeBuilderData ? "Edit Resume" : "Start Building"
                  }
                  onClick={() => navigate("/resume")}
                  primary
                />

                <ActionCard
                  eyebrow="Resume"
                  title="Improve Resume Bullets"
                  description={
                    improvementCount > 0
                      ? `${improvementCount} issues were detected in your last analyzed bullet. Continue improving your resume writing.`
                      : "Strengthen resume bullets by checking action, clarity, and measurable results."
                  }
                  buttonText="Improve Resume"
                  onClick={() => navigate("/resume-improvement")}
                  primary
                />

                <ActionCard
                  eyebrow="Skills"
                  title="Explore Skill Gap"
                  description={
                    totalMissingSkills > 0
                      ? `ResumeLens currently shows ${totalMissingSkills} skill-gap entries across your selected career tracks.`
                      : "Review the skills relevant to your chosen career directions."
                  }
                  buttonText="Review Skill Gap"
                  onClick={() => navigate("/skill-gap")}
                />

                <ActionCard
                  eyebrow="Companies"
                  title="Check Company Fit"
                  description={
                    companyFit
                      ? `Your latest analysis is for ${companyFit.company}.`
                      : "Compare your skills with career-relevant skills found in target companies."
                  }
                  buttonText="Explore Company Fit"
                  onClick={() => navigate("/company-fit")}
                />

                <ActionCard
                  eyebrow="Learning"
                  title="Open Career Roadmap"
                  description="Turn your career skill gaps into a focused learning sequence."
                  buttonText="View Roadmap"
                  onClick={() => navigate("/career-roadmap")}
                />

                <ActionCard
                  eyebrow="Placement"
                  title="Prepare for Placements"
                  description="Practice career-specific technical concepts and interview questions."
                  buttonText="Start Preparation"
                  onClick={() => navigate("/placement-preparation")}
                />

                <ActionCard
                  eyebrow="Resume Analysis"
                  title="Re-analyze Your Resume"
                  description="Upload an updated resume and refresh your entire ResumeLens profile."
                  buttonText="Analyze Again"
                  onClick={() => navigate("/resume-analyzer")}
                />
              </div>
            </section>

            {companyFit && (
              <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-400">
                      Latest Company Fit
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      {companyFit.company}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Based on {companyFit.total_postings} company job
                      postings in the ResumeLens dataset.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-7 py-5 text-center">
                    <p className="text-xs uppercase tracking-widest text-cyan-300">
                      Resume Match
                    </p>

                    <p className="mt-2 text-4xl font-bold text-cyan-400">
                      {companyMatch ?? "—"}%
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  {companyMatchedCount} of {companySkills.length} relevant
                  company skills are currently present in your resume.
                </p>
              </section>
            )}

            <section className="mt-10 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <p className="text-sm font-medium text-cyan-400">
                Your Next Move
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Keep improving where it matters most
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                ResumeLens is designed to connect your resume, career
                direction, market demand, company fit, learning roadmap,
                and placement preparation into one continuous journey.
              </p>

              <button
                type="button"
                onClick={() => navigate("/placement-preparation")}
                className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Continue to Placement Preparation
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Dashboard;