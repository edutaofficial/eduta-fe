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

