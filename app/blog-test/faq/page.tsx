"use client";

import * as React from "react";
import FAQComponent from "@/components/Home/FAQ";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Dummy FAQ data
const dummyFAQs = [
  {
    faqId: "faq-1",
    question: "What is Eduta and how does it work?",
    answer: "Eduta is an online learning platform that connects students with expert instructors from around the world. You can browse through thousands of courses, enroll in the ones that interest you, and learn at your own pace. Our platform offers video lectures, downloadable resources, quizzes, and certificates upon completion."
  },
  {
    faqId: "faq-2",
    question: "How do I enroll in a course?",
    answer: "Enrolling in a course is simple! Browse our course catalog, click on the course you're interested in, and click the 'Enroll Now' button on the course detail page. If it's a paid course, you'll be directed to checkout. Once enrolled, you'll have immediate access to all course materials."
  },
  {
    faqId: "faq-3",
    question: "Are the courses self-paced or scheduled?",
    answer: "Most courses on Eduta are self-paced, meaning you can start learning immediately and progress through the material at your own speed. You'll have lifetime access to the course content, so you can revisit lessons whenever you need. Some specialized courses may have scheduled live sessions, which will be clearly indicated on the course page."
  },
  {
    faqId: "faq-4",
    question: "Do I get a certificate after completing a course?",
    answer: "Yes! Upon successfully completing a course (watching all lectures and passing any required assessments), you'll receive a certificate of completion. You can download your certificate as a PDF and share it on your LinkedIn profile or resume. All certificates include a unique verification code."
  },
  {
    faqId: "faq-5",
    question: "What is your refund policy?",
    answer: "We offer a 30-day money-back guarantee on all paid courses. If you're not satisfied with a course for any reason, you can request a full refund within 30 days of purchase. Simply contact our support team, and we'll process your refund promptly. Note that this policy applies to courses, not subscriptions."
  },
  {
    faqId: "faq-6",
    question: "Can I access courses on mobile devices?",
    answer: "Absolutely! Eduta is fully responsive and works seamlessly on all devices including smartphones, tablets, laptops, and desktops. You can learn on the go, switch between devices, and your progress will be automatically synced across all platforms."
  },
  {
    faqId: "faq-7",
    question: "How do I become an instructor on Eduta?",
    answer: "We're always looking for talented instructors! To become an instructor, click on 'Teach on Eduta' in the footer or header menu. You'll need to create an instructor account, submit your profile for review, and once approved, you can start creating and publishing courses. We provide all the tools and support you need to create engaging content."
  },
  {
    faqId: "faq-8",
    question: "Are there free courses available?",
    answer: "Yes! We have a wide selection of free courses across various categories. You can filter for free courses using the price filter on our course catalog page. Free courses offer the same quality content and certificates as paid courses, making them perfect for trying out the platform or learning new skills on a budget."
  },
  {
    faqId: "faq-9",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods depending on your region. All transactions are securely processed and your payment information is encrypted."
  },
  {
    faqId: "faq-10",
    question: "Can I download course videos for offline viewing?",
    answer: "Selected courses offer downloadable video content for premium subscribers. The availability of offline downloads depends on the instructor's settings and your subscription plan. When available, you'll see a download icon next to video lectures. Please note that downloaded content is for personal use only and subject to our terms of service."
  },
  {
    faqId: "faq-11",
    question: "How can I contact course instructors?",
    answer: "Each course has a Q&A section where you can post questions directly to the instructor. Instructors typically respond within 24-48 hours. You can also view answers to questions posted by other students. For urgent matters, you can visit the instructor's profile page to see their preferred contact methods."
  },
  {
    faqId: "faq-12",
    question: "What if I need technical support?",
    answer: "Our support team is here to help! You can reach us through the 'Contact Support' link in the footer, or email us directly at support@eduta.com. We typically respond within 24 hours on weekdays. For common technical issues, check our Help Center which has step-by-step guides and troubleshooting tips."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-default-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/blog-test">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 mb-6"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Test Page
            </Button>
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-primary-100">
              Find answers to common questions about Eduta, our courses, and how to get the most out of your learning experience.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white">
        <FAQComponent faqs={dummyFAQs} />
      </div>

      {/* Additional Help Section */}
      <div className="bg-default-100 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-default-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-default-700 mb-8">
            Can&apos;t find the answer you&apos;re looking for? Our support team is ready to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              Visit Help Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

