import API_BASE from "../utils/api.js";
import { useEffect, useRef, useState } from "react";

function CareerRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillStatus, setSkillStatus] = useState({});
  const detailsRef = useRef(null);

  useEffect(() => {
    const savedStatuses = localStorage.getItem(
      "resumelens_skill_progress"
    );

    if (savedStatuses) {
      try {
        setSkillStatus(JSON.parse(savedStatuses));
      } catch {
        setSkillStatus({});
      }
    }
  }, []);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const savedAnalysis = localStorage.getItem(
          "resumelens_resume_analysis"
        );

        const savedProfile = localStorage.getItem(
          "resumelens_career_profile"
        );

        if (!savedAnalysis || !savedProfile) {
          throw new Error(
            "Resume analysis or career profile not found."
          );
        }

        const analysis = JSON.parse(savedAnalysis);
        const profile = JSON.parse(savedProfile);

        const response = await fetch(
          `${API_BASE}/api/career-roadmap`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              skills: analysis.detected_skills || [],
              branch: profile.branch || "",
              career_interests:
                profile.career_interests || [],
              passion: profile.passion || "",
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();

          throw new Error(
            `API error: ${response.status} ${errorData}`
          );
        }

        const data = await response.json();

        setRoadmap(data);
      } catch (err) {
        console.error("Career Roadmap error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, []);

  const selectSkill = (item) => {
    setSelectedSkill(item);

    setTimeout(() => {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const updateSkillStatus = (skill, status) => {
    const updatedStatuses = {
      ...skillStatus,
      [skill]: status,
    };

    setSkillStatus(updatedStatuses);

    localStorage.setItem(
      "resumelens_skill_progress",
      JSON.stringify(updatedStatuses)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              ResumeLens
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Career Roadmap
            </h1>

            <p className="mt-3 text-slate-400">
              Building your personalized career learning roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">
              ResumeLens
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Career Roadmap
            </h1>

            <p className="mt-4 text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-slate-400">
              No roadmap data is available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allSkills = roadmap.roadmap || [];

  const selectedCareerDomains =
    roadmap.career_interests || [];

  const skillsByDomain = {};

  /*
    Group all roadmap skills by their career domain.
  */
  allSkills.forEach((skill) => {
    const domain = skill.career_domain;

    if (!domain) {
      return;
    }

    if (!skillsByDomain[domain]) {
      skillsByDomain[domain] = [];
    }

    skillsByDomain[domain].push(skill);
  });

  /*
    Sort each career domain.

    1. Skills with job-market data come first.
    2. Among skills with data, higher posting count wins.
    3. Among skills with zero data, practical learning_priority wins.
  */
  selectedCareerDomains.forEach((domain) => {
    if (!skillsByDomain[domain]) {
      skillsByDomain[domain] = [];
    }

    skillsByDomain[domain].sort((a, b) => {
      const aHasData =
        Number(a.posting_count || 0) > 0;

      const bHasData =
        Number(b.posting_count || 0) > 0;

      if (aHasData !== bHasData) {
        return aHasData ? -1 : 1;
      }

      if (aHasData && bHasData) {
        return (
          Number(b.posting_count || 0) -
          Number(a.posting_count || 0)
        );
      }

      return (
        Number(a.learning_priority || 999) -
        Number(b.learning_priority || 999)
      );
    });
  });

  /*
    Pick two skills from each selected career domain
    in round-robin order.

    Example:

    Software    -> SQL, Java
    Hardware    -> PCB, Circuit Design
    Embedded    -> Microcontrollers, STM32
  */
  const recommendedSkills = [];

  const recommendationsPerDomain = 2;

  for (
    let round = 0;
    round < recommendationsPerDomain;
    round++
  ) {
    selectedCareerDomains.forEach((domain) => {
      const domainSkills =
        skillsByDomain[domain] || [];

      if (domainSkills[round]) {
        recommendedSkills.push(
          domainSkills[round]
        );
      }
    });
  }

  const isRecommended = (skill) =>
    recommendedSkills.some(
      (recommended) =>
        recommended.skill === skill.skill
    );

  const highPriority = allSkills.filter(
    (item) =>
      item.priority === "High" &&
      !isRecommended(item)
  );

  const mediumPriority = allSkills.filter(
    (item) =>
      item.priority === "Medium" &&
      !isRecommended(item)
  );

  const lowPriority = allSkills.filter(
    (item) =>
      item.priority === "Low" &&
      !isRecommended(item)
  );

  const limitedData = allSkills.filter(
    (item) =>
      item.priority === "Limited Data" &&
      !isRecommended(item)
  );

  const totalSkills = allSkills.length;

  const completedSkills = allSkills.filter(
    (item) =>
      skillStatus[item.skill] === "Completed"
  ).length;

  const learningSkills = allSkills.filter(
    (item) =>
      skillStatus[item.skill] === "Learning"
  ).length;

  const notStartedSkills =
    totalSkills -
    completedSkills -
    learningSkills;

  const progressPercentage =
  totalSkills > 0
    ? Math.round(
        ((completedSkills + learningSkills * 0.5) /
          totalSkills) *
          100
      )
    : 0;

  const selectedStatus = selectedSkill
    ? skillStatus[selectedSkill.skill] ||
      "Not Started"
    : "Not Started";

  const getRecommendationText = (item) => {
    if (Number(item.posting_count || 0) > 0) {
      if (item.priority === "High") {
        return `Appears in ${Number(
          item.posting_count
        ).toLocaleString()} job postings in the current ResumeLens dataset.`;
      }

      if (item.priority === "Medium") {
        return `Appears in ${Number(
          item.posting_count
        ).toLocaleString()} job postings, showing moderate demand in the current dataset.`;
      }

      return `Appears in ${Number(
        item.posting_count
      ).toLocaleString()} job postings, so it may be worth considering later.`;
    }

    return "This skill is relevant to your selected career direction, but the current ResumeLens job dataset has no matching posting data for it.";
  };

  const getPriorityBadgeClasses = (priority) => {
    if (priority === "High") {
      return "border-red-500/30 bg-red-500/10 text-red-300";
    }

    if (priority === "Medium") {
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }

    if (priority === "Low") {
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    }

    return "border-slate-600 bg-slate-800 text-slate-300";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Career Roadmap
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            A personalized learning roadmap based on your
            resume, career interests, and current skill gaps.
          </p>
        </div>

        {/* CAREER DIRECTION */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
              Your Career Direction
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {roadmap.branch || "Engineering Student"}
            </h2>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {(roadmap.career_interests || []).map(
              (interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300"
                >
                  {interest}
                </span>
              )
            )}
          </div>
        </section>

        {/* PROGRESS */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
              Your Progress
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Career Learning Progress
            </h2>

            <p className="mt-2 text-slate-400">
              Track how far you have progressed through your
              recommended skills.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    Overall Completion
                  </p>

                  <p className="mt-2 text-4xl font-bold text-cyan-400">
                    {progressPercentage}%
                  </p>
                </div>

                <p className="text-sm text-slate-500">
                  {completedSkills}/{totalSkills} completed
                </p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>

            <ProgressCard
              label="Completed"
              value={completedSkills}
            />

            <ProgressCard
              label="Learning"
              value={learningSkills}
            />

            <ProgressCard
              label="Not Started"
              value={notStartedSkills}
            />
          </div>

          {completedSkills === 0 && (
            <p className="mt-6 text-sm text-slate-500">
              Start learning a skill to begin building your
              career progress.
            </p>
          )}
        </section>

        {/* RECOMMENDED LEARNING ORDER */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
              Recommended Learning Order
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Start with these skills
            </h2>

            <p className="mt-2 text-slate-400">
              These recommendations are balanced across your
              selected career directions.
            </p>
          </div>

          {recommendedSkills.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recommendedSkills.map(
                (item, index) => (
                  <button
                    key={item.skill}
                    onClick={() => selectSkill(item)}
                    className="group text-left"
                  >
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-cyan-500/40 hover:bg-slate-900">
                      <div className="flex items-start gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                              {item.skill}
                            </h3>

                            {item.career_domain && (
                              <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                                {item.career_domain}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-cyan-400">
                            {Number(
                              item.posting_count || 0
                            ).toLocaleString()}{" "}
                            job postings
                          </p>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {getRecommendationText(item)}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-cyan-400">
                              Start here
                            </span>

                            <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-slate-400">
                No recommended skills are available for the
                selected career paths.
              </p>
            </div>
          )}
        </section>

        {/* SKILL DETAILS */}
        {selectedSkill && (
          <section
            ref={detailsRef}
            className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
                  Skill Details
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {selectedSkill.skill}
                </h2>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatCard
                label="Job Postings"
                value={Number(
                  selectedSkill.posting_count || 0
                ).toLocaleString()}
              />

              <StatCard
                label="Priority"
                value={selectedSkill.priority}
              />

              <StatCard
                label="Category"
                value={
                  selectedSkill.category || "General"
                }
              />

              <StatCard
                label="Current Status"
                value={selectedStatus}
              />
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
                Your Progress
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Update your learning status as you progress.
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  "Not Started",
                  "Learning",
                  "Completed",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      updateSkillStatus(
                        selectedSkill.skill,
                        status
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      selectedStatus === status
                        ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                        : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
                Recommendation
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {selectedSkill.recommendation}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {getRecommendationText(
                  selectedSkill
                )}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="text-xl font-semibold">
                What to Learn
              </h3>

              <div className="mt-4 space-y-3">
                <LearnStep number="1">
                  Understand the fundamentals of{" "}
                  {selectedSkill.skill}.
                </LearnStep>

                <LearnStep number="2">
                  Practice common concepts and real-world
                  problems.
                </LearnStep>

                <LearnStep number="3">
                  Build a small project using{" "}
                  {selectedSkill.skill}.
                </LearnStep>

                <LearnStep number="4">
                  Add the project and demonstrated skill to
                  your resume.
                </LearnStep>
              </div>
            </div>
          </section>
        )}

        {/* HIGH PRIORITY */}
        <PrioritySection
          title="High Priority"
          description="Skills with strong demand in the current job-posting data."
          items={highPriority}
          badgeClass={getPriorityBadgeClasses("High")}
          onSelect={selectSkill}
          skillStatus={skillStatus}
        />

        {/* MEDIUM PRIORITY */}
        <PrioritySection
          title="Medium Priority"
          description="Skills with moderate demand in the current job-posting data."
          items={mediumPriority}
          badgeClass={getPriorityBadgeClasses("Medium")}
          onSelect={selectSkill}
          skillStatus={skillStatus}
        />

        {/* LOW PRIORITY */}
        <PrioritySection
          title="Low Priority"
          description="Skills with some job-posting evidence but relatively lower demand."
          items={lowPriority}
          badgeClass={getPriorityBadgeClasses("Low")}
          onSelect={selectSkill}
          skillStatus={skillStatus}
        />

        {/* LIMITED DATA */}
        <PrioritySection
          title="Limited Data"
          description="Career-relevant skills for which the current job-posting dataset has no matching posting data."
          items={limitedData}
          badgeClass={getPriorityBadgeClasses(
            "Limited Data"
          )}
          onSelect={selectSkill}
          skillStatus={skillStatus}
          emptyMessage="No limited-data skills remain outside the recommended learning order."
        />
      </div>
    </div>
  );
}

function ProgressCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function LearnStep({ number, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-semibold text-cyan-400">
        {number}
      </div>

      <p className="pt-1 text-sm leading-6 text-slate-400">
        {children}
      </p>
    </div>
  );
}

function PrioritySection({
  title,
  description,
  items,
  badgeClass,
  onSelect,
  skillStatus,
  emptyMessage,
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
          Career Roadmap
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-slate-400">
          {description}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const status =
              skillStatus[item.skill] ||
              "Not Started";

            return (
              <button
                key={item.skill}
                onClick={() => onSelect(item)}
                className="group text-left"
              >
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-cyan-500/30 hover:bg-slate-900">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                        {item.skill}
                      </h3>

                      {item.career_domain && (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.career_domain}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-cyan-400">
                    {Number(
                      item.posting_count || 0
                    ).toLocaleString()}{" "}
                    job postings
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      {status}
                    </span>

                    <span className="text-sm font-medium text-cyan-400 transition group-hover:translate-x-1">
                      View details →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            {emptyMessage ||
              "No skills are available in this section."}
          </p>
        </div>
      )}
    </section>
  );
}

export default CareerRoadmap;