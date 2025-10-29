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
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  LockIcon,
  LogInIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const result = loginSchema.safeParse(values);
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
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await login(values.email, values.password);
      if (!result.success) {
        formik.setFieldError("password", result.error || "Login failed");
      }
      setIsLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20 relative overflow-hidden">
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-default-600">
              Sign in to your Eduta account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-default-700">
                  Email Address
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
                    placeholder="Enter your email"
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-default-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                    placeholder="Enter your password"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <LogInIcon className="size-4 mr-2" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-primary-200 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-default-500">
                  Demo Credentials
                </span>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4 space-y-2 text-sm border border-primary-100 w-full">
              <p className="font-medium text-default-700">Test Accounts:</p>
              <div className="space-y-1 text-default-600">
                <p>• Student: student@eduta.org</p>
                <p>• Instructor: instructor@eduta.org</p>
                <p>• Admin: admin@eduta.org</p>
                <p className="text-xs mt-2 text-default-500">
                  Passwords: StudentPassword123 / InstructorPass123 /
                  AdminPassword123
                </p>
              </div>
            </div>

            <div className="text-center w-full pt-2">
              <p className="text-default-600 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
