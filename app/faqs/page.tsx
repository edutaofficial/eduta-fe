"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
      <section className="w-full mx-auto py-16 space-y-14">
        {/* Top Badge + Heading + Search to match FAQ component styling */}
        <div className="space-y-6 flex flex-col items-center text-center max-w-container mx-auto md:px-6 px-4">
          <Search className="absolute left-[-9999px] hidden" aria-hidden="true" />
          <div className="flex flex-col items-center gap-6">
            <Badge variant="info">FAQs</Badge>
            <h1 className="text-2xl md:text-4xl font-semibold text-default-900">
              Frequently Asked Questions
            </h1>
          </div>
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-default-400" />
            <Input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Main FAQS */}
        <div className="flex flex-col max-w-container mx-auto md:px-6 px-4">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.flatMap((category, categoryIndex) =>
                category.questions.map((faq, index) => (
                  <AccordionItem
                    key={`${categoryIndex}-${index}`}
                    value={`${categoryIndex}-${index}`}
                    className="border border-default-200 rounded-lg bg-white mb-3"
                  >
                    <AccordionTrigger className="text-left text-lg md:text-xl font-medium px-4 md:px-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base px-4 md:px-6 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
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
        </div>
      </section>
    </div>
  );
}

