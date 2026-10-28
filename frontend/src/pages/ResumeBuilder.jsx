import { useEffect, useState } from "react";

const STORAGE_KEY = "resumelens_resume_builder";
const DATA_KEY = "resume_builder";

const API_URL = "http://127.0.0.1:8000";

const initialData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
};

function getToken() {
  return localStorage.getItem("resumelens_auth_token");
}

function ResumeBuilder() {
  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch {
      return initialData;
    }
  });

  const [savedMessage, setSavedMessage] = useState("Ready to edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the resume from the signed-in user's database.
  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setSavedMessage("Sign in to sync your resume");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          if (!cancelled) setSavedMessage("Please sign in again");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load saved resume");
        }

        const result = await response.json();
        const savedItem = result.items?.find(
          (item) => item.key === DATA_KEY
        );

        if (savedItem && !cancelled) {
          const serverResume = {
            ...initialData,
            ...JSON.parse(savedItem.value),
          };

          setResume(serverResume);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverResume));
          setSavedMessage("Resume loaded from your account");
        } else if (!savedItem && !cancelled) {
          setSavedMessage("Ready to save to your account");
        }
      } catch (error) {
        console.error("Resume loading error:", error);
        if (!cancelled) setSavedMessage("Using browser-saved resume");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResume();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep a browser copy as a backup while editing.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    } catch {
      setSavedMessage("Unable to save browser backup");
    }
  }, [resume]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setResume((previous) => ({ ...previous, [name]: value }));
    setSavedMessage("Unsaved changes");
  };

  const handleSave = async () => {
    const token = getToken();

    if (!token) {
      setSavedMessage("Please sign in to save to your account");
      return;
    }

    setSaving(true);
    setSavedMessage("Saving to your account...");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));

      const response = await fetch(`${API_URL}/api/data`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: DATA_KEY,
          value: JSON.stringify(resume),
        }),
      });

      if (response.status === 401) {
        setSavedMessage("Session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Database save failed");
      }

      setSavedMessage("Resume saved to your account");
      
      // Record the save for admin activity analytics.
      await fetch(`${API_URL}/api/activity`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "resume_saved",
          page: "/resume-builder",
        }),
      }).catch(() => {});
    } catch (error) {
      console.error("Resume save error:", error);
      setSavedMessage("Database save failed; browser copy retained");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to clear your resume?")) {
      return;
    }

    const token = getToken();

    setResume({ ...initialData });
    localStorage.removeItem(STORAGE_KEY);

    if (token) {
      try {
        const response = await fetch(
          `${API_URL}/api/data/${encodeURIComponent(DATA_KEY)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setSavedMessage("Cleared locally; database deletion failed");
          return;
        }

        setSavedMessage("Resume cleared from your account");
      } catch {
        setSavedMessage("Cleared locally; database unavailable");
      }
    } else {
      setSavedMessage("Resume cleared from this browser");
    }
  };

  const fields = [
    { name: "name", label: "Full Name", placeholder: "Enter your full name" },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      type: "email",
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
    },
    { name: "location", label: "Location", placeholder: "City, State" },
    {
      name: "summary",
      label: "Career Objective / Summary",
      placeholder: "Write a short professional summary...",
      multiline: true,
    },
    {
      name: "education",
      label: "Education",
      placeholder: "Degree, college, year, CGPA...",
      multiline: true,
    },
    {
      name: "skills",
      label: "Technical Skills",
      placeholder: "C, Python, ESP32, Embedded Systems...",
      multiline: true,
    },
    {
      name: "projects",
      label: "Projects",
      placeholder: "Project title, technologies used, and achievements...",
      multiline: true,
    },
    {
      name: "experience",
      label: "Internships / Experience",
      placeholder: "Describe your internship or work experience...",
      multiline: true,
    },
    {
      name: "certifications",
      label: "Certifications",
      placeholder: "Course or certification name, provider, year...",
      multiline: true,
    },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
        Create
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Resume Builder
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Build your professional, ATS-friendly resume step by step.
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300">
          {loading ? "Loading resume..." : savedMessage}
        </span>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="mt-8">
        <div className="grid gap-5 rounded-2xl border border-slate-700/70 bg-slate-900/40 p-5 sm:grid-cols-2 sm:p-7">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.multiline ? "sm:col-span-2" : ""}
            >
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {field.label}
              </label>

              {field.multiline ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={resume[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={4}
                  className={inputClass}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  value={resume[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Resume"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 font-semibold text-purple-200 transition hover:bg-purple-400/20 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Clear Resume
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Your resume is backed up in this browser. Select Save Resume to sync
          it with your signed-in account so it can be restored on another
          session or device.
        </p>
      </form>
    </section>
  );
}

export default ResumeBuilder;
