import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-violet-600">
          RESUMELENS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Last updated: November 22, 2026
        </p>

        <div className="mt-8 space-y-7 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p className="mt-2">
              Welcome to ResumeLens. We respect your privacy and are committed
              to explaining how information is collected, used, stored and
              protected when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Information We Collect
            </h2>
            <p className="mt-2">
              Depending on how you use ResumeLens, we may collect:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Name and email address provided during registration.</li>
              <li>Account authentication and session information.</li>
              <li>Resume content and information submitted for analysis.</li>
              <li>Skills, career interests and professional information.</li>
              <li>Career roadmap and placement preparation progress.</li>
              <li>Activity information, such as pages visited while signed in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. How We Use Your Information
            </h2>
            <p className="mt-2">
              We use collected information to provide and improve ResumeLens
              features, including resume analysis, resume building, skill-gap
              identification, career recommendations, company-fit analysis
              and placement preparation.
            </p>
            <p className="mt-2">
              We may also use account information to authenticate users,
              maintain sessions, protect the platform and respond to support
              requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Resume Processing
            </h2>
            <p className="mt-2">
              ResumeLens processes submitted resume and career information
              through its own application backend. As currently represented
              by our service architecture, resume content is not sent to
              external AI API providers for processing.
            </p>
            <p className="mt-2">
              Please avoid submitting sensitive personal information that is
              not necessary for using the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Data Storage and Service Providers
            </h2>
            <p className="mt-2">
              ResumeLens uses database and hosting infrastructure to operate
              the platform. Application data is stored using our database
              infrastructure, and our application is hosted through Render.
            </p>
            <p className="mt-2">
              These infrastructure providers may process information as
              necessary to provide their services, subject to their applicable
              terms and privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Data Security
            </h2>
            <p className="mt-2">
              We use reasonable technical and organizational measures intended
              to protect user information against unauthorized access, loss,
              misuse or alteration. However, no online service or storage
              system can be guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Data Retention and Deletion
            </h2>
            <p className="mt-2">
              We retain information as needed to provide the service, maintain
              accounts, meet legitimate operational requirements and address
              legal obligations.
            </p>
            <p className="mt-2">
              Users may request access, correction or deletion of their
              personal information by contacting our support email. We may
              need to verify account ownership before processing a request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Your Privacy Choices
            </h2>
            <p className="mt-2">
              You are responsible for keeping your account credentials
              confidential. You may contact us regarding questions or
              requests about your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Children's Privacy
            </h2>
            <p className="mt-2">
              ResumeLens is a career-development platform and is not
              intentionally designed to collect personal information from
              children in violation of applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Changes to This Policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy when our services or
              practices change. Updated versions will be published on this
              page with a revised update date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Contact Us
            </h2>
            <p className="mt-2">
              For privacy questions, account deletion requests or other
              concerns, contact:
            </p>
            <a
              href="mailto:resumelens.support@gmail.com"
              className="mt-2 inline-block font-semibold text-violet-700 hover:text-violet-900"
            >
              resumelens.support@gmail.com
            </a>
          </section>
        </div>

        <div className="mt-10 border-t border-violet-100 pt-6">
          <Link to="/" className="font-semibold text-violet-700 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </article>
    </main>
  );
}

export default PrivacyPolicy;