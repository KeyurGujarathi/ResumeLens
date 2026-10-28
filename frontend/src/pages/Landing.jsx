import { useNavigate } from "react-router-dom";
import { getUserItem } from "../utils/userStorage.js";

const steps = [
  {
    number: "01",
    title: "Know your starting point",
    description:
      "Turn your resume into a clear snapshot of your skills, projects, and strengths.",
  },
  {
    number: "02",
    title: "Find your direction",
    description:
      "Connect your branch and interests to skills that matter for the career you want.",
  },
  {
    number: "03",
    title: "Build a practical plan",
    description:
      "See relevant gaps, explore company fit, and follow a roadmap you can actually use.",
  },
];

const features = [
  {
    number: "01",
    title: "Resume Analyzer",
    description:
      "Understand your resume score, extracted skills, and opportunities to improve.",
    path: "/resume-analyzer",
    tag: "START HERE",
    icon: "↗",
  },
  {
    number: "02",
    title: "Career Skill Gap",
    description:
      "Focus on skills connected to your interests—not every skill in the market.",
    path: "/skill-gap",
    tag: "PERSONALIZED",
    icon: "⌁",
  },
  {
    number: "03",
    title: "Company Fit",
    description:
      "Compare your current skills with requirements across relevant companies.",
    path: "/company-fit",
    tag: "MARKET INSIGHT",
    icon: "◎",
  },
  {
    number: "04",
    title: "Career Roadmap",
    description:
      "Turn the next skills to learn into a clear, trackable learning path.",
    path: "/career-roadmap",
    tag: "YOUR NEXT STEP",
    icon: "↗",
  },
  {
    number: "05",
    title: "Resume Improvement",
    description:
      "Make resume bullets clearer, stronger, and more specific to your work.",
    path: "/resume-improvement",
    tag: "MAKE IT STRONGER",
    icon: "✳",
  },
  {
    number: "06",
    title: "Placement Preparation",
    description:
      "Organize technical practice and interview preparation around your direction.",
    path: "/placement-preparation",
    tag: "GET READY",
    icon: "▤",
  },
];

