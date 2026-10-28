import API_BASE from "../utils/api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import {
  getUserItem,
  setUserItem,
} from "../utils/userStorage.js";

import CareerFocus from "../components/CareerFocus.jsx";

function ResumeAnalyzer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const [careerFocus, setCareerFocus] = useState({
    branch: "",
    careerInterests: [],
    notSure: false,
    passion: "",
  });

  const [skillGap, setSkillGap] = useState(null);

  const [loading, setLoading] = useState(false);
  const [careerLoading, setCareerLoading] =
    useState(false);

  const [error, setError] = useState("");

  // -------------------------------------------------------
  // RESTORE SAVED USER DATA
  // -------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const savedAnalysis = getUserItem(
      "resumelens_resume_analysis"
    );

    if (savedAnalysis) {
      try {
        setResult(JSON.parse(savedAnalysis));
      } catch {
        setResult(null);
      }
    } else {
      setResult(null);
    }

    const savedCareerProfile = getUserItem(
      "resumelens_career_profile"
    );

    if (savedCareerProfile) {
      try {
        const parsed = JSON.parse(
          savedCareerProfile
        );

        setCareerFocus({
          branch: parsed.branch || "",
          careerInterests:
            Array.isArray(
              parsed.career_interests
            )
              ? parsed.career_interests
              : [],
          notSure: Boolean(parsed.notSure),
          passion: parsed.passion || "",
        });
      } catch {
        setCareerFocus({
          branch: "",
          careerInterests: [],
          notSure: false,
          passion: "",
        });
      }
    } else {
      setCareerFocus({
        branch: "",
        careerInterests: [],
        notSure: false,
        passion: "",
      });
    }

    const savedSkillGap = getUserItem(
      "careerSkillGap"
    );

    if (savedSkillGap) {
      try {
        setSkillGap(
          JSON.parse(savedSkillGap)
        );
      } catch {
        setSkillGap(null);
      }
    } else {
      setSkillGap(null);
    }

    setError("");
  }, [user?.id]);

  // -------------------------------------------------------
  // SAVE CAREER PROFILE FOR OTHER RESUMELENS PAGES
  // -------------------------------------------------------

  const saveCareerProfile = (data) => {
    if (!user?.id) {
      return;
    }

    setUserItem(
      "resumelens_career_profile",
      JSON.stringify({
        branch: data.branch || "",

        career_interests:
          data.careerInterests || [],

        passion: data.passion || "",

        notSure: data.notSure || false,
      })
    );
  };

  // -------------------------------------------------------
  // RESUME ANALYSIS
  // -------------------------------------------------------

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please select a PDF resume first."
      );

      return;
    }

    setLoading(true);
    setError("");

    setResult(null);
    setSkillGap(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_BASE}/api/resume/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Resume analysis failed."
        );
      }

      setResult(data);

      // Save complete resume analysis for
      // the currently logged-in user.
      if (user?.id) {
        setUserItem(
          "resumelens_resume_analysis",
          JSON.stringify(data)
        );

        // Save only detected skills for
        // future ResumeLens pages.
        setUserItem(
          "resumelens_resume_skills",
          JSON.stringify(
            data.detected_skills || []
          )
        );
      }

      // A new resume analysis should start
      // a fresh career-fit calculation.
      setSkillGap(null);

      // Remove old saved skill-gap analysis
      // for this user so Dashboard does not
      // show stale information.
      if (user?.id) {
        setUserItem(
          "careerSkillGap",
          ""
        );
      }
    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while analyzing the resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // CAREER FOCUS
  // -------------------------------------------------------

  const handleCareerFocusChange = (data) => {
    setCareerFocus(data);

    setSkillGap(null);
    setError("");

    saveCareerProfile(data);
  };

  // -------------------------------------------------------
  // CAREER FIT / SKILL GAP
  // -------------------------------------------------------

  const handleCareerFitAnalysis =
    async () => {
      if (!result?.detected_skills) {
        setError(
          "Please analyze your resume before analyzing career fit."
        );

        return;
      }

      if (!careerFocus.branch) {
        setError(
          "Please select your engineering branch."
        );

        return;
      }

      if (
        careerFocus.notSure &&
        !careerFocus.passion.trim()
      ) {
        setError(
          "Tell us what you are interested or passionate about."
        );

        return;
      }

      if (
        !careerFocus.notSure &&
        careerFocus.careerInterests.length === 0
      ) {
        setError(
          "Please select one or more career interests."
        );

        return;
      }

      saveCareerProfile(
        careerFocus
      );

      setCareerLoading(true);
      setError("");
      setSkillGap(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/skill-gap`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              skills:
                result.detected_skills,

              branch:
                careerFocus.branch,

              career_interests:
                careerFocus.notSure
                  ? []
                  : careerFocus.careerInterests,

              passion:
                careerFocus.notSure
                  ? careerFocus.passion
                  : "",
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Career fit analysis failed."
          );
        }

        setSkillGap(data);

        if (user?.id) {
          setUserItem(
            "careerSkillGap",
            JSON.stringify(data)
          );
        }
      } catch (err) {
        console.error(
          "Career fit analysis error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong while analyzing career fit."
        );
      } finally {
        setCareerLoading(false);
      }
    };

  // -------------------------------------------------------
  // RESUME SCORE
  // -------------------------------------------------------

  const score =
    typeof result?.resume_score ===
    "object"
      ? result.resume_score
          ?.overall_score
      : result?.resume_score;

  const categoryScores =
    result?.resume_score
      ?.category_scores || {};

  const strengths =
    result?.resume_score
      ?.strengths || [];

  const improvements =
    result?.resume_score
      ?.improvements || [];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <section className="space-y-8">

          {/* -------------------------------------------------
              HEADER
          ------------------------------------------------- */}

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              ResumeLens
            </p>

            <h1 className="mt-3 text-4xl font-bold text-white">
              Resume Analyzer
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Upload your resume and discover your
              skills, resume score, strengths, areas
              to improve, and career-specific skill
              gaps.
            </p>
          </div>

          {/* -------------------------------------------------
              UPLOAD
          ------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold text-white">
              Upload Resume
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Upload a PDF resume to begin the
              analysis.
            </p>

            <div className="mt-6">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                  setFile(
                    event.target.files?.[0] ||
                      null
                  );

                  setError("");

                  setResult(null);

                  setSkillGap(null);
                }}
                className="block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"
              />
            </div>

            {file && (
              <p className="mt-3 text-sm text-slate-400">
                Selected:{" "}
                <span className="text-white">
                  {file.name}
                </span>
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Resume"}
            </button>
          </div>

          {/* -------------------------------------------------
              ANALYSIS RESULTS
          ------------------------------------------------- */}

          {result && (
            <>

              {/* -------------------------------------------------
                  SUMMARY CARDS
              ------------------------------------------------- */}

              <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">
                    Resume Score
                  </p>

                  <p className="mt-2 text-5xl font-bold text-cyan-400">
                    {score ?? "N/A"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Overall resume quality
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">
                    Skills Detected
                  </p>

                  <p className="mt-2 text-5xl font-bold text-white">
                    {result.skill_count ??
                      result.detected_skills
                        ?.length ??
                      0}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Skills found in your resume
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">
                    Resume Pages
                  </p>

                  <p className="mt-2 text-5xl font-bold text-white">
                    {result.pages ??
                      "N/A"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    PDF pages analyzed
                  </p>
                </div>

              </div>

              {/* -------------------------------------------------
                  QUALITY BREAKDOWN
              ------------------------------------------------- */}

              {Object.keys(
                categoryScores
              ).length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <h2 className="text-xl font-semibold text-white">
                    Resume Quality Breakdown
                  </h2>

                  <div className="mt-6 space-y-5">

                    {Object.entries(
                      categoryScores
                    ).map(
                      ([category, value]) => {

                        const numericValue =
                          typeof value ===
                          "object"
                            ? Number(
                                value?.score ??
                                  value?.overall_score ??
                                  0
                              )
                            : Number(
                                value || 0
                              );

                        return (
                          <div
                            key={category}
                          >

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-sm text-slate-300">
                                {category}
                              </span>

                              <span className="text-sm font-semibold text-cyan-400">
                                {
                                  numericValue
                                }
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-cyan-500"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      numericValue,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              )}

              {/* -------------------------------------------------
                  STRENGTHS + IMPROVEMENTS
              ------------------------------------------------- */}

              <div className="grid gap-6 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <h2 className="text-xl font-semibold text-white">
                    Strengths
                  </h2>

                  <div className="mt-5 space-y-3">

                    {strengths.length >
                    0 ? (
                      strengths.map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={index}
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-slate-300"
                          >
                            {typeof item ===
                            "object"
                              ? item?.message ??
                                item?.text ??
                                JSON.stringify(
                                  item
                                )
                              : item}
                          </div>

                        )
                      )
                    ) : (
                      <p className="text-sm text-slate-500">
                        No strengths returned.
                      </p>
                    )}

                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <h2 className="text-xl font-semibold text-white">
                    Areas to Improve
                  </h2>

                  <div className="mt-5 space-y-3">

                    {improvements.length >
                    0 ? (
                      improvements.map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={index}
                            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300"
                          >
                            {typeof item ===
                            "object"
                              ? item?.message ??
                                item?.text ??
                                JSON.stringify(
                                  item
                                )
                              : item}
                          </div>

                        )
                      )
                    ) : (
                      <p className="text-sm text-slate-500">
                        No improvements returned.
                      </p>
                    )}

                  </div>
                </div>

              </div>

              {/* -------------------------------------------------
                  RESUME IMPROVEMENT
              ------------------------------------------------- */}

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">

                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
                  Resume Improvement
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Strengthen Your Resume Bullets
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Check individual resume bullets for
                  weak openings, missing measurable
                  results, and unclear actions.
                  ResumeLens will show you exactly what
                  can be improved.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/resume-improvement"
                    )
                  }
                  className="mt-6 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Improve Resume Bullets
                </button>

              </div>

              {/* -------------------------------------------------
                  DETECTED SKILLS
              ------------------------------------------------- */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-semibold text-white">
                  Detected Skills
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Skills identified from your uploaded
                  resume.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                  {Array.isArray(
                    result.detected_skills
                  ) &&
                  result.detected_skills
                    .length > 0 ? (

                    result.detected_skills.map(
                      (skill) => (

                        <span
                          key={skill}
                          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300"
                        >
                          {skill}
                        </span>

                      )
                    )

                  ) : (

                    <p className="text-slate-400">
                      No skills detected.
                    </p>

                  )}

                </div>
              </div>

              {/* -------------------------------------------------
                  CAREER FOCUS
              ------------------------------------------------- */}

              <CareerFocus
                onCareerFocusChange={
                  handleCareerFocusChange
                }
              />

              {/* -------------------------------------------------
                  CAREER INTELLIGENCE
              ------------------------------------------------- */}

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                  Career Intelligence
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Analyze Your Career Fit
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  ResumeLens compares your detected
                  resume skills with skills frequently
                  found in job postings related to each
                  career direction you selected.
                </p>

                <button
                  type="button"
                  onClick={
                    handleCareerFitAnalysis
                  }
                  disabled={careerLoading}
                  className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {careerLoading
                    ? "Analyzing Career Fit..."
                    : "Analyze Career Fit"}
                </button>

              </div>

              {/* -------------------------------------------------
                  CAREER TRACK RESULTS
              ------------------------------------------------- */}

              {skillGap && (
                <div className="space-y-8">

                  {/* CAREER ANALYSIS HEADER */}

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                      Career Intelligence
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      Your Career Skill Gap
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      Each career direction is analyzed
                      independently using the skills
                      detected from your uploaded
                      resume.
                    </p>

                  </div>

                  {/* CAREER TRACKS */}

                  {skillGap.career_tracks?.length >
                  0 ? (

                    <div className="space-y-8">

                      {skillGap.career_tracks.map(
                        (track) => (

                          <section
                            key={
                              track.career
                            }
                            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                          >

                            {/* TRACK HEADER */}

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                              <div>

                                <p className="text-sm font-medium uppercase tracking-[0.15em] text-cyan-400">
                                  Career Direction
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-white">
                                  {
                                    track.career
                                  }
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                  {
                                    track.relevant_skill_count
                                  }{" "}
                                  relevant skills
                                  analyzed.
                                </p>

                              </div>

                              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-8 py-5 text-center">

                                <p className="text-sm text-slate-400">
                                  Career Match
                                </p>

                                <p className="mt-1 text-5xl font-bold text-cyan-400">
                                  {
                                    track.match_percentage
                                  }
                                  %
                                </p>

                              </div>

                            </div>

                            {/* PROGRESS BAR */}

                            <div className="mt-7">

                              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                                <div
                                  className="h-full rounded-full bg-cyan-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        track.match_percentage ||
                                          0,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                            {/* COUNTS */}

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">

                              <div className="rounded-xl bg-slate-950 p-5">

                                <p className="text-sm text-slate-500">
                                  Relevant Skills
                                </p>

                                <p className="mt-2 text-2xl font-bold text-white">
                                  {
                                    track.relevant_skill_count
                                  }
                                </p>

                              </div>

                              <div className="rounded-xl bg-slate-950 p-5">

                                <p className="text-sm text-slate-500">
                                  You Have
                                </p>

                                <p className="mt-2 text-2xl font-bold text-emerald-400">
                                  {
                                    track.matched_count
                                  }
                                </p>

                              </div>

                              <div className="rounded-xl bg-slate-950 p-5">

                                <p className="text-sm text-slate-500">
                                  Skill Gaps
                                </p>

                                <p className="mt-2 text-2xl font-bold text-amber-400">
                                  {
                                    track.missing_count
                                  }
                                </p>

                              </div>

                            </div>

                            {/* MATCHED SKILLS */}

                            <div className="mt-10">

                              <h4 className="text-xl font-bold text-white">
                                Skills You Already Have
                              </h4>

                              <p className="mt-1 text-sm text-slate-400">
                                Resume skills relevant
                                to this career
                                direction.
                              </p>

                              {track.matched_skills?.length >
                              0 ? (

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                  {track.matched_skills.map(
                                    (item) => (

                                      <div
                                        key={
                                          item.skill
                                        }
                                        className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5"
                                      >

                                        <p className="font-semibold text-emerald-300">
                                          {
                                            item.skill
                                          }
                                        </p>

                                        <p className="mt-2 text-sm text-slate-500">
                                          {
                                            item.category
                                          }
                                        </p>

                                        {item.posting_count !=
                                          null && (
                                          <p className="mt-3 text-sm text-slate-400">
                                            Seen in{" "}
                                            <span className="font-semibold text-white">
                                              {
                                                item.posting_count
                                              }
                                            </span>{" "}
                                            postings
                                          </p>
                                        )}

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-500">
                                  No matching skills
                                  found yet.
                                </div>

                              )}

                            </div>

                            {/* MISSING SKILLS */}

                            <div className="mt-10">

                              <h4 className="text-xl font-bold text-white">
                                Skills to Consider
                              </h4>

                              <p className="mt-1 text-sm text-slate-400">
                                These are relevant skills
                                for this career direction
                                that were not detected in
                                your resume. They are
                                suggestions, not mandatory
                                requirements.
                              </p>

                              {track.missing_skills?.length >
                              0 ? (

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                  {track.missing_skills.map(
                                    (
                                      item,
                                      index
                                    ) => (

                                      <div
                                        key={
                                          item.skill
                                        }
                                        className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5"
                                      >

                                        <div className="flex items-start justify-between gap-4">

                                          <p className="font-semibold text-amber-300">
                                            {
                                              item.skill
                                            }
                                          </p>

                                          <span className="text-sm text-slate-600">
                                            #
                                            {
                                              index +
                                              1
                                            }
                                          </span>

                                        </div>

                                        <p className="mt-2 text-sm text-slate-500">
                                          {
                                            item.category
                                          }
                                        </p>

                                        {item.posting_count !=
                                          null && (
                                          <p className="mt-3 text-sm text-slate-400">
                                            Seen in{" "}
                                            <span className="font-semibold text-white">
                                              {
                                                item.posting_count
                                              }
                                            </span>{" "}
                                            relevant
                                            postings
                                          </p>
                                        )}

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <div className="mt-5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5 text-emerald-300">
                                  Your resume currently
                                  covers the analyzed
                                  skills for this career
                                  path.
                                </div>

                              )}

                            </div>

                          </section>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                      <h3 className="text-xl font-semibold text-white">
                        No career tracks
                        generated
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Please select at least one
                        supported career interest
                        and try again.
                      </p>

                    </div>

                  )}

                  {/* CAREER PROFILE SUMMARY */}

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                    <h2 className="text-xl font-semibold text-white">
                      Your Career Focus
                    </h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div className="rounded-xl bg-slate-950 p-4">

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Engineering Branch
                        </p>

                        <p className="mt-2 text-white">
                          {skillGap.branch ||
                            careerFocus.branch ||
                            "Not selected"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-950 p-4">

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Career Interests
                        </p>

                        <p className="mt-2 text-slate-300">
                          {skillGap.career_interests?.join(
                            ", "
                          ) ||
                            careerFocus.careerInterests.join(
                              ", "
                            ) ||
                            "Not selected"}
                        </p>

                      </div>

                    </div>

                    {(skillGap.passion ||
                      careerFocus.passion) && (
                      <div className="mt-4 rounded-xl bg-slate-950 p-4">

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Your Interests
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {skillGap.passion ||
                            careerFocus.passion}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* GO TO FULL SKILL GAP PAGE */}

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                      Continue Your Analysis
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Explore Full Skill Gap
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      Open the dedicated Skill Gap page for
                      a detailed career-by-career analysis.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/skill-gap")
                      }
                      className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Open Skill Gap
                    </button>

                  </div>

                </div>
              )}

              {/* -------------------------------------------------
                  RESUME INFORMATION
              ------------------------------------------------- */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-semibold text-white">
                  Resume Information
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  <div>

                    <p className="text-sm text-slate-500">
                      File
                    </p>

                    <p className="mt-1 break-all text-white">
                      {result.filename ||
                        "Resume PDF"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Extracted Text
                    </p>

                    <p className="mt-1 text-white">
                      {result.text_length ??
                        0}{" "}
                      characters
                    </p>

                  </div>

                </div>

              </div>

              {/* -------------------------------------------------
                  RESUME PREVIEW
              ------------------------------------------------- */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-semibold text-white">
                  Resume Preview
                </h2>

                <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
                  {result.text_preview ||
                    "No text preview available."}
                </pre>

              </div>

            </>
          )}

        </section>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
