import { useEffect, useRef, useState } from "react";
import ATSResumeCheck from "../components/ATSResumeCheck.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getUserItem,
  setUserItem,
  removeUserItem,
} from "../utils/userStorage.js";
import BulletChecker from "../components/BulletChecker.jsx";

const THEMES = {
  classic: {
    name: "Classic ATS",
    shortName: "Classic",
    description: "Timeless and professional",
    use: "Best for general applications",
    body: "font-sans",
    accentText: "text-slate-900",
    sectionText: "text-slate-900",
    sectionBorder: "border-slate-300",
  },

  modern: {
    name: "Modern ATS",
    shortName: "Modern",
    description: "Contemporary with a tech feel",
    use: "Best for software and engineering",
    body: "font-sans",
    accentText: "text-cyan-700",
    sectionText: "text-cyan-700",
    sectionBorder: "border-cyan-500",
  },

  executive: {
    name: "Executive ATS",
    shortName: "Executive",
    description: "Polished and premium",
    use: "Best for professional roles",
    body: "font-serif",
    accentText: "text-slate-900",
    sectionText: "text-slate-900",
    sectionBorder: "border-slate-800",
  },

  minimal: {
    name: "Minimal ATS",
    shortName: "Minimal",
    description: "Simple, clean and compact",
    use: "Best for focused one-page resumes",
    body: "font-sans",
    accentText: "text-slate-700",
    sectionText: "text-slate-700",
    sectionBorder: "border-slate-200",
  },

  academic: {
    name: "Academic ATS",
    shortName: "Academic",
    description: "Education and project focused",
    use: "Best for students and internships",
    body: "font-sans",
    accentText: "text-blue-800",
    sectionText: "text-blue-800",
    sectionBorder: "border-blue-700",
  },

  professional: {
    name: "Professional ATS",
    shortName: "Professional",
    description: "Balanced, traditional formatting",
    use: "Best for corporate applications",
    body: "font-sans",
    accentText: "text-indigo-900",
    sectionText: "text-indigo-900",
    sectionBorder: "border-indigo-700",
  },

  technical: {
    name: "Technical ATS",
    shortName: "Technical",
    description: "Crisp style for technical profiles",
    use: "Best for engineering and IT roles",
    body: "font-mono",
    accentText: "text-emerald-800",
    sectionText: "text-emerald-800",
    sectionBorder: "border-emerald-600",
  },

  elegant: {
    name: "Elegant ATS",
    shortName: "Elegant",
    description: "Refined typography with subtle accents",
    use: "Best for business and leadership roles",
    body: "font-serif",
    accentText: "text-rose-900",
    sectionText: "text-rose-900",
    sectionBorder: "border-rose-700",
  },
};

const EMPTY_RESUME = {
  theme: "classic",
  pageLayout: "single",

  personal: {
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
  },

  education: [
    {
      id: crypto.randomUUID(),
      degree: "",
      institution: "",
      location: "",
      startYear: "",
      endYear: "",
      details: "",
    },
  ],

  experience: [
    {
      id: crypto.randomUUID(),
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    },
  ],

  projects: [
    {
      id: crypto.randomUUID(),
      title: "",
      technologies: "",
      link: "",
      bullets: [""],
    },
  ],

  skills: "",

  certifications: [
    {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      year: "",
    },
  ],
};

/* ---------------------------------------------------------
   FORM COMPONENTS
--------------------------------------------------------- */

function SectionTitle({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
      />
    </label>
  );
}

/* ---------------------------------------------------------
   MINI THEME PREVIEWS
--------------------------------------------------------- */

function MiniText({ className = "" }) {
  return (
    <div
      className={`rounded-full bg-slate-200 ${className}`}
    />
  );
}

