"use client";

import * as React from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContact } from "@/app/api/contact/submitContact";
import { extractErrorMessage } from "@/lib/errorUtils";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Zod validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .min(3, "Subject must be at least 3 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = React.useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: (data) => {
      setSubmitStatus({
        type: "success",
        message:
          data.message ||
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });
      formik.resetForm();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error);
      setSubmitStatus({
        type: "error",
        message: errorMessage || "Failed to send message. Please try again.",
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    },
  });

  const formik = useFormik<ContactFormValues>({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      subject: "",
      message: "",
    },
    validate: (values) => {
      try {
        contactSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          return errors;
        }
        return {};
      }
    },
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-default-700 leading-relaxed">
            Have a question or feedback? We&apos;d love to hear from you. Send
            us a message and we&apos;ll respond as soon as possible.
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
                Reach out to us through any of the following channels. Our team
                is here to help you with any questions or concerns.
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
                  <p className="text-default-700">+1 (289) 698-5448</p>
                  <p className="text-sm text-default-600">
                    Monday - Friday, 9am - 6pm EST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-default-900 mb-1">
                    Office Address
                  </h3>
                  <p className="text-default-700">
                    Eduta, Inc.
                    <br />
                    169 Fifth Avenue
                    <br />
                    Kitchener, Ontario, N2C 1P6
                    <br />
                    Canada
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
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Your name"
                  disabled={mutation.isPending}
                  className={
                    formik.touched.name && formik.errors.name
                      ? "border-destructive"
                      : ""
                  }
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-destructive">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="your.email@example.com"
                  disabled={mutation.isPending}
                  className={
                    formik.touched.email && formik.errors.email
                      ? "border-destructive"
                      : ""
                  }
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-destructive">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formik.values.phoneNumber}
                  onChange={(value) => {
                    formik.setFieldValue("phoneNumber", value || "");
                  }}
                  onBlur={() => formik.setFieldTouched("phoneNumber", true)}
                  disabled={mutation.isPending}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                      ? "border-destructive"
                      : ""
                  }`}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {formik.errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="What is this about?"
                  disabled={mutation.isPending}
                  className={
                    formik.touched.subject && formik.errors.subject
                      ? "border-destructive"
                      : ""
                  }
                />
                {formik.touched.subject && formik.errors.subject && (
                  <p className="text-sm text-destructive">
                    {formik.errors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  disabled={mutation.isPending}
                  className={`resize-none ${formik.touched.message && formik.errors.message ? "border-destructive" : ""}`}
                />
                {formik.touched.message && formik.errors.message && (
                  <p className="text-sm text-destructive">
                    {formik.errors.message}
                  </p>
                )}
              </div>

              {submitStatus.type === "success" && (
                <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <p>{submitStatus.message}</p>
                </div>
              )}

              {submitStatus.type === "error" && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <p>{submitStatus.message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending || !formik.isValid}
                className="w-full bg-primary-600 hover:bg-primary-700"
                size="lg"
              >
                {mutation.isPending ? (
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
