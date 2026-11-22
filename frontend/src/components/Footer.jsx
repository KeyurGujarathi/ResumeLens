import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-violet-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <Link to="/" className="text-2xl font-bold text-slate-900">
              Resume<span className="text-violet-600">Lens</span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Your career, clearly. Build better resumes, discover your
              strengths and prepare for your professional journey.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
              <Link to="/" className="hover:text-violet-700">
                Home
              </Link>

              <Link to="/login" className="hover:text-violet-700">
                Sign In
              </Link>

              <Link to="/register" className="hover:text-violet-700">
                Create Account
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Legal & Support
            </h3>

            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600">
              <Link to="/privacy-policy" className="hover:text-violet-700">
                Privacy Policy
              </Link>

              <Link
                to="/terms-and-conditions"
                className="hover:text-violet-700"
              >
                Terms & Conditions
              </Link>

              <a
                href="mailto:resumelens.support@gmail.com"
                className="break-all hover:text-violet-700"
              >
                resumelens.support@gmail.com
              </a>
            </div>
          </div>

        </div>

        <div className="mt-10 border-t border-violet-100 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ResumeLens. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