function MiniSection({
  width = "w-16",
  color = "bg-slate-800",
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-1.5 rounded-full ${width} ${color}`}
      />

      <MiniText className="h-1 w-full" />
      <MiniText className="h-1 w-11/12" />
      <MiniText className="h-1 w-4/5" />
    </div>
  );
}

function ThemePreview({ themeId }) {
  const theme = THEMES[themeId] || THEMES.classic;
  const accent = {
    classic: "bg-slate-800",
    modern: "bg-cyan-500",
    executive: "bg-slate-900",
    minimal: "bg-slate-500",
    academic: "bg-blue-700",
    professional: "bg-indigo-700",
    technical: "bg-emerald-600",
    elegant: "bg-rose-700",
  }[themeId] || "bg-slate-800";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-white p-1.5">
        <div className="w-full space-y-1">
          <div className={`h-1.5 w-4/5 rounded-full ${accent}`} />
          <div className="h-px w-full bg-slate-300" />
          <div className="h-1 w-full rounded-full bg-slate-300" />
          <div className="h-1 w-4/5 rounded-full bg-slate-200" />
          <div className={`h-1 w-3/5 rounded-full ${accent} opacity-70`} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white">{theme.shortName}</p>
        <div className="mt-1.5 flex gap-1">
          <span className={`h-1.5 w-7 rounded-full ${accent}`} />
          <span className="h-1.5 w-5 rounded-full bg-slate-600" />
          <span className="h-1.5 w-4 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LIVE RESUME PREVIEW
--------------------------------------------------------- */

function ResumePreview({
  resume,
  theme,
}) {
  const hasEducation =
    resume.education.some(
      (item) =>
        item.degree ||
        item.institution ||
        item.details
    );

  const hasExperience =
    resume.experience.some(
      (item) =>
        item.role ||
        item.company ||
        item.bullets.some((bullet) =>
          bullet.trim()
        )
    );

  const hasProjects =
    resume.projects.some(
      (item) =>
        item.title ||
        item.technologies ||
        item.bullets.some((bullet) =>
          bullet.trim()
        )
    );

  const hasCertifications =
    resume.certifications.some(
      (item) =>
        item.name ||
        item.issuer ||
        item.year
    );

  return (
    <div
      className={`resume-print-preview ${resume.pageLayout === "single" ? "resume-layout-single" : "resume-layout-two"} mx-auto w-full max-w-[800px] bg-white ${resume.pageLayout === "single" ? "px-6 py-6 text-[10px] leading-[1.25]" : "px-8 py-9 text-[11px] leading-5"} text-slate-800 shadow-2xl ${theme.body}`}
    >
      <header className="border-b border-slate-300 pb-4 text-center">
        <h1
          className={`text-3xl font-bold tracking-tight ${theme.accentText}`}
        >
          {resume.personal.name ||
            "Your Name"}
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-600">
          {resume.personal.role ||
            "Professional Title"}
        </p>

        {(resume.personal.email ||
          resume.personal.phone ||
          resume.personal.location) && (
          <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
            {resume.personal.email && (
              <span>
                {resume.personal.email}
              </span>
            )}

            {resume.personal.phone && (
              <span>
                {resume.personal.phone}
              </span>
            )}

            {resume.personal.location && (
              <span>
                {resume.personal.location}
              </span>
            )}
          </p>
        )}

        {(resume.personal.linkedin ||
          resume.personal.github) && (
          <p className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
            {resume.personal.linkedin && (
              <span>
                {resume.personal.linkedin}
              </span>
            )}

            {resume.personal.github && (
              <span>
                {resume.personal.github}
              </span>
            )}
          </p>
        )}
      </header>

      <div className="space-y-5">

        {resume.personal.summary && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Summary
            </h2>

            <p className="mt-2 whitespace-pre-line text-[10px] leading-5 text-slate-700">
              {resume.personal.summary}
            </p>
          </section>
        )}

        {resume.skills && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Skills
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-700">
              {resume.skills}
            </p>
          </section>
        )}

        {hasEducation && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Education
            </h2>

            <div className="mt-2 space-y-3">
              {resume.education
                .filter(
                  (item) =>
                    item.degree ||
                    item.institution ||
                    item.details
                )
                .map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {item.degree && (
                          <p className="text-[11px] font-bold">
                            {item.degree}
                          </p>
                        )}

                        {item.institution && (
                          <p className="text-[10px] text-slate-600">
                            {item.institution}
                            {item.location
                              ? `, ${item.location}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {(item.startYear ||
                        item.endYear) && (
                        <p className="shrink-0 text-[9px] text-slate-500">
                          {item.startYear}
                          {item.startYear &&
                          item.endYear
                            ? " – "
                            : ""}
                          {item.endYear}
                        </p>
                      )}
                    </div>

                    {item.details && (
                      <p className="mt-1 whitespace-pre-line text-[9px] leading-4 text-slate-600">
                        {item.details}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {hasExperience && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Experience
            </h2>

            <div className="mt-2 space-y-3">
              {resume.experience
                .filter(
                  (item) =>
                    item.role ||
                    item.company ||
                    item.bullets.some(
                      (bullet) =>
                        bullet.trim()
                    )
                )
                .map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {item.role && (
                          <p className="text-[11px] font-bold">
                            {item.role}
                          </p>
                        )}

                        {item.company && (
                          <p className="text-[10px] text-slate-600">
                            {item.company}
                            {item.location
                              ? `, ${item.location}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {(item.startDate ||
                        item.endDate) && (
                        <p className="shrink-0 text-[9px] text-slate-500">
                          {item.startDate}
                          {item.startDate &&
                          item.endDate
                            ? " – "
                            : ""}
                          {item.endDate}
                        </p>
                      )}
                    </div>

                    <ul className="mt-1 space-y-1 pl-4">
                      {item.bullets
                        .filter((bullet) =>
                          bullet.trim()
                        )
                        .map(
                          (
                            bullet,
                            index
                          ) => (
                            <li
                              key={index}
                              className="list-disc text-[9px] leading-4 text-slate-700"
                            >
                              {bullet}
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        )}

        {hasProjects && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Projects
            </h2>

            <div className="mt-2 space-y-3">
              {resume.projects
                .filter(
                  (item) =>
                    item.title ||
                    item.technologies ||
                    item.bullets.some(
                      (bullet) =>
                        bullet.trim()
                    )
                )
                .map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {item.title && (
                          <p className="text-[11px] font-bold">
                            {item.title}
                          </p>
                        )}

                        {item.technologies && (
                          <p className="text-[9px] text-slate-500">
                            {item.technologies}
                          </p>
                        )}
                      </div>

                      {item.link && (
                        <p className="max-w-[220px] break-all text-right text-[9px] text-slate-500">
                          {item.link}
                        </p>
                      )}
                    </div>

                    <ul className="mt-1 space-y-1 pl-4">
                      {item.bullets
                        .filter((bullet) =>
                          bullet.trim()
                        )
                        .map(
                          (
                            bullet,
                            index
                          ) => (
                            <li
                              key={index}
                              className="list-disc text-[9px] leading-4 text-slate-700"
                            >
                              {bullet}
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        )}

        {hasCertifications && (
          <section>
            <h2
              className={`mt-5 border-b pb-1 text-[11px] font-bold uppercase tracking-widest ${theme.sectionBorder} ${theme.sectionText}`}
            >
              Certifications
            </h2>

            <div className="mt-2 space-y-2">
              {resume.certifications
                .filter(
                  (item) =>
                    item.name ||
                    item.issuer ||
                    item.year
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <p className="text-[10px] font-medium">
                      {item.name}

                      {item.issuer
                        ? ` — ${item.issuer}`
                        : ""}
                    </p>

                    {item.year && (
                      <p className="shrink-0 text-[9px] text-slate-500">
                        {item.year}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN RESUME BUILDER
--------------------------------------------------------- */

function Resume() {
  const { user } = useAuth();

  const [resume, setResume] =
    useState(EMPTY_RESUME);

  const [savedMessage, setSavedMessage] =
    useState("");

  const [importedSkills, setImportedSkills] =
    useState([]);

  const [resumeLoaded, setResumeLoaded] =
    useState(false);

  const selectedTheme =
    THEMES[resume.theme] || THEMES.classic;

  const resumeLoadedUserId = useRef(null);

  // Load this user's saved resume whenever the
  // logged-in user changes.
  useEffect(() => {
    if (!user?.id) {
      setResumeLoaded(false);
      resumeLoadedUserId.current = null;
      setResume(EMPTY_RESUME);
      setImportedSkills([]);
      return;
    }

    const storageKey = `resumelens_user_${user.id}_resumelens_resume_builder`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const savedData = JSON.parse(stored);

        const normalized = {
          ...EMPTY_RESUME,
          ...savedData,

          theme:
            THEMES[savedData.theme]
              ? savedData.theme
              : "classic",

          pageLayout:
            savedData.pageLayout === "two"
              ? "two"
              : "single",

          personal: {
            ...EMPTY_RESUME.personal,
            ...(savedData.personal || {}),
          },

          education:
            Array.isArray(savedData.education) &&
            savedData.education.length > 0
              ? savedData.education
              : EMPTY_RESUME.education,

          experience:
            Array.isArray(savedData.experience) &&
            savedData.experience.length > 0
              ? savedData.experience
              : EMPTY_RESUME.experience,

          projects:
            Array.isArray(savedData.projects) &&
            savedData.projects.length > 0
              ? savedData.projects
              : EMPTY_RESUME.projects,

          certifications:
            Array.isArray(savedData.certifications) &&
            savedData.certifications.length > 0
              ? savedData.certifications
              : EMPTY_RESUME.certifications,
        };

        setResume(normalized);
      } catch {
        setResume(EMPTY_RESUME);
      }
    } else {
      setResume(EMPTY_RESUME);
    }

    const skills = localStorage.getItem(
      `resumelens_user_${user.id}_resumelens_resume_skills`
    ) ?? getUserItem("resumelens_resume_skills");

    if (skills) {
      try {
        const parsed = JSON.parse(skills);
        setImportedSkills(
          Array.isArray(parsed) ? parsed : []
        );
      } catch {
        setImportedSkills([]);
      }
    } else {
      setImportedSkills([]);
    }

    resumeLoadedUserId.current = user.id;
    setResumeLoaded(true);
  }, [user?.id]);

  // AUTO-SAVE
  // Every change is saved for the logged-in user, so
  // typing and refreshing no longer loses the resume.
  useEffect(() => {
    if (
      !user?.id ||
      !resumeLoaded ||
      resumeLoadedUserId.current !== user.id
    ) {
      return;
    }

    try {
      localStorage.setItem(
        `resumelens_user_${user.id}_resumelens_resume_builder`,
        JSON.stringify(resume)
      );
    } catch (error) {
      console.error("ResumeLens could not autosave the resume:", error);
      setSavedMessage("Autosave failed. Please click Save Resume and check browser storage.");
    }
  }, [resume, resumeLoaded, user?.id]);

  /* -------------------------------------------------------
     PERSONAL
  ------------------------------------------------------- */

  const updatePersonal = (
    field,
    value
  ) => {
    setResume((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  };

  /* -------------------------------------------------------
     EDUCATION
  ------------------------------------------------------- */

  const updateEducation = (
    id,
    field,
    value
  ) => {
    setResume((current) => ({
      ...current,
      education:
        current.education.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        ),
    }));
  };

  const addEducation = () => {
    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: crypto.randomUUID(),
          degree: "",
          institution: "",
          location: "",
          startYear: "",
          endYear: "",
          details: "",
        },
      ],
    }));
  };

  const removeEducation = (id) => {
    setResume((current) => ({
      ...current,
      education:
        current.education.length > 1
          ? current.education.filter(
              (item) => item.id !== id
            )
          : current.education,
    }));
  };

  /* -------------------------------------------------------
     EXPERIENCE
  ------------------------------------------------------- */

  const updateExperience = (
    id,
    field,
    value
  ) => {
    setResume((current) => ({
      ...current,
      experience:
        current.experience.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        ),
    }));
  };

  const updateExperienceBullet = (
    id,
    index,
    value
  ) => {
    setResume((current) => ({
      ...current,
      experience:
        current.experience.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets:
                  item.bullets.map(
                    (
                      bullet,
                      bulletIndex
                    ) =>
                      bulletIndex === index
                        ? value
                        : bullet
                  ),
              }
            : item
        ),
    }));
  };

  const addExperience = () => {
    setResume((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: crypto.randomUUID(),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          bullets: [""],
        },
      ],
    }));
  };

  const removeExperience = (id) => {
    setResume((current) => ({
      ...current,
      experience:
        current.experience.length > 1
          ? current.experience.filter(
              (item) => item.id !== id
            )
          : current.experience,
    }));
  };

  const addExperienceBullet = (id) => {
    setResume((current) => ({
      ...current,
      experience:
        current.experience.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets: [
                  ...item.bullets,
                  "",
                ],
              }
            : item
        ),
    }));
  };

  const removeExperienceBullet = (
    id,
    index
  ) => {
    setResume((current) => ({
      ...current,
      experience:
        current.experience.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets:
                  item.bullets.length > 1
                    ? item.bullets.filter(
                        (
                          _,
                          bulletIndex
                        ) =>
                          bulletIndex !==
                          index
                      )
                    : item.bullets,
              }
            : item
        ),
    }));
  };

  /* -------------------------------------------------------
     PROJECTS
  ------------------------------------------------------- */

  const updateProject = (
    id,
    field,
    value
  ) => {
    setResume((current) => ({
      ...current,
      projects:
        current.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        ),
    }));
  };

  const updateProjectBullet = (
    id,
    index,
    value
  ) => {
    setResume((current) => ({
      ...current,
      projects:
        current.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets:
                  item.bullets.map(
                    (
                      bullet,
                      bulletIndex
                    ) =>
                      bulletIndex === index
                        ? value
                        : bullet
                  ),
              }
            : item
        ),
    }));
  };

  const addProject = () => {
    setResume((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: crypto.randomUUID(),
          title: "",
          technologies: "",
          link: "",
          bullets: [""],
        },
      ],
    }));
  };

  const removeProject = (id) => {
    setResume((current) => ({
      ...current,
      projects:
        current.projects.length > 1
          ? current.projects.filter(
              (item) => item.id !== id
            )
          : current.projects,
    }));
  };

  const addProjectBullet = (id) => {
    setResume((current) => ({
      ...current,
      projects:
        current.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets: [
                  ...item.bullets,
                  "",
                ],
              }
            : item
        ),
    }));
  };

  const removeProjectBullet = (
    id,
    index
  ) => {
    setResume((current) => ({
      ...current,
      projects:
        current.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                bullets:
                  item.bullets.length > 1
                    ? item.bullets.filter(
                        (
                          _,
                          bulletIndex
                        ) =>
                          bulletIndex !==
                          index
                      )
                    : item.bullets,
              }
            : item
        ),
    }));
  };

  /* -------------------------------------------------------
     CERTIFICATIONS
  ------------------------------------------------------- */

  const updateCertification = (
    id,
    field,
    value
  ) => {
    setResume((current) => ({
      ...current,
      certifications:
        current.certifications.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const addCertification = () => {
    setResume((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        {
          id: crypto.randomUUID(),
          name: "",
          issuer: "",
          year: "",
        },
      ],
    }));
  };

  const removeCertification = (
    id
  ) => {
    setResume((current) => ({
      ...current,
      certifications:
        current.certifications.length > 1
          ? current.certifications.filter(
              (item) =>
                item.id !== id
            )
          : current.certifications,
    }));
  };

  /* -------------------------------------------------------
     THEME
  ------------------------------------------------------- */

  const selectTheme = (themeId) => {
    setResume((current) => ({
      ...current,
      theme: themeId,
    }));

    setSavedMessage(
      `${THEMES[themeId].name} selected.`
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 1800);
  };

  /* -------------------------------------------------------
     SAVE
  ------------------------------------------------------- */

  const handleSave = () => {
    if (!user?.id) {
      setSavedMessage(
        "Please sign in before saving your resume."
      );

      setTimeout(() => {
        setSavedMessage("");
      }, 2500);

      return;
    }

    try {
      setUserItem(
        "resumelens_resume_builder",
        JSON.stringify(resume)
      );
    } catch (error) {
      console.error("ResumeLens could not save the resume:", error);
      setSavedMessage("Save failed. Please try again.");
      return;
    }

    setSavedMessage(
      "Resume saved successfully."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  /* -------------------------------------------------------
     IMPORT DETECTED SKILLS
  ------------------------------------------------------- */

  const importDetectedSkills = () => {
    if (importedSkills.length === 0) {
      return;
    }

    setResume((current) => ({
      ...current,
      skills: importedSkills.join(", "),
    }));

    setSavedMessage(
      "Detected skills imported into your resume."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  /* -------------------------------------------------------
     CLEAR
  ------------------------------------------------------- */

  const clearBuilder = () => {
    const confirmed =
      window.confirm(
        "Clear all Resume Builder data?"
      );

    if (!confirmed) {
      return;
    }

    const freshResume = {
      ...EMPTY_RESUME,

      theme: "classic",

      education: [
        {
          id: crypto.randomUUID(),
          degree: "",
          institution: "",
          location: "",
          startYear: "",
          endYear: "",
          details: "",
        },
      ],

      experience: [
        {
          id: crypto.randomUUID(),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          bullets: [""],
        },
      ],

      projects: [
        {
          id: crypto.randomUUID(),
          title: "",
          technologies: "",
          link: "",
          bullets: [""],
        },
      ],

      certifications: [
        {
          id: crypto.randomUUID(),
          name: "",
          issuer: "",
          year: "",
        },
      ],
    };

    setResume(freshResume);

    if (user?.id) {
      localStorage.removeItem(
        `resumelens_user_${user.id}_resumelens_resume_builder`
      );
    }

    setSavedMessage(
      "Resume Builder cleared."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        .resume-layout-single section {
          margin-top: 0.55rem !important;
        }

        .resume-layout-single header {
          padding-bottom: 0.55rem !important;
        }

        .resume-layout-single h1 {
          font-size: 1.55rem !important;
        }

        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .resume-print-preview,
          .resume-print-preview * {
            visibility: visible !important;
          }

          .resume-print-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                ResumeLens
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Resume Builder
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Build a professional resume, choose a
                visual style, and see the final result
                while you build.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearBuilder}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-cyan-500/30 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Print / Save PDF
              </button>

            </div>
          </div>

          {savedMessage && (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
              {savedMessage}
            </div>
          )}

          {/* ATS EXPLANATION */}

          <section className="mt-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/80 to-slate-900/80 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="max-w-3xl">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-lg text-cyan-400">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
                      ATS-friendly by design
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-white">
                      Clean enough for software. Good enough for humans.
                    </h2>
                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  ResumeLens keeps the actual resume simple:
                  one column, readable text, standard sections,
                  and no decorative graphics inside the resume.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  "Single column",
                  "Text-first",
                  "Easy to scan",
                  "No graphics",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-center text-xs font-medium text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* THEME SELECTOR */}

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
                  Resume Style Studio
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  Choose how your resume should feel
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Each style below is a live visual concept.
                  Pick one and the full resume preview will
                  change automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
                  Selected theme
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedTheme.name}
                </p>
              </div>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {Object.entries(THEMES).map(
                ([themeId, theme]) => {
                  const selected =
                    resume.theme === themeId;

                  return (
                    <button
                      key={themeId}
                      type="button"
                      onClick={() =>
                        selectTheme(themeId)
                      }
                      className={`group relative rounded-2xl border p-3 text-left transition-all duration-200 ${
                        selected
                          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                          : "border-slate-800 bg-slate-950/70 hover:-translate-y-1 hover:border-slate-600 hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
                      }`}
                    >

                      <div className="relative">
                        <ThemePreview themeId={themeId} />
                        {selected && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950">✓</span>
                        )}
                      </div>

                      <div className="relative mt-3 px-1">

                        <h3
                          className={`text-sm font-bold ${
                            selected
                              ? "text-cyan-300"
                              : "text-white"
                          }`}
                        >
                          {theme.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {theme.description}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              selected
                                ? "bg-cyan-400"
                                : "bg-slate-600"
                            }`}
                          />

                          <span className="text-[11px] text-slate-500">
                            {theme.use}
                          </span>
                        </div>

                        <div
                          className={`mt-3 rounded-xl px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider ${
                            selected
                              ? "bg-cyan-500/10 text-cyan-300"
                              : "bg-slate-900 text-slate-500"
                          }`}
                        >
                          {selected
                            ? "Currently Selected"
                            : "Click to Select"}
                        </div>

                      </div>
                    </button>
                  );
                }
              )}

            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-semibold text-white">
                  What changes when I select a theme?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Typography, accent treatment, section styling
                  and spacing change. Your content and ATS-safe
                  one-column structure stay the same.
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-xs font-medium text-cyan-300">
                ATS-safe structure
              </span>

            </div>

          </section>

          {/* -------------------------------------------------
              ATS RESUME CHECK
          ------------------------------------------------- */}

          <ATSResumeCheck resume={resume} />

          {/* BUILDER + PREVIEW */}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

            {/* BUILDER */}

            <div className="space-y-6">

              {/* PERSONAL DETAILS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Personal Details"
                  description="Basic information that appears at the top of your resume."
                />

                <div className="grid gap-4 md:grid-cols-2">

                  <Field
                    label="Full Name"
                    value={resume.personal.name}
                    onChange={(event) =>
                      updatePersonal(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Your Full Name"
                  />

                  <Field
                    label="Professional Title"
                    value={resume.personal.role}
                    onChange={(event) =>
                      updatePersonal(
                        "role",
                        event.target.value
                      )
                    }
                    placeholder="Electronics & Computer Engineering Student"
                  />

                  <Field
                    label="Email"
                    type="email"
                    value={resume.personal.email}
                    onChange={(event) =>
                      updatePersonal(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                  />

                  <Field
                    label="Phone"
                    value={resume.personal.phone}
                    onChange={(event) =>
                      updatePersonal(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />

                  <Field
                    label="Location"
                    value={resume.personal.location}
                    onChange={(event) =>
                      updatePersonal(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Bagalkot, Karnataka"
                  />

                  <Field
                    label="LinkedIn"
                    value={resume.personal.linkedin}
                    onChange={(event) =>
                      updatePersonal(
                        "linkedin",
                        event.target.value
                      )
                    }
                    placeholder="linkedin.com/in/yourname"
                  />

                  <Field
                    label="GitHub"
                    value={resume.personal.github}
                    onChange={(event) =>
                      updatePersonal(
                        "github",
                        event.target.value
                      )
                    }
                    placeholder="github.com/yourname"
                  />

                </div>

                <div className="mt-4">
                  <TextArea
                    label="Professional Summary"
                    value={
                      resume.personal.summary
                    }
                    onChange={(event) =>
                      updatePersonal(
                        "summary",
                        event.target.value
                      )
                    }
                    placeholder="Briefly describe your background, strongest skills and career direction."
                    rows={5}
                  />
                </div>
              </section>

              {/* SKILLS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Skills"
                  description="Add technical and professional skills relevant to your target roles."
                />

                {importedSkills.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                    <p className="text-sm font-medium text-cyan-400">
                      Skills detected by ResumeLens
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {importedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={
                        importDetectedSkills
                      }
                      className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Import Detected Skills
                    </button>

                  </div>
                )}

                <TextArea
                  label="Your Skills"
                  value={resume.skills}
                  onChange={(event) =>
                    setResume((current) => ({
                      ...current,
                      skills:
                        event.target.value,
                    }))
                  }
                  placeholder="Python, C, ESP32, Embedded Systems, Git, HTML, CSS"
                  rows={5}
                />

                <p className="mt-2 text-xs text-slate-600">
                  Separate skills with commas.
                </p>
              </section>

              {/* EDUCATION */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Education"
                  description="Add your engineering degree and academic background."
                />

                <div className="space-y-6">
                  {resume.education.map(
                    (education, index) => (
                      <div
                        key={education.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                      >

                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            Education{" "}
                            {index + 1}
                          </h3>

                          {resume.education
                            .length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeEducation(
                                  education.id
                                )
                              }
                              className="text-xs text-slate-500 transition hover:text-red-400"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                          <Field
                            label="Degree"
                            value={
                              education.degree
                            }
                            onChange={(event) =>
                              updateEducation(
                                education.id,
                                "degree",
                                event.target.value
                              )
                            }
                            placeholder="B.E. Electronics & Computer Engineering"
                          />

                          <Field
                            label="Institution"
                            value={
                              education.institution
                            }
                            onChange={(event) =>
                              updateEducation(
                                education.id,
                                "institution",
                                event.target.value
                              )
                            }
                            placeholder="College / University"
                          />

                          <Field
                            label="Location"
                            value={
                              education.location
                            }
                            onChange={(event) =>
                              updateEducation(
                                education.id,
                                "location",
                                event.target.value
                              )
                            }
                            placeholder="City, State"
                          />

                          <div className="grid grid-cols-2 gap-4">

                            <Field
                              label="Start"
                              value={
                                education.startYear
                              }
                              onChange={(event) =>
                                updateEducation(
                                  education.id,
                                  "startYear",
                                  event.target.value
                                )
                              }
                              placeholder="2024"
                            />

                            <Field
                              label="End"
                              value={
                                education.endYear
                              }
                              onChange={(event) =>
                                updateEducation(
                                  education.id,
                                  "endYear",
                                  event.target.value
                                )
                              }
                              placeholder="2028"
                            />

                          </div>
                        </div>

                        <div className="mt-4">
                          <TextArea
                            label="Details"
                            value={
                              education.details
                            }
                            onChange={(event) =>
                              updateEducation(
                                education.id,
                                "details",
                                event.target.value
                              )
                            }
                            placeholder="CGPA, relevant coursework, academic achievements..."
                            rows={3}
                          />
                        </div>

                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={addEducation}
                  className="mt-5 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  + Add Education
                </button>

              </section>

              {/* EXPERIENCE */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Experience"
                  description="Add internships, work experience, leadership roles, or relevant positions."
                />

                <div className="space-y-6">
                  {resume.experience.map(
                    (experience, index) => (
                      <div
                        key={experience.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                      >

                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            Experience{" "}
                            {index + 1}
                          </h3>

                          {resume.experience
                            .length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeExperience(
                                  experience.id
                                )
                              }
                              className="text-xs text-slate-500 transition hover:text-red-400"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                          <Field
                            label="Role"
                            value={
                              experience.role
                            }
                            onChange={(event) =>
                              updateExperience(
                                experience.id,
                                "role",
                                event.target.value
                              )
                            }
                            placeholder="Software Intern"
                          />

                          <Field
                            label="Company"
                            value={
                              experience.company
                            }
                            onChange={(event) =>
                              updateExperience(
                                experience.id,
                                "company",
                                event.target.value
                              )
                            }
                            placeholder="Company Name"
                          />

                          <Field
                            label="Location"
                            value={
                              experience.location
                            }
                            onChange={(event) =>
                              updateExperience(
                                experience.id,
                                "location",
                                event.target.value
                              )
                            }
                            placeholder="Bengaluru, Karnataka"
                          />

                          <div className="grid grid-cols-2 gap-4">

                            <Field
                              label="Start"
                              value={
                                experience.startDate
                              }
                              onChange={(event) =>
                                updateExperience(
                                  experience.id,
                                  "startDate",
                                  event.target.value
                                )
                              }
                              placeholder="Jun 2026"
                            />

                            <Field
                              label="End"
                              value={
                                experience.endDate
                              }
                              onChange={(event) =>
                                updateExperience(
                                  experience.id,
                                  "endDate",
                                  event.target.value
                                )
                              }
                              placeholder="Aug 2026"
                            />

                          </div>
                        </div>

                        <div className="mt-5">

                          <p className="text-sm font-medium text-slate-300">
                            Achievement Bullets
                          </p>

                          <div className="mt-3 space-y-3">

                            {experience.bullets.map(
                              (
                                bullet,
                                bulletIndex
                              ) => (
                                <div
                                  key={
                                    bulletIndex
                                  }
                                  className="flex gap-2"
                                >

                                  <input
                                    value={
                                      bullet
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateExperienceBullet(
                                        experience.id,
                                        bulletIndex,
                                        event.target.value
                                      )
                                    }
                                    placeholder="Developed..., implemented..., improved..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                                  />

                                  {experience
                                    .bullets
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeExperienceBullet(
                                          experience.id,
                                          bulletIndex
                                        )
                                      }
                                      className="rounded-xl px-3 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                                    >
                                      ×
                                    </button>
                                  )}

                                </div>
                              )
                            )}

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addExperienceBullet(
                                experience.id
                              )
                            }
                            className="mt-3 text-sm text-cyan-400 transition hover:text-cyan-300"
                          >
                            + Add Bullet
                          </button>

                        </div>

                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={addExperience}
                  className="mt-5 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  + Add Experience
                </button>

              </section>

              {/* PROJECTS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Projects"
                  description="Showcase projects that demonstrate practical skills and problem solving."
                />

                <div className="space-y-6">
                  {resume.projects.map(
                    (project, index) => (
                      <div
                        key={project.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                      >

                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            Project{" "}
                            {index + 1}
                          </h3>

                          {resume.projects
                            .length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeProject(
                                  project.id
                                )
                              }
                              className="text-xs text-slate-500 transition hover:text-red-400"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                          <Field
                            label="Project Title"
                            value={
                              project.title
                            }
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="ROVER-X Smart Inspection Robot"
                          />

                          <Field
                            label="Technologies"
                            value={
                              project.technologies
                            }
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "technologies",
                                event.target.value
                              )
                            }
                            placeholder="ESP32, Python, IoT, Sensors"
                          />

                          <div className="md:col-span-2">
                            <Field
                              label="Project Link"
                              value={
                                project.link
                              }
                              onChange={(event) =>
                                updateProject(
                                  project.id,
                                  "link",
                                  event.target.value
                                )
                              }
                              placeholder="github.com/yourname/project"
                            />
                          </div>

                        </div>

                        <div className="mt-5">

                          <p className="text-sm font-medium text-slate-300">
                            Project Bullets
                          </p>

                          <div className="mt-3 space-y-3">

                            {project.bullets.map(
                              (
                                bullet,
                                bulletIndex
                              ) => (
                                <div
                                  key={
                                    bulletIndex
                                  }
                                  className="flex gap-2"
                                >

                                  <input
                                    value={
                                      bullet
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateProjectBullet(
                                        project.id,
                                        bulletIndex,
                                        event.target.value
                                      )
                                    }
                                    placeholder="Built..., designed..., implemented..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                                  />

                                  {project
                                    .bullets
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeProjectBullet(
                                          project.id,
                                          bulletIndex
                                        )
                                      }
                                      className="rounded-xl px-3 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                                    >
                                      ×
                                    </button>
                                  )}

                                </div>
                              )
                            )}

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addProjectBullet(
                                project.id
                              )
                            }
                            className="mt-3 text-sm text-cyan-400 transition hover:text-cyan-300"
                          >
                            + Add Bullet
                          </button>

                        </div>

                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={addProject}
                  className="mt-5 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  + Add Project
                </button>

              </section>

              {/* CERTIFICATIONS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionTitle
                  title="Certifications"
                  description="Add relevant certifications, courses, workshops, or credentials."
                />

                <div className="space-y-5">

                  {resume.certifications.map(
                    (
                      certification,
                      index
                    ) => (
                      <div
                        key={
                          certification.id
                        }
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                      >

                        <div className="flex items-center justify-between">

                          <h3 className="font-semibold text-white">
                            Certification{" "}
                            {index + 1}
                          </h3>

                          {resume
                            .certifications
                            .length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeCertification(
                                  certification.id
                                )
                              }
                              className="text-xs text-slate-500 transition hover:text-red-400"
                            >
                              Remove
                            </button>
                          )}

                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">

                          <Field
                            label="Certification"
                            value={
                              certification.name
                            }
                            onChange={(event) =>
                              updateCertification(
                                certification.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Python Certification"
                          />

                          <Field
                            label="Issuer"
                            value={
                              certification.issuer
                            }
                            onChange={(event) =>
                              updateCertification(
                                certification.id,
                                "issuer",
                                event.target.value
                              )
                            }
                            placeholder="NPTEL"
                          />

                          <Field
                            label="Year"
                            value={
                              certification.year
                            }
                            onChange={(event) =>
                              updateCertification(
                                certification.id,
                                "year",
                                event.target.value
                              )
                            }
                            placeholder="2026"
                          />

                        </div>

                      </div>
                    )
                  )}

                </div>

                <button
                  type="button"
                  onClick={addCertification}
                  className="mt-5 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  + Add Certification
                </button>

              </section>

            </div>

            {/* LIVE PREVIEW */}

            <div className="lg:sticky lg:top-24 lg:self-start">

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">

                <div className="mb-5 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
                      Live Preview
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {selectedTheme.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
                      ATS-friendly
                    </span>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Save Resume
                    </button>
                  </div>

                </div>

                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Resume length</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResume((current) => ({ ...current, pageLayout: "single" }))}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${resume.pageLayout === "single" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
                    >
                      1 page
                    </button>
                    <button
                      type="button"
                      onClick={() => setResume((current) => ({ ...current, pageLayout: "two" }))}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${resume.pageLayout === "two" ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
                    >
                      2 pages
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Choose a compact one-page layout or a roomier two-page layout. Very long content may still flow to another printed page.</p>
                </div>

                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      ✦
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedTheme.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Your resume updates live as you type.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-auto rounded-xl">
                  <ResumePreview
                    resume={resume}
                    theme={selectedTheme}
                  />
                </div>

              </section>

            </div>

          </div>
        </div>
      </main>
    </>
  );
}

export default Resume;
