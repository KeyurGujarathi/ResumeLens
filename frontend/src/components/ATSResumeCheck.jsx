import { useMemo } from "react";

function CheckRow({
  label,
  description,
  passed,
  partial = false,
}) {
  const status = passed
    ? "Good"
    : partial
    ? "Improve"
    : "Missing";

  const statusClass = passed
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : partial
    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
    : "border-red-500/20 bg-red-500/10 text-red-400";

  const icon = passed
    ? "✓"
    : partial
    ? "!"
    : "×";

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${statusClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-white">
            {label}
          </p>

          <span
            className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass}`}
          >
            {status}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ATSResumeCheck({ resume }) {
  const analysis = useMemo(() => {
    const personal = resume?.personal || {};

    const education = Array.isArray(
      resume?.education
    )
      ? resume.education
      : [];

    const experience = Array.isArray(
      resume?.experience
    )
      ? resume.experience
      : [];

    const projects = Array.isArray(
      resume?.projects
    )
      ? resume.projects
      : [];

    const certifications = Array.isArray(
      resume?.certifications
    )
      ? resume.certifications
      : [];

    const hasName =
      personal.name?.trim().length >= 2;

    const hasEmail =
      personal.email?.trim().length > 3 &&
      personal.email.includes("@");

    const hasPhone =
      personal.phone?.trim().length >= 7;

    const hasTitle =
      personal.role?.trim().length >= 3;

    const summaryLength =
      personal.summary?.trim().length || 0;

    const hasSummary =
      summaryLength >= 40;

    const summaryPartial =
      summaryLength >= 15 &&
      summaryLength < 40;

    const skillValues =
      resume?.skills
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) || [];

    const hasSkills =
      skillValues.length >= 3;

    const partialSkills =
      skillValues.length > 0 &&
      skillValues.length < 3;

    const validEducation =
      education.filter(
        (item) =>
          item.degree?.trim() ||
          item.institution?.trim()
      );

    const hasEducation =
      validEducation.length > 0;

    const validProjects =
      projects.filter(
        (item) =>
          item.title?.trim() ||
          item.bullets?.some((bullet) =>
            bullet?.trim()
          )
      );

    const hasProjects =
      validProjects.length > 0;

    const validExperience =
      experience.filter(
        (item) =>
          item.role?.trim() ||
          item.company?.trim() ||
          item.bullets?.some((bullet) =>
            bullet?.trim()
          )
      );

    const hasExperience =
      validExperience.length > 0;

    const hasLinkedIn =
      personal.linkedin?.trim().length > 4;

    const hasGitHub =
      personal.github?.trim().length > 4;

    const hasProfileLinks =
      hasLinkedIn || hasGitHub;

    const allBullets = [
      ...experience.flatMap(
        (item) => item.bullets || []
      ),
      ...projects.flatMap(
        (item) => item.bullets || []
      ),
    ].filter((bullet) =>
      bullet?.trim()
    );

    const hasActionVerb =
      allBullets.some((bullet) =>
        /^(built|developed|designed|implemented|created|engineered|optimized|automated|analyzed|led|managed|integrated|configured|tested|deployed|improved|developed|programmed|created)\b/i.test(
          bullet.trim()
        )
      );

    const hasMetric =
      allBullets.some((bullet) =>
        /\d+%|\d+\+|\b\d+\b|\b\d+x\b|\b\d+\s?(ms|sec|seconds|minutes|hours|days|weeks|months)\b/i.test(
          bullet
        )
      );

    const checks = [
      {
        label: "Full name",
        description:
          "Add your real name so recruiters and resume systems can identify the document correctly.",
        passed: hasName,
        points: 10,
      },
      {
        label: "Contact information",
        description:
          "Add a valid email and phone number so recruiters can contact you.",
        passed: hasEmail && hasPhone,
        partial: hasEmail || hasPhone,
        points: 10,
      },
      {
        label: "Professional title",
        description:
          "Use a clear title that describes your current profile or target direction.",
        passed: hasTitle,
        points: 10,
      },
      {
        label: "Professional summary",
        description:
          "A concise summary helps explain who you are and what kind of role you are targeting.",
        passed: hasSummary,
        partial: summaryPartial,
        points: 10,
      },
      {
        label: "Skills",
        description:
          "List several relevant technical or professional skills rather than leaving this section empty.",
        passed: hasSkills,
        partial: partialSkills,
        points: 10,
      },
      {
        label: "Education",
        description:
          "Students should include their degree and institution prominently.",
        passed: hasEducation,
        points: 15,
      },
      {
        label: "Projects or experience",
        description:
          "Show practical work. For students, strong projects can be just as important as formal experience.",
        passed:
          hasProjects || hasExperience,
        points: 15,
      },
      {
        label: "Professional links",
        description:
          "LinkedIn or GitHub can help recruiters verify your professional work.",
        passed: hasProfileLinks,
        points: 5,
      },
      {
        label: "Action-oriented bullets",
        description:
          "Use strong verbs such as Built, Developed, Implemented, Designed or Optimized.",
        passed: hasActionVerb,
        points: 10,
      },
      {
        label: "Measurable impact",
        description:
          "Add numbers, percentages, scale or measurable results where they genuinely exist.",
        passed: hasMetric,
        points: 5,
      },
    ];

    const score = checks.reduce(
      (total, check) => {
        if (check.passed) {
          return total + check.points;
        }

        if (check.partial) {
          return (
            total +
            Math.round(check.points * 0.5)
          );
        }

        return total;
      },
      0
    );

    const passedCount =
      checks.filter(
        (check) => check.passed
      ).length;

    const criticalMissing = checks.filter(
      (check) =>
        !check.passed &&
        !check.partial &&
        [
          "Full name",
          "Contact information",
          "Education",
          "Projects or experience",
        ].includes(check.label)
    ).length;

    let level = "Needs Work";
    let message =
      "Add the missing essentials before exporting your resume.";

    if (
      score >= 85 &&
      criticalMissing === 0
    ) {
      level = "Strong";
      message =
        "Your resume structure is in good shape. Review the remaining suggestions before exporting.";
    } else if (
      score >= 70 &&
      criticalMissing === 0
    ) {
      level = "Almost Ready";
      message =
        "Your resume has the important sections. A few improvements can make it stronger.";
    }

    return {
      checks,
      score,
      passedCount,
      totalChecks: checks.length,
      level,
      message,
      hasName,
      hasEmail,
      hasPhone,
      hasTitle,
      hasSummary,
      hasSkills,
      hasEducation,
      hasProjects,
      hasExperience,
      hasProfileLinks,
    };
  }, [resume]);

  const scoreRingClass =
    analysis.score >= 85
      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
      : analysis.score >= 70
      ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
      : "text-red-400 border-red-500/20 bg-red-500/10";

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens Check
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Resume readiness
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            A quick ResumeLens content check before you
            export. It looks for important resume sections,
            useful contact information and stronger
            content signals.
          </p>
        </div>

        <div
          className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border ${scoreRingClass}`}
        >
          <span className="text-3xl font-bold">
            {analysis.score}
          </span>

          <span className="mt-0.5 text-[10px] uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">
              {analysis.level}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {analysis.message}
            </p>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
            {analysis.passedCount} /{" "}
            {analysis.totalChecks} checks passed
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              analysis.score >= 85
                ? "bg-emerald-500"
                : analysis.score >= 70
                ? "bg-amber-400"
                : "bg-red-500"
            }`}
            style={{
              width: `${analysis.score}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {analysis.checks.map(
          (check) => (
            <CheckRow
              key={check.label}
              label={check.label}
              description={
                check.description
              }
              passed={check.passed}
              partial={check.partial}
            />
          )
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            ✓
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              ATS-friendly structure
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your ResumeLens themes use a clean,
              single-column, text-first structure. This
              check focuses on your resume content; it is not
              a guarantee of how any particular employer's ATS
              will score the document.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ATSResumeCheck;