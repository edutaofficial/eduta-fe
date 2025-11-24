"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { signupUser } from "@/app/api/auth/signup";
import { useToast } from "@/components/ui/toast";
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
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(nameRegex, "First name must contain only letters and spaces"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(nameRegex, "Last name must contain only letters and spaces"),
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Check for error from NextAuth OAuth redirect
  const errorParam = searchParams.get("error");
  
  // Show error toast when OAuth fails
  useEffect(() => {
    if (errorParam && typeof window !== "undefined") {
      // Decode URL-encoded error message
      const decodedError = decodeURIComponent(errorParam);
      
      // Determine error type and message
      let errorMessage = "";
      let errorType: "error" | "warning" = "error";
      
      if (decodedError.includes("email is already in use") || 
          decodedError.includes("email already in use")) {
        errorMessage = "This email is already registered. Please sign in with your email and password, or contact support to link your Google account.";
        errorType = "warning";
      } else if (decodedError.includes("get_by_provider") || 
                 decodedError.includes("UserRepositoryAdapter")) {
        errorMessage = "OAuth authentication is currently unavailable due to a backend configuration issue. Please use email/password to sign up.";
        errorType = "error";
      } else if (decodedError.includes("OAuth authentication failed")) {
        const underlyingError = decodedError.replace("Authentication failed: OAuth authentication failed: ", "");
        if (underlyingError.includes("Failed to create user")) {
          errorMessage = "Unable to create account via Google sign-in. Please try using email/password signup instead.";
        } else {
          errorMessage = `OAuth sign-up failed: ${underlyingError}. Please try using email/password instead.`;
        }
      } else if (errorParam === "AccessDenied") {
        errorMessage = "Google sign-in was denied or failed. Please try again or use email/password to sign up.";
      } else {
        errorMessage = `Authentication error: ${decodedError}. Please try again.`;
      }
      
      // Show toast notification
      showToast(errorMessage, errorType, 8000);
      
      // Clear error from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [errorParam, showToast]);

  const signupStudentMutation = useMutation({
    mutationFn: async (values: StudentSignupFormValues) => {
      try {
        // Call signup API
        await signupUser({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          confirm_password: values.password,
          user_type: "learner",
        });

        // Auto-login after successful signup
        const res = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (res?.error) {
          return { success: false, error: "Signup succeeded but login failed" };
        }

        // Redirect based on role
        const redirect = searchParams.get("redirect");
        const session = await getSession();
        const role = (session as unknown as { role?: string })?.role;
        const dest =
          redirect ||
          (role === "instructor"
            ? "/instructor/courses"
            : "/student/courses");
        router.replace(dest);

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        // Show toast for signup errors
        showToast(errorMessage, "error", 6000);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  });

  const signupInstructorMutation = useMutation({
    mutationFn: async (values: InstructorSignupFormValues) => {
      try {
        // Call signup API
        await signupUser({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          confirm_password: values.password,
          user_type: "instructor",
          professional_title: values.professionalTitle,
          bio: values.bio,
        });

        // Auto-login after successful signup
        const res = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (res?.error) {
          return { success: false, error: "Signup succeeded but login failed" };
        }

        // Redirect based on role
        const redirect = searchParams.get("redirect");
        const session = await getSession();
        const role = (session as unknown as { role?: string })?.role;
        const dest =
          redirect ||
          (role === "instructor"
            ? "/instructor/courses"
            : "/student/courses");
        router.replace(dest);

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        // Show toast for signup errors
        showToast(errorMessage, "error", 6000);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  });

  const studentFormik = useFormik<StudentSignupFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
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
      const result = await signupStudentMutation.mutateAsync(values);
      if (!result.success) {
        studentFormik.setFieldError(
          "email",
          result.error || "Something went wrong. Please try again."
        );
      }
    },
  });

  const instructorFormik = useFormik<InstructorSignupFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
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
      const result = await signupInstructorMutation.mutateAsync(values);
      if (!result.success) {
        instructorFormik.setFieldError(
          "email",
          result.error || "Something went wrong. Please try again."
        );
      }
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-default-700">
                    First Name <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.firstName && formik.errors.firstName
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="John"
                      disabled={
                        activeTab === "student"
                          ? signupStudentMutation.isPending
                          : signupInstructorMutation.isPending
                      }
                    />
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-default-700">
                    Last Name <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.lastName && formik.errors.lastName
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Doe"
                      disabled={
                        activeTab === "student"
                          ? signupStudentMutation.isPending
                          : signupInstructorMutation.isPending
                      }
                    />
                  </div>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {formik.errors.lastName}
                    </p>
                  )}
                </div>
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
                    disabled={
                      activeTab === "student"
                        ? signupStudentMutation.isPending
                        : signupInstructorMutation.isPending
                    }
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
                        disabled={signupInstructorMutation.isPending}
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
                        disabled={signupInstructorMutation.isPending}
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
                    disabled={
                      activeTab === "student"
                        ? signupStudentMutation.isPending
                        : signupInstructorMutation.isPending
                    }
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
                    disabled={
                      activeTab === "student"
                        ? signupStudentMutation.isPending
                        : signupInstructorMutation.isPending
                    }
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
                disabled={
                  activeTab === "student"
                    ? signupStudentMutation.isPending
                    : signupInstructorMutation.isPending
                }
                className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <UserPlusIcon className="size-4 mr-2" />
                {(
                  activeTab === "student"
                    ? signupStudentMutation.isPending
                    : signupInstructorMutation.isPending
                )
                  ? "Creating account..."
                  : `Sign up as ${activeTab === "student" ? "Student" : "Instructor"}`}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  // Store user_type in cookie so OAuth callback can use it (server-side)
                  const userType = activeTab === "instructor" ? "instructor" : "learner";
                  document.cookie = `oauth_user_type=${userType}; path=/; max-age=300; SameSite=Lax`;
                  signIn("google");
                }}
                disabled={
                  activeTab === "student"
                    ? signupStudentMutation.isPending
                    : signupInstructorMutation.isPending
                }
                className="w-full mt-2 bg-white text-default-900 border border-primary-200 hover:bg-primary-50"
                size="lg"
              >
                <svg className="size-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
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
