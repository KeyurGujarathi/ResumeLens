import API_BASE from "../utils/api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getActiveUserId,
  getUserItem,
} from "../utils/userStorage.js";

function SkillGap() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initializeSkillGap() {
      try {
        setLoading(true);
        setError("");

        // Verify that a user is active.
        const userId = getActiveUserId();

        if (!userId) {
          navigate("/login", { replace: true });
          return;
        }

        // Load this user's saved career profile.
        const savedProfile = getUserItem(
          "resumelens_career_profile"
        );

        if (!savedProfile) {
          navigate("/career-profile", {
            replace: true,
          });
          return;
        }

        const parsedProfile = JSON.parse(
          savedProfile
        );

        if (
          !parsedProfile.branch ||
          !Array.isArray(
            parsedProfile.career_interests
          ) ||
          parsedProfile.career_interests.length === 0
        ) {
          navigate("/career-profile", {
            replace: true,
          });
          return;
        }

        if (cancelled) return;

        setProfile(parsedProfile);

        await loadSkillGap(parsedProfile, () => cancelled);
      } catch (err) {
        console.error(
          "Skill Gap initialization failed:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load your career profile. Please return to Career Profile and save it again."
          );
          setLoading(false);
        }
      }
    }

    initializeSkillGap();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const loadSkillGap = async (
    careerProfile,
    isCancelled
  ) => {
    try {
      setLoading(true);
      setError("");

      // Load this user's resume analysis.
      const savedResumeAnalysis = getUserItem(
        "resumelens_resume_analysis"
      );

      if (!savedResumeAnalysis) {
        if (!isCancelled()) {
          setError(
            "Please analyze your resume before viewing the career skill gap."
          );
        }
        return;
      }

      const resumeAnalysis = JSON.parse(
        savedResumeAnalysis
      );

      const resumeSkills =
        resumeAnalysis.detected_skills || [];

      if (
        !Array.isArray(resumeSkills) ||
        resumeSkills.length === 0
      ) {
        if (!isCancelled()) {
          setError(
            "No skills were detected in your resume. Please analyze your resume again."
          );
        }
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/skill-gap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: resumeSkills,
            branch: careerProfile.branch || "",
            career_interests:
              careerProfile.career_interests || [],
            passion: careerProfile.passion || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to calculate skill gap."
        );
      }

      if (!isCancelled()) {
        setResult(data);
      }
    } catch (err) {
      console.error(
        "Skill Gap calculation failed:",
        err
      );

      if (!isCancelled()) {
        setError(
          err.message ||
            "Unable to calculate skill gap."
        );
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <p className="mt-4 text-slate-400">
            Analyzing your resume against your selected career paths...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Career Skill Gap
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Your skill gap is calculated separately for each
            career direction you selected. Skills from unrelated
            career paths are not used to judge your fit.
          </p>

          {profile && (
            <div className="mt-6">
              <div>
                <span className="inline-block rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                  Branch: {profile.branch}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap">
                {profile.career_interests &&
                  profile.career_interests.map(
                    (interest) => (
                      <div
                        key={interest}
                        className="mr-3 mb-3 inline-block"
                      >
                        <span className="block whitespace-nowrap rounded-full border border-cyan-800 bg-cyan-950/40 px-4 py-2 text-sm font-medium text-cyan-300">
                          {interest}
                        </span>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 px-5 py-4 text-red-300">
            <p>{error}</p>

            {error.includes(
              "analyze your resume"
            ) && (
              <button
                type="button"
                onClick={() =>
                  navigate("/resume-analyzer")
                }
                className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Open Resume Analyzer
              </button>
            )}
          </div>
        )}

        {/* CAREER TRACKS */}
        {result && (
          <div className="space-y-10">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Your Career Tracks
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Each career path is analyzed independently using
                  the skills detected from your resume.
                </p>
              </div>

              <div className="space-y-8">
                {result.career_tracks &&
                  result.career_tracks.map(
                    (track) => (
                      <section
                        key={track.career}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
                      >
                        {/* TRACK HEADER */}
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.15em] text-cyan-400">
                              Career Direction
                            </p>

                            <h3 className="mt-2 text-3xl font-bold">
                              {track.career}
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                              {track.relevant_skill_count} relevant
                              skills analyzed for this career path.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-cyan-900/50 bg-cyan-950/20 px-8 py-5 text-center">
                            <p className="text-sm text-slate-400">
                              Career Match
                            </p>

                            <p className="mt-1 text-5xl font-bold text-cyan-400">
                              {track.match_percentage}%
                            </p>
                          </div>
                        </div>

                        {/* PROGRESS */}
                        <div className="mt-7">
                          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-cyan-500 transition-all"
                              style={{
                                width: `${track.match_percentage}%`,
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

                            <p className="mt-2 text-2xl font-bold">
                              {track.relevant_skill_count}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-950 p-5">
                            <p className="text-sm text-slate-500">
                              You Have
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-400">
                              {track.matched_count}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-950 p-5">
                            <p className="text-sm text-slate-500">
                              Skill Gaps
                            </p>

                            <p className="mt-2 text-2xl font-bold text-orange-400">
                              {track.missing_count}
                            </p>
                          </div>
                        </div>

                        {/* MATCHED SKILLS */}
                        <div className="mt-10">
                          <h4 className="text-xl font-bold">
                            Skills You Already Have
                          </h4>

                          <p className="mt-1 text-sm text-slate-400">
                            Skills from your resume relevant to this
                            career direction.
                          </p>

                          {track.matched_skills &&
                          track.matched_skills.length > 0 ? (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {track.matched_skills.map(
                                (item) => (
                                  <div
                                    key={item.skill}
                                    className="rounded-xl border border-green-900/60 bg-green-950/20 p-5"
                                  >
                                    <p className="font-semibold text-green-300">
                                      {item.skill}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                      {item.category}
                                    </p>

                                    {item.posting_count != null && (
                                      <p className="mt-3 text-sm text-slate-400">
                                        Seen in{" "}
                                        <span className="font-semibold text-white">
                                          {item.posting_count}
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
                              No matching skills found yet.
                            </div>
                          )}
                        </div>

                        {/* MISSING SKILLS */}
                        <div className="mt-10">
                          <h4 className="text-xl font-bold">
                            Skills to Consider
                          </h4>

                          <p className="mt-1 text-sm text-slate-400">
                            These are relevant skills for this career
                            direction that were not detected in your
                            resume. They are suggestions, not mandatory
                            requirements.
                          </p>

                          {track.missing_skills &&
                          track.missing_skills.length > 0 ? (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {track.missing_skills.map(
                                (item, index) => (
                                  <div
                                    key={item.skill}
                                    className="rounded-xl border border-orange-900/50 bg-orange-950/20 p-5"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <p className="font-semibold text-orange-300">
                                        {item.skill}
                                      </p>

                                      <span className="text-sm text-slate-600">
                                        #{index + 1}
                                      </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                      {item.category}
                                    </p>

                                    {item.posting_count != null && (
                                      <p className="mt-3 text-sm text-slate-400">
                                        Seen in{" "}
                                        <span className="font-semibold text-white">
                                          {item.posting_count}
                                        </span>{" "}
                                        relevant postings
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="mt-5 rounded-xl border border-green-900/50 bg-green-950/20 p-5 text-green-300">
                              Your resume currently covers the
                              analyzed skills for this career path.
                            </div>
                          )}
                        </div>
                      </section>
                    )
                  )}
              </div>
            </section>

            {/* IMPORTANT NOTE */}
            <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-8">
              <h2 className="text-2xl font-bold">
                How ResumeLens Uses Your Career Direction
              </h2>

              <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                ResumeLens does not treat every engineering job as
                relevant to every student. Your branch and selected
                career interests determine which skills are included
                in your analysis. For example, an Embedded / IoT /
                Robotics analysis focuses on microcontrollers,
                firmware, C/C++, RTOS, sensors, ESP32, STM32 and
                related skills rather than unrelated cloud or data
                engineering requirements.
              </p>
            </section>

            {/* COMPANY FIT */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h2 className="text-2xl font-bold">
                Next: Company Fit
              </h2>

              <p className="mt-2 max-w-3xl text-slate-400">
                After identifying your career direction, ResumeLens
                can compare your skills against companies relevant
                to that direction.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/company-fit")
                }
                className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Explore Company Fit
              </button>
            </section>
          </div>
        )}

        {/* CHANGE PROFILE */}
        <button
          type="button"
          onClick={() =>
            navigate("/career-profile")
          }
          className="mt-8 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Change Career Profile
        </button>
      </div>
    </div>
  );
}

export default SkillGap;