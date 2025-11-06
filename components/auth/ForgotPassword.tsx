"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  MailIcon,
  LockIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
} from "lucide-react";

type Step = "email" | "otp" | "password";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, and numbers"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  interface ApiResponse {
    status?: string;
    message?: string;
    data?: {
      verified?: boolean;
      reset?: boolean;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  async function parseResponseSafe(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  const sendOtpMutation = useMutation({
    mutationFn: async (emailToSend: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: emailToSend }),
        }
      );
      const data = await parseResponseSafe(response);
      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || "Failed to send OTP. Please try again."
        );
      }
      return data;
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (vals: { email: string; otp: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: vals.email, otp_code: vals.otp }),
        }
      );
      const data = await parseResponseSafe(response);
      if (!response.ok || data?.status !== "success" || !data?.data?.verified) {
        throw new Error(data?.message || "Invalid OTP. Please try again.");
      }
      return data;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (vals: {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: vals.email,
            otp_code: vals.otp,
            new_password: vals.newPassword,
            confirm_password: vals.confirmPassword,
          }),
        }
      );
      const data = await parseResponseSafe(response);
      if (!response.ok || data?.status !== "success" || !data?.data?.reset) {
        throw new Error(
          data?.message || "Failed to reset password. Please try again."
        );
      }
      return data;
    },
  });

  // Timer for resend OTP
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  const emailFormik = useFormik<EmailFormValues>({
    initialValues: {
      email: "",
    },
    validate: (values) => {
      const result = emailSchema.safeParse(values);
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
      setSuccess("");
      try {
        const data = await sendOtpMutation.mutateAsync(values.email);
        setEmail(values.email);
        setSuccess(data?.message || "OTP sent to your email address");
        setStep("otp");
        setResendTimer(60);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to send OTP. Please try again.";
        emailFormik.setFieldError("email", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const otpFormik = useFormik<OtpFormValues>({
    initialValues: {
      otp: "",
    },
    validate: (values) => {
      const result = otpSchema.safeParse(values);
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
      setSuccess("");
      try {
        const data = await verifyOtpMutation.mutateAsync({
          email,
          otp: values.otp,
        });
        setOtpCode(values.otp);
        setStep("password");
        setSuccess(data?.message || "OTP verified successfully");
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to verify OTP. Please try again.";
        otpFormik.setFieldError("otp", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const passwordFormik = useFormik<PasswordFormValues>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const result = passwordSchema.safeParse(values);
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
    onSubmit: async () => {
      setIsLoading(true);
      setSuccess("");
      try {
        const data = await resetPasswordMutation.mutateAsync({
          email,
          otp: otpCode,
          newPassword: passwordFormik.values.newPassword,
          confirmPassword: passwordFormik.values.confirmPassword,
        });
        setSuccess(
          data?.message ||
            "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Failed to reset password. Please try again.";
        passwordFormik.setFieldError("newPassword", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setSuccess("");

    try {
      try {
        const data = await sendOtpMutation.mutateAsync(email);
        if (data?.status === "success") {
          setSuccess(data?.message || "OTP resent to your email address");
          setResendTimer(60);
        }
      } catch {
        // silent
      }
    } catch {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
              {mounted && step === "otp"
                ? "Enter OTP"
                : mounted && step === "password"
                  ? "Reset Password"
                  : "Forgot Password?"}
            </CardTitle>
            <CardDescription className="text-default-600">
              {mounted && step === "otp"
                ? `We've sent a 6-digit OTP to ${email}`
                : mounted && step === "password"
                  ? "Enter your new password"
                  : "Enter your email address and we'll send you an OTP"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" && (
              <form onSubmit={emailFormik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-default-700">
                    Email Address <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={emailFormik.values.email}
                      onChange={emailFormik.handleChange}
                      onBlur={emailFormik.handleBlur}
                      className={`pl-10 ${
                        emailFormik.touched.email && emailFormik.errors.email
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                  {emailFormik.touched.email && emailFormik.errors.email && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {emailFormik.errors.email}
                    </p>
                  )}
                </div>

                {success && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={otpFormik.handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center space-y-2">
                  <Label className="text-default-700">
                    Enter 6-digit OTP <span className="text-error-600">*</span>
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpFormik.values.otp}
                      onChange={(value) => {
                        otpFormik.setFieldValue("otp", value);
                        otpFormik.setFieldTouched("otp", true);
                      }}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-default-500 mt-2">
                    Enter the code sent to your email
                  </p>
                  {otpFormik.touched.otp && otpFormik.errors.otp && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {otpFormik.errors.otp}
                    </p>
                  )}
                </div>

                {success && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-default-600">
                    Didn&apos;t receive the code?
                  </span>
                  {resendTimer > 0 ? (
                    <span className="text-default-500 flex items-center gap-1">
                      <ClockIcon className="size-4" />
                      Resend in {formatTime(resendTimer)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otpFormik.values.otp.length !== 6}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}

            {step === "password" && (
              <form
                onSubmit={passwordFormik.handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-default-700">
                    New Password <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`pl-10 pr-10 ${
                        passwordFormik.touched.newPassword &&
                        passwordFormik.errors.newPassword
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
                  {passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {passwordFormik.errors.newPassword}
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
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`pl-10 pr-10 ${
                        passwordFormik.touched.confirmPassword &&
                        passwordFormik.errors.confirmPassword
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                  {passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {passwordFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>

                {success && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-primary-200">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-default-600 hover:text-default-900 transition-colors"
              >
                <ArrowLeftIcon className="size-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
