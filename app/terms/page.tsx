import * as React from "react";
import { FileText, Scale, UserX, AlertTriangle, Gavel } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
            <FileText className="size-5" />
            <span className="font-semibold">Terms & Conditions</span>
          </div>
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            Terms and Conditions
          </h1>
          <p className="text-lg text-default-700 leading-relaxed">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
            <p className="text-default-800 leading-relaxed m-0">
              Welcome to Eduta! These Terms and Conditions govern your use of our
              platform and services. By accessing or using Eduta, you agree to be
              bound by these terms. Please read them carefully before using our
              services.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Acceptance of Terms */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Acceptance of Terms
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  By creating an account, accessing, or using Eduta&apos;s platform and
                  services, you acknowledge that you have read, understood, and agree
                  to be bound by these Terms and Conditions, as well as our Privacy
                  Policy. If you do not agree with these terms, you must not use our
                  services.
                </p>
                <p>
                  You must be at least 13 years old to use Eduta. By using our
                  services, you represent and warrant that you meet this age
                  requirement and have the legal capacity to enter into these terms.
                </p>
              </div>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                User Accounts
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  To access certain features of Eduta, you must create an account. You
                  agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Keep your password secure and confidential</li>
                  <li>
                    Notify us immediately of any unauthorized use of your account
                  </li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
                <p>
                  You may not share your account credentials with others or create
                  multiple accounts. We reserve the right to suspend or terminate
                  accounts that violate these terms.
                </p>
              </div>
            </div>

            {/* Course Content and Licenses */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Course Content and Licenses
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  <strong>For Students:</strong> When you enroll in a course, you
                  receive a limited, non-exclusive, non-transferable license to access
                  and view the course content for your personal, non-commercial use.
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share your account access with others</li>
                  <li>
                    Reproduce, distribute, or publicly display course content without
                    permission
                  </li>
                  <li>Download or copy course materials except where explicitly allowed</li>
                  <li>Use course content for commercial purposes</li>
                </ul>
                <p>
                  <strong>For Instructors:</strong> When you publish a course on
                  Eduta, you grant us a license to host, display, and distribute your
                  content on our platform. You retain ownership of your content but
                  agree that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your content does not infringe on any third-party rights</li>
                  <li>You have all necessary permissions for materials you use</li>
                  <li>Your content complies with our quality and content guidelines</li>
                  <li>You are responsible for maintaining the accuracy of your content</li>
                </ul>
              </div>
            </div>

            {/* Payments and Refunds */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Payments and Refunds
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  <strong>Pricing:</strong> Course prices are set by instructors and
                  are displayed in USD. Prices may change at any time, but changes will
                  not affect courses you&apos;ve already purchased.
                </p>
                <p>
                  <strong>Payment:</strong> When you purchase a course, you authorize
                  us to charge your payment method for the course price plus any
                  applicable taxes.
                </p>
                <p>
                  <strong>Refunds:</strong> We offer a 30-day money-back guarantee on
                  all paid courses. To request a refund:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The request must be made within 30 days of purchase</li>
                  <li>You must not have completed more than 30% of the course</li>
                  <li>Abuse of the refund policy may result in account termination</li>
                </ul>
                <p>
                  <strong>For Instructors:</strong> You will receive payment for your
                  courses according to our revenue share agreement, minus refunds,
                  chargebacks, and applicable fees.
                </p>
              </div>
            </div>

            {/* Prohibited Conduct */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserX className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Prohibited Conduct
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Violate any laws, regulations, or third-party rights
                  </li>
                  <li>Upload malicious code or interfere with our platform</li>
                  <li>
                    Harass, abuse, or harm other users or instructors
                  </li>
                  <li>
                    Impersonate others or misrepresent your identity
                  </li>
                  <li>
                    Attempt to gain unauthorized access to any part of our services
                  </li>
                  <li>
                    Use automated tools to scrape or collect data from our platform
                  </li>
                  <li>Post spam, advertising, or promotional content</li>
                  <li>
                    Create courses containing illegal or offensive content
                  </li>
                </ul>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Intellectual Property Rights
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  The Eduta platform, including its design, features, and functionality,
                  is owned by Eduta and is protected by copyright, trademark, and other
                  intellectual property laws. Our trademarks and logos may not be used
                  without our prior written permission.
                </p>
                <p>
                  Course content is owned by the respective instructors or content
                  creators. By using our platform, you respect the intellectual property
                  rights of instructors and other users.
                </p>
              </div>
            </div>

            {/* Disclaimers */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Disclaimers and Limitations of Liability
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  <strong>AS IS:</strong> Our services are provided &quot;as is&quot; without
                  warranties of any kind, either express or implied. We do not guarantee
                  that our services will be uninterrupted, secure, or error-free.
                </p>
                <p>
                  <strong>Course Quality:</strong> While we strive to maintain high
                  quality standards, we do not guarantee the accuracy, completeness, or
                  usefulness of any course content.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> To the fullest extent
                  permitted by law, Eduta shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages, including
                  loss of profits, data, or other intangible losses.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Termination
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  We reserve the right to suspend or terminate your account and access
                  to our services at any time, without notice, for conduct that we
                  believe violates these terms or is harmful to other users, us, or
                  third parties, or for any other reason.
                </p>
                <p>
                  You may terminate your account at any time by contacting us. Upon
                  termination, your right to use our services will immediately cease.
                </p>
              </div>
            </div>

            {/* Governing Law */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gavel className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Governing Law and Disputes
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  These terms shall be governed by and construed in accordance with the
                  laws of the State of California, United States, without regard to its
                  conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these terms or your use of our services
                  shall be resolved through binding arbitration in accordance with the
                  rules of the American Arbitration Association.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Changes to These Terms
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  We may modify these Terms and Conditions at any time. We will notify
                  you of any material changes by posting the new terms on this page and
                  updating the &quot;Last Updated&quot; date. Your continued use of our services
                  after such changes constitutes your acceptance of the new terms.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-default-100 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-default-900 mb-4">
                Contact Us
              </h2>
              <p className="text-default-700 mb-4">
                If you have any questions about these Terms and Conditions, please
                contact us at:
              </p>
              <div className="text-default-700 space-y-1">
                <p>
                  <strong>Email:</strong> info@eduta.org
                </p>
                <p>
                  <strong>Phone:</strong> 051-000-000-00
                </p>
                <p>
                  <strong>Address:</strong> 123 Learning Street, San Francisco, CA
                  94102, United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

