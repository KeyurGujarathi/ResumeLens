import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const primaryLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Resume Builder", path: "/resume" },
  { label: "Resume Analyzer", path: "/resume-analyzer" },
  { label: "Skills", path: "/skills" },
  { label: "Placement Prep", path: "/placement-preparation" },
];

const moreLinks = [
  { label: "Career Profile", path: "/career-profile" },
  { label: "Skill Gap", path: "/skill-gap" },
  { label: "Company Fit", path: "/company-fit" },
  { label: "Improve Resume", path: "/resume-improvement" },
  { label: "Career Roadmap", path: "/career-roadmap" },
];

const allLinks = [...primaryLinks, ...moreLinks];

function getLinkClass(isActive) {
  return [
    "flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium",
    "transition-all duration-200",
    isActive
      ? "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200"
      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
  ].join(" ");
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const lastScrollY = useRef(0);

  // Hide the mobile hamburger while scrolling down.
  // Show it again while scrolling up or when near the top.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;

      if (currentScrollY < 20) {
        setMobileMenuVisible(true);
      } else if (currentScrollY > previousScrollY + 4) {
        setMobileMenuVisible(false);
      } else if (currentScrollY < previousScrollY - 4) {
        setMobileMenuVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menus whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Allow Escape to close open navigation panels.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setMoreOpen(false);
        setAccountOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "U";

  const desktopLinkClass = ({ isActive }) =>
    [
      "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium",
      "transition-all duration-200",
      isActive
        ? "bg-violet-100 text-violet-800"
        : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
    ].join(" ");

  const moreIsActive = moreLinks.some(
    (item) => location.pathname === item.path
  );

  return (
    <>
      {/* Main navigation */}
      <header className="resumelens-nav sticky top-0 z-40 border-b border-violet-100 bg-white/95 text-slate-800 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Logo and desktop navigation */}
          <div className="flex h-16 items-center justify-between lg:h-[72px]">
            <Link
              to="/"
              onClick={closeMenus}
              className="group inline-flex min-w-0 items-center"
              aria-label="ResumeLens home"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-100 text-base font-bold text-violet-700 transition-colors group-hover:bg-violet-200">
                R
              </span>

              <span className="ml-2.5 whitespace-nowrap text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Resume<span className="text-violet-600">Lens</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav
              aria-label="Main navigation"
              className="hidden min-w-0 items-center gap-1 lg:flex"
            >
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={desktopLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* More dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen((current) => !current);
                    setAccountOpen(false);
                  }}
                  className={[
                    "flex items-center gap-1 rounded-xl px-3 py-2",
                    "text-sm font-medium transition-all duration-200",
                    moreIsActive || moreOpen
                      ? "bg-violet-100 text-violet-800"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
                  ].join(" ")}
                  aria-expanded={moreOpen}
                >
                  More

                  <svg
                    className={`h-4 w-4 transition-transform ${
                      moreOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-violet-100 bg-white p-2 shadow-xl shadow-violet-950/10">
                    {moreLinks.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          [
                            "block rounded-xl px-3 py-2.5 text-sm",
                            "transition-colors duration-200",
                            isActive
                              ? "bg-violet-100 text-violet-800"
                              : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
                          ].join(" ")
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop account controls */}
              <div className="relative ml-2 border-l border-violet-100 pl-3">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen((current) => !current);
                        setMoreOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-violet-50"
                      aria-expanded={accountOpen}
                      aria-label="Open account menu"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-100 font-semibold text-violet-700">
                        {initials}
                      </span>

                      <span className="max-w-28 truncate">
                        {user?.name || "Account"}
                      </span>

                      <span className="text-xs text-slate-500">⌄</span>
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-violet-100 bg-white p-2 shadow-xl shadow-violet-950/10">
                        {user?.email && (
                          <p className="truncate px-3 py-2 text-xs text-slate-500">
                            {user.email}
                          </p>
                        )}

                        {user?.is_admin && (
                          <Link
                            to="/admin"
                            onClick={closeMenus}
                            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50"
                          >
                            Admin analytics
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile hamburger */}
          <div
            className={[
              "overflow-hidden lg:hidden",
              "transition-[max-height,opacity] duration-200 ease-in-out",
              mobileMenuVisible
                ? "max-h-14 opacity-100"
                : "pointer-events-none max-h-0 opacity-0",
            ].join(" ")}
            aria-hidden={!mobileMenuVisible}
          >
            <div className="flex h-12 items-center">
              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                aria-label={
                  mobileOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={mobileOpen}
                tabIndex={mobileMenuVisible ? 0 : -1}
                style={{
                  all: "unset",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  color: "#7557d9",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {mobileOpen ? (
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer and backdrop */}
      <div
        className={[
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "visible" : "invisible pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        {/* Blurred backdrop */}
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className={[
            "absolute inset-0 h-full w-full border-0 bg-slate-900/30",
            "backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Drawer panel */}
        <aside
          id="resumelens-mobile-drawer"
          aria-label="Mobile navigation"
          className={[
            "absolute inset-y-0 left-0 flex w-[75vw] max-w-[320px]",
            "flex-col border-r border-violet-100 bg-white",
            "shadow-2xl shadow-violet-950/15",
            "transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Drawer heading */}
          <div className="flex min-h-16 items-center justify-between border-b border-violet-100 px-5">
            <Link
              to="/"
              onClick={closeMenus}
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Resume<span className="text-violet-600">Lens</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable navigation links */}
          <nav
            aria-label="Mobile navigation links"
            className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-5"
          >
            <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Main menu
            </p>

            {allLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                tabIndex={mobileOpen ? 0 : -1}
                onClick={closeMenus}
                className={({ isActive }) => getLinkClass(isActive)}
              >
                <span className="min-w-0 flex-1">{item.label}</span>

                <svg
                  className="ml-3 h-4 w-4 shrink-0 opacity-50"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </NavLink>
            ))}
          </nav>

          {/* Mobile account controls */}
          <div className="border-t border-violet-100 p-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex min-w-0 items-center gap-3 px-2 py-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-100 font-semibold text-violet-700">
                    {initials}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user?.name || "Your account"}
                    </p>

                    {user?.email && (
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Sign in
              </Link>
            )}

            <p className="mt-4 text-center text-xs text-slate-500">
              ResumeLens · Your career, clearly.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Navbar;