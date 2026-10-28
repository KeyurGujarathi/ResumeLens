import API_BASE from "../utils/api.js";
import { useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const API_BASE_URL = API_BASE

function Skills() {
  const [skills, setSkills] = useState([])
  const [rankings, setRankings] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return (
      params.get("skill") ||
      localStorage.getItem("resumelens_selected_skill") ||
      "Python"
    )
  })
  const [showAllRankings, setShowAllRankings] = useState(false)
  const [skillData, setSkillData] = useState(null)

  const [loadingSkills, setLoadingSkills] = useState(true)
  const [loadingData, setLoadingData] = useState(false)

  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  // --------------------------------------------------
  // Load skill rankings
  // --------------------------------------------------

  useEffect(() => {
    async function fetchRankings() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/skills/rankings`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch skill rankings.")
        }

        const data = await response.json()

        setRankings(data)
        setSkills(data.map((item) => item.skill))
      } catch (err) {
        console.error(err)
        setError("Could not load skill rankings.")
      } finally {
        setLoadingSkills(false)
      }
    }

    fetchRankings()
  }, [])

  // Keep the selected skill after refresh and allow a skill-specific URL.
  useEffect(() => {
    if (!selectedSkill) return

    localStorage.setItem("resumelens_selected_skill", selectedSkill)

    const params = new URLSearchParams(window.location.search)
    params.set("skill", selectedSkill)
    const query = params.toString()
    const nextUrl = `${window.location.pathname}?${query}${window.location.hash}`
    window.history.replaceState({}, "", nextUrl)
  }, [selectedSkill])

  // --------------------------------------------------
  // Load selected skill trend
  // --------------------------------------------------

  useEffect(() => {
    async function fetchSkillData() {
      if (!selectedSkill) return

      setLoadingData(true)
      setError("")

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/skills/trends?skill=${encodeURIComponent(
            selectedSkill
          )}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch skill data.")
        }

        const data = await response.json()

        setSkillData(data)
      } catch (err) {
        console.error(err)
        setSkillData(null)
        setError("Could not load skill data.")
      } finally {
        setLoadingData(false)
      }
    }

    fetchSkillData()
  }, [selectedSkill])

  // --------------------------------------------------
  // Search skills
  // --------------------------------------------------

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return []
    }

    return skills.filter((skill) =>
      skill.toLowerCase().includes(query)
    )
  }, [skills, search])

  // --------------------------------------------------
  // Prepare chart data
  // --------------------------------------------------

  const chartData = useMemo(() => {
    if (!skillData?.points) {
      return []
    }

    return skillData.points.map((point) => ({
      week: point.week,
      postings: point.posting_count,
    }))
  }, [skillData])

  // --------------------------------------------------
  // Format chart dates
  // --------------------------------------------------

  const formatChartDate = (value) => {
    if (!value) return ""

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Skill Intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Explore which skills appear in job postings and how their
            demand changes over time.
          </p>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ==================================================
            TOP SKILLS
        ================================================== */}

        <section className="mb-10">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Job Market
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Top Skills in Job Postings
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Skills appearing most frequently in the available
              job-posting dataset.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

            {loadingSkills ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                Loading skill rankings...
              </div>
            ) : rankings.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                No skill rankings available.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">

                {rankings.slice(0, showAllRankings ? rankings.length : 10).map((item, index) => {

                  const isSelected =
                    selectedSkill.toLowerCase() ===
                    item.skill.toLowerCase()

                  return (
                    <button
                      key={item.skill}
                      onClick={() => setSelectedSkill(item.skill)}
                      className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition sm:px-6 ${
                        isSelected
                          ? "bg-cyan-500/10"
                          : "hover:bg-slate-800/70"
                      }`}
                    >

                      {/* Rank */}

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          isSelected
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Skill */}

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-semibold ${
                            isSelected
                              ? "text-cyan-300"
                              : "text-white"
                          }`}
                        >
                          {item.skill}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Job market skill
                        </p>
                      </div>

                      {/* Posting count */}

                      <div className="hidden text-right sm:block">
                        <p className="font-semibold text-white">
                          {item.posting_count.toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500">
                          postings
                        </p>
                      </div>

                      {/* Mobile count */}

                      <span className="text-xs text-slate-400 sm:hidden">
                        {item.posting_count.toLocaleString()}
                      </span>

                      {/* Arrow */}

                      <span
                        className={`text-lg transition ${
                          isSelected
                            ? "translate-x-1 text-cyan-400"
                            : "text-slate-600 group-hover:translate-x-1 group-hover:text-cyan-400"
                        }`}
                      >
                        →
                      </span>

                    </button>
                  )
                })}

              </div>
            )}

            {!loadingSkills && rankings.length > 10 && (
              <div className="border-t border-slate-800 p-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllRankings((current) => !current)}
                  className="rounded-lg border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10"
                >
                  {showAllRankings ? "Show top 10 skills" : `View all ${rankings.length} skills`}
                </button>
              </div>
            )}

          </div>
        </section>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <section className="mb-10">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Explore
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Explore a Skill
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Search across all skills in the available job-posting dataset and view its job-market trend.
              </p>
            </div>

            <div className="relative">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search skills, e.g. Python, Java, SQL..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
              />

            </div>

            {search && filteredSkills.length > 0 && (
              <>
                <p className="mt-3 text-xs text-slate-500">
                  {filteredSkills.length} matching skill{filteredSkills.length === 1 ? "" : "s"} found in the available dataset.
                </p>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">

                {filteredSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setSelectedSkill(skill)
                      setSearch("")
                    }}
                    className="flex w-full items-center justify-between border-b border-slate-800 px-4 py-3 text-left text-sm text-slate-300 transition last:border-b-0 hover:bg-slate-800 hover:text-white"
                  >
                    <span>{skill}</span>

                    <span className="text-cyan-400">
                      →
                    </span>
                  </button>
                ))}

                </div>
              </>
            )}

            {search && filteredSkills.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">
                No matching skills found.
              </p>
            )}

          </div>

        </section>

        {/* ==================================================
            SELECTED SKILL
        ================================================== */}

        <section>

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Skill Analysis
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">

              <h2 className="text-3xl font-bold">
                {selectedSkill}
              </h2>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Job Market
              </span>

            </div>

          </div>

          {loadingData ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center text-sm text-slate-400 shadow-xl">
              Loading {selectedSkill} data...
            </div>

          ) : skillData ? (

            <>

              {/* ==================================================
                  STATISTICS
              ================================================== */}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

                  <p className="text-sm text-slate-400">
                    Total Job Postings
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {skillData.total_postings.toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Available in dataset
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

                  <p className="text-sm text-slate-400">
                    Dated Postings
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {skillData.dated_postings.toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Postings with date information
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:col-span-2 lg:col-span-1">

                  <p className="text-sm text-slate-400">
                    Recorded Skill Postings
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-cyan-400">
                    {skillData.points
                      .reduce(
                        (total, point) =>
                          total + point.posting_count,
                        0
                      )
                      .toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Weekly observations for {selectedSkill}
                  </p>

                </div>

              </div>

              {/* ==================================================
                  CHART
              ================================================== */}

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">

                <div className="mb-6">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                    <div>
                      <h3 className="text-xl font-bold">
                        Publication Trend
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Weekly job-posting observations for{" "}
                        <span className="font-medium text-slate-300">
                          {selectedSkill}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                      {chartData.length} data points
                    </div>

                  </div>

                </div>

                <div className="h-[380px] w-full sm:h-[420px]">

                  {chartData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -10,
                          bottom: 10,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="week"
                          stroke="#64748b"
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                          tickFormatter={formatChartDate}
                          minTickGap={45}
                          tickMargin={10}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          stroke="#64748b"
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#ffffff",
                            boxShadow:
                              "0 10px 30px rgba(0,0,0,0.35)",
                          }}
                          labelStyle={{
                            color: "#94a3b8",
                            marginBottom: "4px",
                          }}
                          formatter={(value) => [
                            `${Number(value).toLocaleString()} postings`,
                            "Job postings",
                          ]}
                          labelFormatter={(label) =>
                            formatChartDate(label)
                          }
                        />

                        <Line
                          type="monotone"
                          dataKey="postings"
                          stroke="#22d3ee"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#0f172a",
                          }}
                        />

                      </LineChart>
                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
                      No trend data available.
                    </div>

                  )}

                </div>

              </div>

            </>

          ) : (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center text-sm text-slate-400">
              Select a skill to view its analysis.
            </div>

          )}

        </section>

      </div>
    </main>
  )
}

export default Skills