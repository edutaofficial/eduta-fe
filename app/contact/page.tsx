"use client";

import * as React from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    setTimeout(() => setSubmitStatus("idle"), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-default-700 leading-relaxed">
            Have a question or feedback? We&apos;d love to hear from you. Send us a
            message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-container mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-default-900 mb-6">
                Contact Information
              </h2>
              <p className="text-default-700 leading-relaxed mb-8">
                Reach out to us through any of the following channels. Our team is
                here to help you with any questions or concerns.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="size-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-default-900 mb-1">Email</h3>
                  <p className="text-default-700">info@eduta.org</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="size-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-default-900 mb-1">Phone</h3>
                  <p className="text-default-700">051-000-000-00</p>
                  <p className="text-sm text-default-600">
                    Monday - Friday, 9am - 6pm PST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-default-900 mb-1">Office</h3>
                  <p className="text-default-700">
                    123 Learning Street
                    <br />
                    San Francisco, CA 94102
                    <br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-default-900 mb-2">
                Quick Response Time
              </h3>
              <p className="text-sm text-default-700">
                We typically respond to all inquiries within 24 hours during
                business days.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-default-900 mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="What is this about?"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>

              {submitStatus === "success" && (
                <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
                  Thank you! Your message has been sent successfully. We&apos;ll get
                  back to you soon.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700"
                size="lg"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="size-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

