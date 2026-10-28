import { useState } from "react";

function CareerFocus({ onCareerFocusChange }) {
const [branch, setBranch] = useState("");
const [careerInterests, setCareerInterests] = useState([]);
const [notSure, setNotSure] = useState(false);
const [passion, setPassion] = useState("");

const branches = [
"CSE",
"ISE",
"ECE",
"Electronics & Computer Engineering",
"EEE",
"Mechanical",
"Civil",
"AI / ML",
"AIML",
"Chemical",
"Other",
];

const interests = [
"Software / IT",
"AI / ML / Data",
"Cloud / DevOps",
"Embedded / IoT / Robotics",
"Electronics / Hardware",
"VLSI / Semiconductor",
"Electrical / Core",
"Mechanical / Core",
"Civil / Core",
"Other",
];

const updateParent = (
updatedBranch,
updatedInterests,
updatedNotSure,
updatedPassion
) => {
if (onCareerFocusChange) {
onCareerFocusChange({
branch: updatedBranch,
careerInterests: updatedInterests,
notSure: updatedNotSure,
passion: updatedPassion,
});
}
};

const handleBranchChange = (event) => {
const value = event.target.value;


setBranch(value);

updateParent(
  value,
  careerInterests,
  notSure,
  passion
);


};

const handleInterestChange = (interest) => {
let updatedInterests = [];


if (careerInterests.includes(interest)) {
  updatedInterests = careerInterests.filter(
    (item) => item !== interest
  );
} else {
  updatedInterests = [
    ...careerInterests,
    interest,
  ];
}

setCareerInterests(updatedInterests);

updateParent(
  branch,
  updatedInterests,
  notSure,
  passion
);


};

const handleNotSureChange = (event) => {
const checked = event.target.checked;


setNotSure(checked);

if (checked) {
  setCareerInterests([]);

  updateParent(
    branch,
    [],
    true,
    passion
  );
} else {
  updateParent(
    branch,
    careerInterests,
    false,
    passion
  );
}


};

const handlePassionChange = (event) => {
const value = event.target.value;


setPassion(value);

updateParent(
  branch,
  careerInterests,
  notSure,
  value
);


};

return ( <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

```
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
      Career Focus
    </p>

    <h2 className="mt-2 text-2xl font-bold text-white">
      Tell us about your career direction
    </h2>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
      ResumeLens uses your engineering branch and interests
      to make your career and skill-gap analysis more relevant.
    </p>
  </div>

  <div className="mt-6">

    <label className="text-sm font-medium text-slate-300">
      Engineering Branch
    </label>

    <select
      value={branch}
      onChange={handleBranchChange}
      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
    >
      <option value="">
        Select your branch
      </option>

      {branches.map((item) => (
        <option
          key={item}
          value={item}
        >
          {item}
        </option>
      ))}
    </select>

  </div>

  <div className="mt-6">

    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-500">

      <input
        type="checkbox"
        checked={notSure}
        onChange={handleNotSureChange}
        className="h-4 w-4 accent-cyan-400"
      />

      <div>
        <p className="font-medium text-white">
          I'm not sure yet
        </p>

        <p className="mt-1 text-sm text-slate-500">
          I don't know which career path is right for me yet.
        </p>
      </div>

    </label>

  </div>

  {!notSure && (
    <div className="mt-8">

      <label className="text-sm font-medium text-slate-300">
        What careers are you interested in?
      </label>

      <p className="mt-1 text-sm text-slate-500">
        You can select more than one.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">

        {interests.map((interest) => {
          const selected =
            careerInterests.includes(interest);

          return (
            <button
              key={interest}
              type="button"
              onClick={() =>
                handleInterestChange(interest)
              }
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    selected
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-slate-600"
                  }`}
                >
                  {selected && (
                    <span className="text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <span className="font-medium">
                  {interest}
                </span>

              </div>

            </button>
          );
        })}

      </div>

    </div>
  )}

  {notSure && (
    <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6">

      <p className="text-sm font-medium uppercase tracking-[0.15em] text-cyan-400">
        Let's discover your direction
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        What are you interested or passionate about?
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Don't worry if you don't know the exact career name.
        Tell us what you enjoy learning, building, solving,
        or experimenting with.
      </p>

      <textarea
        value={passion}
        onChange={handlePassionChange}
        placeholder="For example: I enjoy building robots, working with sensors, coding in Python, designing circuits, creating websites, working with machines..."
        rows={5}
        className="mt-5 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />

      <p className="mt-2 text-xs text-slate-600">
        There is no right or wrong answer. Just describe what
        interests you.
      </p>

    </div>
  )}

  {(branch ||
    careerInterests.length > 0 ||
    passion) && (
    <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

      <p className="text-sm font-medium text-cyan-400">
        Current Selection
      </p>

      {branch && (
        <p className="mt-2 text-sm text-slate-300">
          Branch:{" "}
          <span className="text-white">
            {branch}
          </span>
        </p>
      )}

      {!notSure &&
        careerInterests.length > 0 && (
          <p className="mt-1 text-sm text-slate-300">
            Career interests:{" "}
            <span className="text-white">
              {careerInterests.join(", ")}
            </span>
          </p>
        )}

      {notSure && passion && (
        <p className="mt-1 text-sm text-slate-300">
          Your interests:{" "}
          <span className="text-white">
            {passion}
          </span>
        </p>
      )}

    </div>
  )}

</section>


);
}

export default CareerFocus;
