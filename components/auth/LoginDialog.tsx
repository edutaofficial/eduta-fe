"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { signIn, getSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Sign in to continue",
  description = "Please sign in to access this feature",
}: LoginDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (!res || res.error) {
          return {
            success: false,
            error: res?.error || "Invalid email or password",
          };
        }

        return { success: true };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Login error:", error);
        return {
          success: false,
          error: "Something went wrong. Please try again.",
        };
      }
    },
  });

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
      const result = await loginMutation.mutateAsync(values);
      if (!result.success) {
        formik.setFieldError(
          "password",
          result.error || "Something went wrong. Please try again."
        );
      }
      if (result.success) {
        // Refresh session
        await getSession();
        // Close dialog
        onOpenChange(false);
        // Reset form
        formik.resetForm();
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5 mt-4">
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
                disabled={loginMutation.isPending}
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
                onClick={() => onOpenChange(false)}
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
                disabled={loginMutation.isPending}
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
            disabled={loginMutation.isPending}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            size="lg"
          >
            <LogInIcon className="size-4 mr-2" />
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>

          <Button
            type="button"
            onClick={() => signIn("google")}
            disabled={loginMutation.isPending}
            className="w-full bg-white text-default-900 border border-primary-200 hover:bg-primary-50"
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

          <div className="text-center pt-2">
            <p className="text-default-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

