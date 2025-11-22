import * as React from "react";
import { Shield, Lock, Eye, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
            <Shield className="size-5" />
            <span className="font-semibold">Privacy Policy</span>
          </div>
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            Your Privacy Matters
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
              At Eduta, we take your privacy seriously. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you
              use our platform. Please read this policy carefully to understand our
              practices regarding your personal data.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Information We Collect */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Information We Collect
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                    password, and profile information when you create an account.
                  </li>
                  <li>
                    <strong>Course Data:</strong> Information about courses you
                    create, enroll in, or interact with, including progress and
                    completion data.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Billing details processed
                    securely through our payment providers (we do not store full
                    credit card information).
                  </li>
                  <li>
                    <strong>Communications:</strong> Messages you send us, feedback,
                    reviews, and other content you submit.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our
                    platform, including pages visited, features used, and interaction
                    patterns.
                  </li>
                </ul>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  How We Use Your Information
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>
                    Respond to your comments, questions, and customer service requests
                  </li>
                  <li>
                    Communicate with you about courses, features, and promotional
                    offers
                  </li>
                  <li>
                    Monitor and analyze trends, usage, and activities on our platform
                  </li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Personalize your learning experience</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Data Security
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  We implement appropriate technical and organizational measures to
                  protect your personal information against unauthorized access, loss,
                  or alteration. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Strict access controls and authentication procedures</li>
                  <li>Employee training on data protection practices</li>
                  <li>Secure data centers with physical security measures</li>
                </ul>
                <p>
                  However, no method of transmission over the internet is 100% secure.
                  While we strive to protect your personal information, we cannot
                  guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Information Sharing */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Information Sharing and Disclosure
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>With Instructors:</strong> When you enroll in a course,
                    instructors may see your name and learning progress.
                  </li>
                  <li>
                    <strong>Service Providers:</strong> We share information with
                    third-party vendors who perform services on our behalf (e.g.,
                    payment processing, analytics, hosting).
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to
                    protect our rights, safety, or property.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger,
                    acquisition, or sale of assets.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> When you explicitly agree to
                    share information.
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Your Rights and Choices
              </h2>
              <div className="space-y-4 text-default-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Access and Update:</strong> You can access and update your
                    account information at any time through your profile settings.
                  </li>
                  <li>
                    <strong>Delete:</strong> You can request deletion of your account
                    and personal data by contacting us.
                  </li>
                  <li>
                    <strong>Opt-Out:</strong> You can opt out of marketing
                    communications by following the unsubscribe link in our emails.
                  </li>
                  <li>
                    <strong>Data Portability:</strong> You can request a copy of your
                    data in a structured format.
                  </li>
                  <li>
                    <strong>Cookies:</strong> You can control cookie preferences
                    through your browser settings.
                  </li>
                </ul>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-4">
                Children&apos;s Privacy
              </h2>
              <div className="space-y-4 text-default-700">
                <p>
                  Our services are not intended for children under 13 years of age. We
                  do not knowingly collect personal information from children under 13.
                  If we become aware that we have collected personal information from a
                  child under 13, we will take steps to delete such information.
                </p>
              </div>
            </div>

            {/* Changes to Policy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="size-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-default-900 m-0">
                  Changes to This Policy
                </h2>
              </div>
              <div className="space-y-4 text-default-700">
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or legal requirements. We will notify you of
                  any material changes by posting the new policy on this page and
                  updating the &quot;Last Updated&quot; date. We encourage you to review this
                  policy periodically.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-default-100 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-default-900 mb-4">
                Contact Us
              </h2>
              <p className="text-default-700 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
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

