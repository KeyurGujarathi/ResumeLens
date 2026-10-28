import API_BASE from "../utils/api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getActiveUserId,
  getUserItem,
  setUserItem,
} from "../utils/userStorage.js";

const BRANCHES = [
  "Computer Science Engineering",
  "Information Science Engineering",
  "Electronics & Computer Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Other",
];

const BRANCH_INTERESTS = {
  "Computer Science Engineering": [
    "Software Development",
    "Web Development",
    "Mobile Development",
    "AI / Machine Learning",
    "Data Science",
    "Cybersecurity",
    "Cloud / DevOps",
  ],

  "Information Science Engineering": [
    "Software Development",
    "Web Development",
    "Mobile Development",
    "AI / Machine Learning",
    "Data Science",
    "Cybersecurity",
    "Cloud / DevOps",
  ],

  "Electronics & Computer Engineering": [
    "Software / IT",
    "Electronics / Hardware",
    "Embedded / IoT / Robotics",
    "VLSI / Semiconductor",
    "AI / ML / Data",
    "Cloud / DevOps",
  ],

  "Electronics & Communication Engineering": [
    "Embedded Systems",
    "IoT",
    "Robotics",
    "Electronics / Hardware",
    "VLSI",
    "Communication Systems",
    "AI / Machine Learning",
    "Software Development",
  ],

  "Electrical & Electronics Engineering": [
    "Embedded Systems",
    "IoT",
    "Electronics / Hardware",
    "Electrical / Core",
    "Power Electronics",
    "Control Systems",
    "Robotics",
  ],

  "Mechanical Engineering": [
    "Mechanical Design",
    "Manufacturing",
    "Automotive",
    "Robotics",
    "CAD / CAE",
    "Product Design",
  ],

  "Civil Engineering": [
    "Construction / Structural",
    "Structural Design",
    "Transportation",
    "Geotechnical",
    "Environmental Engineering",
    "Surveying",
  ],

  Other: [
    "Software Development",
    "Embedded Systems",
    "IoT",
    "Robotics",
    "AI / Machine Learning",
    "Data Science",
    "Electronics / Hardware",
    "VLSI",
    "Mechanical Design",
    "Manufacturing",
    "Construction / Structural",
    "Other",
  ],
};

const PROFILE_STORAGE_KEY =
  "resumelens_career_profile";

