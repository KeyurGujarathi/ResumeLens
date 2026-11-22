import { Link } from "react-router-dom";

function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-violet-600">
          RESUMELENS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Terms & Conditions
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Last updated: November 22, 2026
        </p>

        <div className="mt-8 space-y-7 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using ResumeLens, you agree to these Terms &
              Conditions. If you do not agree with these terms, please do not
              use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. About ResumeLens
            </h2>
            <p className="mt-2">
              ResumeLens is a career-development platform designed to help
              users build and analyze resumes, explore skills, identify skill
              gaps, understand career opportunities and prepare for
              placements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. User Accounts
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>You must provide accurate registration information.</li>
              <li>You are responsible for maintaining account security.</li>
              <li>You must not share your account credentials improperly.</li>
              <li>
                You must notify us if you suspect unauthorized account access.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Acceptable Use
            </h2>
            <p className="mt-2">
              You agree not to misuse ResumeLens, attempt unauthorized access,
              interfere with platform operations, upload unlawful content or
              use the service for fraudulent or harmful activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. User Content
            </h2>
            <p className="mt-2">
              You retain ownership of the resumes, personal information and
              other content you submit to ResumeLens. You are responsible for
              ensuring that you have the right to submit that content.
            </p>
            <p className="mt-2">
              You grant us permission to process submitted content only as
              reasonably necessary to provide the platform's features and
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Automated Analysis and Recommendations
            </h2>
            <p className="mt-2">
              ResumeLens provides automated resume analysis, skill
              recommendations, career guidance and placement preparation
              assistance.
            </p>
            <p className="mt-2">
              These results are intended for informational and educational
              purposes. They may not always be accurate, complete or suitable
              for every individual.
            </p>
            <p className="mt-2">
              ResumeLens does not guarantee employment, interviews, placement,
              salary increases or admission to any organization.
            </p>
            <p className="mt-2">
              Users should independently verify important career and
              employment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Intellectual Property
            </h2>
            <p className="mt-2">
              The ResumeLens name, branding, website design, software and
              original platform materials are protected by applicable
              intellectual property laws.
            </p>
            <p className="mt-2">
              Users may not copy, distribute, modify or commercially exploit
              platform materials without appropriate authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Service Availability
            </h2>
            <p className="mt-2">
              We aim to keep ResumeLens available and functional. However,
              uninterrupted access is not guaranteed. Maintenance, technical
              problems, hosting issues or other circumstances may temporarily
              affect availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Limitation of Liability
            </h2>
            <p className="mt-2">
              To the extent permitted by applicable law, ResumeLens is not
              responsible for indirect losses or decisions made solely on the
              basis of automated recommendations. Nothing in these terms
              excludes liability that cannot legally be excluded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Account Suspension or Termination
            </h2>
            <p className="mt-2">
              We may restrict or suspend access where necessary to protect
              the platform, users or comply with applicable legal
              requirements.
            </p>
            <p className="mt-2">
              Users may contact support to request assistance with account
              closure or deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Changes to These Terms
            </h2>
            <p className="mt-2">
              We may update these Terms & Conditions from time to time.
              Updated terms will be published on this page with a revised
              update date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              12. Contact
            </h2>
            <p className="mt-2">
              For questions about these terms, contact:
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

export default TermsAndConditions;