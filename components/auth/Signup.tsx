"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useFormik } from "formik";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  GraduationCapIcon,
  UserPlusIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  BriefcaseIcon,
  FileTextIcon,
} from "lucide-react";

type TabType = "student" | "instructor";

// Password validation: at least 12 characters, uppercase, lowercase, numbers
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

// Name validation: only letters and spaces, no numbers or special characters
const nameRegex = /^[a-zA-Z\s]+$/;

const baseSignupSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .regex(nameRegex, "Name must contain only letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(
      passwordRegex,
      "Password must contain uppercase, lowercase, and numbers"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

const studentSignupSchema = baseSignupSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

const instructorSignupSchema = baseSignupSchema
  .extend({
    professionalTitle: z
      .string()
      .min(1, "Professional title is required")
      .min(3, "Professional title must be at least 3 characters"),
    bio: z
      .string()
      .min(1, "Bio is required")
      .min(20, "Bio must be at least 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type StudentSignupFormValues = z.infer<typeof studentSignupSchema>;
type InstructorSignupFormValues = z.infer<typeof instructorSignupSchema>;

export default function Signup() {
  const [activeTab, setActiveTab] = useState<TabType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const studentFormik = useFormik<StudentSignupFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const result = studentSignupSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await signup(
        values.email,
        values.password,
        "student",
        values.name
      );
      if (!result.success) {
        studentFormik.setFieldError("email", result.error || "Signup failed");
      }
      setIsLoading(false);
    },
  });

  const instructorFormik = useFormik<InstructorSignupFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      professionalTitle: "",
      bio: "",
    },
    validate: (values) => {
      const result = instructorSignupSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await signup(
        values.email,
        values.password,
        "instructor",
        values.name
      );
      if (!result.success) {
        instructorFormik.setFieldError(
          "email",
          result.error || "Signup failed"
        );
      }
      setIsLoading(false);
    },
  });

  const formik = activeTab === "student" ? studentFormik : instructorFormik;

  const tabs: {
    id: TabType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "student",
      label: "Student",
      description: "I want to learn",
      icon: GraduationCapIcon,
    },
    {
      id: "instructor",
      label: "Instructor",
      description: "I want to teach",
      icon: UserIcon,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-72 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute bottom-20 left-20 size-96 bg-secondary-200 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "700ms" }}
        />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <Card className="shadow-xl border-primary-100 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-default-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-default-600">
              Join Eduta and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Reset form when switching tabs
                      if (tab.id === "student") {
                        studentFormik.resetForm();
                      } else {
                        instructorFormik.resetForm();
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === tab.id
                        ? "border-primary-600 bg-primary-50 shadow-md"
                        : "border-primary-200 hover:border-primary-300 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary-600"
                            : "bg-primary-100"
                        }`}
                      >
                        <Icon
                          className={`size-6 ${
                            activeTab === tab.id
                              ? "text-white"
                              : "text-primary-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          activeTab === tab.id
                            ? "text-primary-600"
                            : "text-default-900"
                        }`}
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`text-xs mt-1 ${
                          activeTab === tab.id
                            ? "text-primary-600"
                            : "text-default-500"
                        }`}
                      >
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-default-700">
                  Full Name <span className="text-error-600">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pl-10 ${
                      formik.touched.name && formik.errors.name
                        ? "border-error-500"
                        : ""
                    }`}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-error-600 flex items-center gap-1">
                    <AlertCircleIcon className="size-3" />
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-default-700">
                  Email Address <span className="text-error-600">*</span>
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pl-10 ${
                      formik.touched.email && formik.errors.email
                        ? "border-error-500"
                        : ""
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-error-600 flex items-center gap-1">
                    <AlertCircleIcon className="size-3" />
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {activeTab === "instructor" && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="professionalTitle"
                      className="text-default-700"
                    >
                      Professional Title{" "}
                      <span className="text-error-600">*</span>
                    </Label>
                    <div className="relative">
                      <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                      <Input
                        id="professionalTitle"
                        name="professionalTitle"
                        type="text"
                        value={
                          (formik.values as InstructorSignupFormValues)
                            .professionalTitle || ""
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 ${
                          (
                            formik.touched as unknown as Partial<InstructorSignupFormValues>
                          ).professionalTitle &&
                          (
                            formik.errors as unknown as Partial<InstructorSignupFormValues>
                          ).professionalTitle
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="Senior Developer"
                        disabled={isLoading}
                      />
                    </div>
                    {(
                      formik.touched as unknown as Partial<InstructorSignupFormValues>
                    ).professionalTitle &&
                      (
                        formik.errors as unknown as Partial<InstructorSignupFormValues>
                      ).professionalTitle && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {
                            (
                              formik.errors as unknown as Partial<InstructorSignupFormValues>
                            ).professionalTitle
                          }
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-default-700">
                      Bio <span className="text-error-600">*</span>
                    </Label>
                    <div className="relative">
                      <FileTextIcon className="absolute left-3 top-3 size-5 text-default-400" />
                      <Textarea
                        id="bio"
                        name="bio"
                        value={
                          (formik.values as InstructorSignupFormValues).bio ||
                          ""
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 min-h-[100px] ${
                          (
                            formik.touched as unknown as Partial<InstructorSignupFormValues>
                          ).bio &&
                          (
                            formik.errors as unknown as Partial<InstructorSignupFormValues>
                          ).bio
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="Tell us about your experience and expertise..."
                        disabled={isLoading}
                      />
                    </div>
                    {(
                      formik.touched as unknown as Partial<InstructorSignupFormValues>
                    ).bio &&
                      (
                        formik.errors as unknown as Partial<InstructorSignupFormValues>
                      ).bio && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {
                            (
                              formik.errors as unknown as Partial<InstructorSignupFormValues>
                            ).bio
                          }
                        </p>
                      )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-default-700">
                  Password <span className="text-error-600">*</span>
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pl-10 pr-10 ${
                      formik.touched.password && formik.errors.password
                        ? "border-error-500"
                        : ""
                    }`}
                    placeholder="At least 12 characters with uppercase, lowercase, and numbers"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-error-600 flex items-center gap-1">
                    <AlertCircleIcon className="size-3" />
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-default-700">
                  Confirm Password <span className="text-error-600">*</span>
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pl-10 pr-10 ${
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                        ? "border-error-500"
                        : ""
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <UserPlusIcon className="size-4 mr-2" />
                {isLoading
                  ? "Creating account..."
                  : `Sign up as ${activeTab === "student" ? "Student" : "Instructor"}`}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-primary-200 pt-6">
            <div className="text-center w-full">
              <p className="text-default-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