function CareerProfile() {
  const navigate = useNavigate();

  const [branch, setBranch] = useState("");
  const [interests, setInterests] = useState([]);
  const [passion, setPassion] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Restore the logged-in user's profile when this page opens.
  useEffect(() => {
    const userId = getActiveUserId();

    if (!userId) {
      setError(
        "Your account could not be identified. Please sign in again."
      );
      return;
    }

    const savedProfile = getUserItem(
      PROFILE_STORAGE_KEY
    );

    if (!savedProfile) {
      return;
    }

    try {
      const profile = JSON.parse(savedProfile);

      const savedBranch =
        typeof profile.branch === "string"
          ? profile.branch
          : "";

      const savedInterests = Array.isArray(
        profile.career_interests
      )
        ? profile.career_interests.filter(
            (interest) =>
              typeof interest === "string"
          )
        : [];

      const savedPassion =
        typeof profile.passion === "string"
          ? profile.passion
          : "";

      setBranch(savedBranch);
      setInterests(savedInterests);
      setPassion(savedPassion);

      setSuccess(
        "Your previously saved career profile has been restored."
      );
    } catch (restoreError) {
      console.error(
        "Unable to restore career profile:",
        restoreError
      );

      setError(
        "Your saved career profile could not be read. You can select your details again."
      );
    }
  }, []);

  const availableInterests = branch
    ? BRANCH_INTERESTS[branch] ||
      BRANCH_INTERESTS.Other
    : [];

  const handleBranchChange = (selectedBranch) => {
    setBranch(selectedBranch);

    // Preserve only interests that are also available
    // under the newly selected branch.
    const newAvailableInterests =
      BRANCH_INTERESTS[selectedBranch] ||
      BRANCH_INTERESTS.Other;

    setInterests((current) =>
      current.filter((interest) =>
        newAvailableInterests.includes(interest)
      )
    );

    setError("");
    setSuccess("");
  };

  const toggleInterest = (interest) => {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter(
          (item) => item !== interest
        );
      }

      return [...current, interest];
    });

    setError("");
    setSuccess("");
  };

  const saveProfile = async () => {
    setError("");
    setSuccess("");

    if (!getActiveUserId()) {
      setError(
        "Your account could not be identified. Please sign in again."
      );
      return;
    }

    if (!branch) {
      setError(
        "Please select your engineering branch."
      );
      return;
    }

    if (interests.length === 0) {
      setError(
        "Please select at least one career interest."
      );
      return;
    }

    setLoading(true);

    const profileToSave = {
      branch,
      career_interests: interests,
      passion: passion.trim(),
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/career-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileToSave),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to save career profile."
        );
      }

      const profileData = {
        ...data,
        ...profileToSave,
      };

      // Save this profile under the active user's key.
      setUserItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profileData)
      );

      // Verify that browser storage actually received it.
      const savedValue = getUserItem(
        PROFILE_STORAGE_KEY
      );

      if (!savedValue) {
        throw new Error(
          "The profile was processed, but could not be verified in browser storage."
        );
      }

      setSuccess(
        "Your career profile has been saved successfully."
      );

      navigate("/skill-gap");
    } catch (err) {
      console.error(
        "Career profile save failed:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while saving your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Career Profile
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Tell ResumeLens which engineering path you want to pursue.
            Your skill-gap analysis will focus only on career areas
            relevant to your branch and interests.
          </p>
        </div>

        <div className="space-y-8">
          {/* BRANCH */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              1. Select your engineering branch
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your branch helps ResumeLens filter career options
              relevant to your engineering background.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {BRANCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    handleBranchChange(item)
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    branch === item
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item}
                    </span>

                    {branch === item && (
                      <span className="text-cyan-400">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* INTERESTS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              2. Select your career interests
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {branch
                ? "Only career directions relevant to your selected branch are shown."
                : "Select your branch first to see relevant career directions."}
            </p>

            {!branch && (
              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5 text-sm text-slate-500">
                Please select your engineering branch above.
              </div>
            )}

            {branch && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableInterests.map(
                  (interest) => {
                    const selected =
                      interests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          toggleInterest(interest)
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">
                            {interest}
                          </span>

                          {selected && (
                            <span className="text-cyan-400">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* PASSION */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              3. Tell us what you enjoy building
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Optional. This helps ResumeLens understand your practical
              interests and refine your career analysis.
            </p>

            <textarea
              value={passion}
              onChange={(event) => {
                setPassion(event.target.value);
                setSuccess("");
              }}
              placeholder="Example: I enjoy building robots, working with ESP32 and sensors, programming microcontrollers, and creating IoT projects."
              rows={5}
              className="mt-6 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
            />
          </section>

          {/* CURRENT SELECTION */}
          {branch && interests.length > 0 && (
            <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-6">
              <p className="text-sm uppercase tracking-wider text-cyan-400">
                Current Selection
              </p>

              <p className="mt-3 text-sm text-slate-300">
                <span className="font-semibold text-white">
                  Branch:
                </span>{" "}
                {branch}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                <span className="font-semibold text-white">
                  Career interests:
                </span>{" "}
                {interests.join(", ")}
              </p>

              {passion.trim() && (
                <p className="mt-2 text-sm text-slate-300">
                  <span className="font-semibold text-white">
                    Passion:
                  </span>{" "}
                  {passion}
                </p>
              )}
            </section>
          )}

          {/* SUCCESS */}
          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-5 py-4 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-900 bg-red-950/40 px-5 py-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="button"
            onClick={saveProfile}
            disabled={
              loading ||
              !branch ||
              interests.length === 0
            }
            className="w-full rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyzing Career Profile..."
              : "Continue to Skill Gap"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CareerProfile;