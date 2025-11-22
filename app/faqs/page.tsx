"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const faqCategories = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create an account on Eduta?",
        answer:
          "Creating an account is easy! Click the 'Sign up' button in the top right corner, choose whether you want to be a student or instructor, fill in your details, and you're ready to start your learning journey.",
      },
      {
        question: "Is Eduta free to use?",
        answer:
          "Eduta is free to join! You can browse courses and access free content. Some courses require payment, but we also offer many free courses to help you get started.",
      },
      {
        question: "What types of courses are available?",
        answer:
          "We offer a wide variety of courses across multiple categories including technology, business, design, personal development, and more. Each course is created by expert instructors and designed to help you achieve your learning goals.",
      },
    ],
  },
  {
    category: "Courses & Learning",
    questions: [
      {
        question: "How do I enroll in a course?",
        answer:
          "Simply browse our course catalog, click on a course you're interested in, and click the 'Enroll Now' button. If it's a paid course, you'll be guided through the payment process. Once enrolled, you can access the course immediately.",
      },
      {
        question: "Can I get a refund if I don't like a course?",
        answer:
          "Yes! We offer a 30-day money-back guarantee on all paid courses. If you're not satisfied with a course for any reason, you can request a full refund within 30 days of purchase.",
      },
      {
        question: "Do I get a certificate after completing a course?",
        answer:
          "Yes, you'll receive a certificate of completion for every course you finish. These certificates can be shared on your LinkedIn profile or added to your resume to showcase your new skills.",
      },
      {
        question: "Can I access courses on mobile devices?",
        answer:
          "Absolutely! Eduta is fully responsive and works on all devices including smartphones, tablets, and desktop computers. Learn anytime, anywhere at your own pace.",
      },
    ],
  },
  {
    category: "For Instructors",
    questions: [
      {
        question: "How do I become an instructor on Eduta?",
        answer:
          "To become an instructor, sign up for an instructor account and complete your profile. You'll need to provide information about your expertise and teaching experience. Once approved, you can start creating and publishing courses.",
      },
      {
        question: "How much can I earn as an instructor?",
        answer:
          "Instructor earnings vary based on course pricing, enrollment numbers, and engagement. You set your own course prices, and we offer a competitive revenue share model. Many successful instructors earn substantial income from their courses.",
      },
      {
        question: "What tools do I need to create a course?",
        answer:
          "You'll need basic recording equipment (a good microphone and camera), video editing software, and your expertise! Our platform provides all the tools you need to upload content, create quizzes, and manage your students.",
      },
      {
        question: "How long does it take to create and publish a course?",
        answer:
          "The time varies depending on your course length and complexity. Once you've created your content, uploading and publishing typically takes a few hours. Our team reviews all courses to ensure quality standards are met before they go live.",
      },
    ],
  },
  {
    category: "Payment & Billing",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods depending on your region. All payments are processed securely.",
      },
      {
        question: "Are there any subscription plans?",
        answer:
          "Currently, courses are purchased individually. However, we're working on introducing subscription plans that will give you access to multiple courses for a monthly fee. Stay tuned!",
      },
      {
        question: "How do instructors receive payment?",
        answer:
          "Instructors receive payments monthly through PayPal or bank transfer (depending on your location). Payments are processed within 5-7 business days after the end of each month.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble accessing my course. What should I do?",
        answer:
          "First, try clearing your browser cache and cookies, or try accessing the course from a different browser. If the problem persists, contact our support team at info@eduta.org with details about the issue, and we'll help you resolve it quickly.",
      },
      {
        question: "The video won't play. How can I fix this?",
        answer:
          "Ensure you have a stable internet connection and that your browser is up to date. Try switching to a different browser or disabling browser extensions that might interfere with video playback. If issues continue, reach out to our support team.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to reset your password. If you don't receive the email, check your spam folder or contact support.",
      },
    ],
  },
];

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredFAQs = React.useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;

    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-default-700 leading-relaxed mb-8">
            Find answers to common questions about Eduta. Can&apos;t find what you&apos;re
            looking for? Contact our support team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-default-400" />
            <Input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        {filteredFAQs.length > 0 ? (
          <div className="space-y-12">
            {filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-default-900 mb-6">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${categoryIndex}-${index}`}
                      className="bg-white rounded-lg border border-default-200 px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold text-default-900 pr-4">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-default-700 leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-default-600">
              No questions found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-default-500 mt-2">
              Try different keywords or contact our support team.
            </p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-primary-50 border-y border-primary-200 py-12">
        <div className="max-w-container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-default-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-default-700 mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
            >
              Contact Support
            </a>
            <a
              href="mailto:info@eduta.org"
              className="inline-block bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