function Landing() {
  const navigate = useNavigate();

  const hasResumeData = Boolean(
    getUserItem("resumelens_resume_analysis") ||
      localStorage.getItem("resumelens_resume_analysis")
  );

  return (
<main className="rl-landing lavender-horizon">     
   {/* ======================================
          HERO SECTION
      ====================================== */}

      <section className="rl-hero aurora-hero">
        <div className="rl-hero-orb rl-orb-one" aria-hidden="true" />
        <div className="rl-hero-orb rl-orb-two" aria-hidden="true" />
        <div className="aurora-extra-orb" aria-hidden="true" />

        <div className="rl-hero-inner">
          <div className="rl-hero-copy aurora-enter">
            <div className="rl-eyebrow rl-eyebrow-hero">
              <span className="rl-live-dot" />
              CAREER CLARITY, BUILT AROUND YOU
            </div>

            <h1 className="aurora-headline">
              Your next career move
              <br />
              <span className="aurora-gradient-text">
                starts with what you know.
              </span>
            </h1>

            <p className="rl-hero-description">
              Your resume is more than a document. ResumeLens connects your
              skills, interests, and real job-market signals to help you decide
              what to improve—and what to do next.
            </p>

            <div className="rl-hero-actions">
              <button
                className="rl-button rl-button-primary aurora-primary-button"
                onClick={() => navigate("/resume-analyzer")}
              >
                Analyze my resume
                <span aria-hidden="true">↗</span>
              </button>

              <button
                className="rl-button rl-button-quiet aurora-secondary-button"
                onClick={() => navigate("/skills")}
              >
                Explore the skill market
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {hasResumeData && (
              <button
                className="rl-continue-link"
                onClick={() => navigate("/dashboard")}
              >
                Welcome back — continue to your dashboard →
              </button>
            )}

            <div className="rl-trust-row">
              <span className="rl-avatar-stack" aria-hidden="true">
                <i>✓</i>
                <i>✦</i>
                <i>+</i>
              </span>

              <span>Made for students finding their next step</span>

              <span className="rl-trust-divider" />

              <span className="rl-trust-check">✓</span>

              <span>Career-specific, not one-size-fits-all</span>
            </div>
          </div>

          {/* CAREER SNAPSHOT PREVIEW */}

          <div
            className="rl-hero-visual aurora-visual-enter"
            aria-label="Illustrative ResumeLens career analysis preview"
          >
            <div className="rl-preview-backdrop" />

            <div className="rl-preview-card aurora-preview-card">
              <div className="rl-preview-top">
                <div className="rl-window-dots">
                  <i />
                  <i />
                  <i />
                </div>

                <span>YOUR CAREER SNAPSHOT</span>
                <span className="rl-preview-menu">•••</span>
              </div>

              <div className="rl-preview-profile">
                <div className="rl-profile-avatar">RL</div>

                <div>
                  <strong>Your career snapshot</strong>
                  <span>Skills, strengths &amp; next steps</span>
                </div>

                <span className="rl-profile-status">IN PROGRESS</span>
              </div>

              <div className="rl-preview-score-row">
                <div>
                  <span className="rl-micro-label">RESUME READINESS</span>

                  <div className="rl-score-number">
                    78<span>/100</span>
                  </div>

                  <span className="rl-score-positive">
                    ↗ Room to grow, with a plan
                  </span>
                </div>

                <div className="rl-score-ring">
                  <div>
                    <strong>78</strong>
                    <span>score</span>
                  </div>
                </div>
              </div>

              <div className="rl-preview-rule" />

              <div className="rl-preview-section-title">
                <strong>Skills in your orbit</strong>
                <span>View all ↗</span>
              </div>

              <div className="rl-skill-pills">
                <span className="rl-skill-pill is-solid">C</span>
                <span className="rl-skill-pill is-solid">
                  Embedded systems
                </span>
                <span className="rl-skill-pill is-solid">Python</span>
                <span className="rl-skill-pill is-soft">+ Explore IoT</span>
              </div>

              <div className="rl-gap-panel">
                <div className="rl-gap-icon">✦</div>

                <div className="rl-gap-content">
                  <strong>Your next opportunity</strong>
                  <span>
                    Build practical experience with IoT protocols
                  </span>

                  <div className="rl-gap-meter">
                    <i />
                  </div>
                </div>

                <span className="rl-gap-arrow">↗</span>
              </div>

              <div className="rl-preview-foot">
                <span>
                  <i className="rl-foot-dot" />
                  Career focus connected
                </span>

                <span>Personalized for you</span>
              </div>
            </div>

            <div className="rl-float-note rl-float-note-top">
              <span className="rl-note-icon">↗</span>

              <span>
                <strong>Skills that fit</strong>
                <small>Matched to your direction</small>
              </span>
            </div>

            <div className="rl-float-note rl-float-note-bottom">
              <span className="rl-note-check">✓</span>

              <span>
                <strong>A clearer next step</strong>
                <small>One skill at a time</small>
              </span>
            </div>
          </div>
        </div>

        <div className="rl-hero-bottom">
          <span>FROM RESUME</span>
          <i />
          <span>TO CAREER DIRECTION</span>
          <i />
          <span>TO YOUR NEXT MOVE</span>
        </div>

        <div className="aurora-scroll-indicator" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ======================================
          HOW IT WORKS
      ====================================== */}

      <section className="rl-section rl-intro-section">
        <div className="rl-section-heading">
          <div>
            <div className="rl-eyebrow">
              <span>01</span>
              A MORE CONNECTED APPROACH
            </div>

            <h2>
              Career advice should connect
              <br />
              <em>the dots.</em>
            </h2>
          </div>

          <p>
            Most tools give you a score or a list. ResumeLens helps connect what
            you already know with what your chosen direction actually asks for.
          </p>
        </div>

        <div className="rl-steps-grid">
          {steps.map((step, index) => (
            <article
              className="rl-step-card aurora-step-card"
              key={step.number}
              style={{ "--card-index": index }}
            >
              <span className="rl-step-number">{step.number}</span>

              <div className="rl-step-line" />

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <span className="aurora-step-decoration" aria-hidden="true">
                ✦
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ======================================
          CAREER TOOLKIT
      ====================================== */}

      <section className="rl-feature-section">
        <div className="rl-section rl-features-inner">
          <div className="rl-feature-heading">
            <div>
              <div className="rl-eyebrow">
                <span>02</span>
                YOUR CAREER TOOLKIT
              </div>

              <h2>
                Everything works better
                <br />
                <em>when it works together.</em>
              </h2>
            </div>

            <p>
              Move from understanding your resume to making your next career
              decision—with one connected workspace.
            </p>
          </div>

          <div className="rl-feature-grid">
            {features.map((feature, index) => (
              <button
                className="rl-feature-card aurora-feature-card"
                key={feature.title}
                onClick={() => navigate(feature.path)}
                style={{ "--card-index": index }}
              >
                <div className="rl-feature-card-top">
                  <span className="rl-feature-icon">{feature.icon}</span>

                  <span className="rl-feature-number">
                    {feature.number}
                  </span>
                </div>

                <span className="rl-feature-tag">{feature.tag}</span>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <span className="rl-feature-link">
                  Explore feature <span aria-hidden="true">↗</span>
                </span>

                <span
                  className="aurora-card-glow"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          CAREER PHILOSOPHY
      ====================================== */}

      <section className="rl-section rl-principle-section">
        <div className="rl-principle-card aurora-principle-card">
          <div className="rl-principle-copy">
            <div className="rl-eyebrow rl-eyebrow-light">
              <span>03</span>
              THE RESUMELENS PRINCIPLE
            </div>

            <h2>
              Your skill gaps are
              <br />
              <em>guidance, not requirements.</em>
            </h2>

            <p>
              Your branch, interests, resume skills, and relevant job-market
              data all matter. We help you focus on what is useful for the
              direction you're considering—not tell you to learn everything.
            </p>

            <button
              className="rl-button rl-button-light aurora-principle-button"
              onClick={() => navigate("/career-profile")}
            >
              Define my career direction
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="rl-principle-visual" aria-hidden="true">
            <div className="rl-orbit orbit-a" />
            <div className="rl-orbit orbit-b" />
            <div className="rl-orbit orbit-c" />

            <div className="rl-orbit-core">
              R<span>L</span>
            </div>

            <span className="rl-orbit-label orbit-label-a">
              YOUR SKILLS
            </span>

            <span className="rl-orbit-label orbit-label-b">
              YOUR INTERESTS
            </span>

            <span className="rl-orbit-label orbit-label-c">
              YOUR NEXT STEP
            </span>
          </div>
        </div>
      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="rl-footer">
        <div className="rl-footer-main">
          <div className="rl-footer-brand">
            <div className="rl-brand-symbol">
              R<span>L</span>
            </div>

            <div>
              <strong>ResumeLens</strong>
              <span>Student career intelligence</span>
            </div>
          </div>

          <p>
            A clearer view of what you know, where you could go, and what to do
            next.
          </p>

          <button onClick={() => navigate("/dashboard")}>
            Open your workspace
            <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="rl-footer-bottom">
          <span>© {new Date().getFullYear()} ResumeLens</span>
          <span>Built to make your next step clearer.</span>
        </div>
      </footer>
    </main>
  );
}

export default Landing;