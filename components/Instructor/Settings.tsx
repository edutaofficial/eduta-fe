"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { useAuth } from "@/lib/context/AuthContext";
import { useInstructorStore } from "@/store/useInstructorStore";
import { useUpload } from "@/hooks/useUpload";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UploadFile } from "@/components/Common";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  UserIcon,
  MailIcon,
  BriefcaseIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  ClockIcon,
  InfoIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

// Name validation: only letters and spaces
const nameRegex = /^[a-zA-Z\s]+$/;

const accountSettingsSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(nameRegex, "Name must contain only letters and spaces"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(nameRegex, "Name must contain only letters and spaces"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
      "Please enter a valid phone number"
    ),
  specialization: z.string().optional(),
  bio: z.string().optional(),
});

type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export function InstructorSettings() {
  const { user } = useAuth();
  const {
    profile,
    loading,
    error: storeError,
    fetchProfile,
    updateProfile,
    clearError,
  } = useInstructorStore();

  const { useGetAssetById } = useUpload();

  const [activeTab, setActiveTab] = useState("account");
  const [profilePictureId, setProfilePictureId] = useState<number | null>(null);

  // Fetch profile picture asset only when we have a valid ID
  // This hook will automatically refetch when profilePictureId changes
  const { data: profilePictureAsset, isLoading: isLoadingAsset } =
    useGetAssetById(profilePictureId || 0);

  // Debug logging
  React.useEffect(() => {
    if (profilePictureId) {
      // eslint-disable-next-line no-console
      console.log("Profile Picture ID changed to:", profilePictureId);
      // eslint-disable-next-line no-console
      console.log("Asset data:", profilePictureAsset);
      // eslint-disable-next-line no-console
      console.log("Is loading asset:", isLoadingAsset);
    }
  }, [profilePictureId, profilePictureAsset, isLoadingAsset]);
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordResetStep, setPasswordResetStep] = useState<
    "email" | "otp" | "password"
  >("email");
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordResetSuccessMessage, setPasswordResetSuccessMessage] =
    useState("");
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update form when profile is loaded
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line no-console
      console.log("Profile loaded in Settings:", profile);
      // eslint-disable-next-line no-console
      console.log("Setting profilePictureId to:", profile.profile_picture_id);

      accountFormik.setValues({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phoneNumber: profile.phone_number || "",
        specialization: profile.specialization || "",
        bio: profile.bio || "",
      });
      setProfilePictureId(profile.profile_picture_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const accountFormik = useFormik<AccountSettingsFormValues>({
    initialValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      phoneNumber: profile?.phone_number || "",
      specialization: profile?.specialization || "",
      bio: profile?.bio || "",
    },
    validate: (values) => {
      const result = accountSettingsSchema.safeParse(values);
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
      setAccountError("");
      setAccountSuccess("");
      clearError();

      try {
        await updateProfile({
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phoneNumber || null,
          specialization: values.specialization || "",
          bio: values.bio || "",
          profile_picture_id: profilePictureId,
        });

        setAccountSuccess("Profile updated successfully!");

        // Clear success message after 5 seconds
        setTimeout(() => setAccountSuccess(""), 5000);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update profile. Please try again.";
        setAccountError(errorMessage);
      }
    },
  });

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setAccountError("No email found. Please log in again.");
      return;
    }

    setIsPasswordResetLoading(true);

    try {
      const response = await fetch(
        // `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/forgot-password`,
        "http://54.183.140.154:3005/api/v1/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || "Failed to send OTP. Please try again."
        );
      }

      setPasswordResetEmail(user.email);
      setPasswordResetStep("otp");
      setResendTimer(60);
      setShowPasswordDialog(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send password reset email. Please try again.";
      setAccountError(errorMessage);
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !passwordResetEmail) return;

    setIsPasswordResetLoading(true);

    try {
      const response = await fetch(
        // `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/forgot-password`,
        "http://54.183.140.154:3005/api/v1/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: passwordResetEmail }),
        }
      );

      const data = await response.json();

      if (response.ok && data?.status === "success") {
        setResendTimer(60);
      }
    } catch {
      // Silent fail for resend
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setIsPasswordResetLoading(true);
    setOtpError("");

    try {
      const response = await fetch(
        // `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/verify-otp`,
        "http://54.183.140.154:3005/api/v1/user/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: passwordResetEmail,
            otp_code: otpCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data?.status !== "success" || !data?.data?.verified) {
        throw new Error(data?.message || "Invalid OTP. Please try again.");
      }

      setPasswordResetStep("password");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to verify OTP. Please try again.";
      setOtpError(errorMessage);
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword || newPassword.length < 12) {
      setPasswordError("Password must be at least 12 characters");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(newPassword)) {
      setPasswordError(
        "Password must contain uppercase, lowercase, and numbers"
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsPasswordResetLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(
        // `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/reset-password`,
        "http://54.183.140.154:3005/api/v1/user/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: passwordResetEmail,
            otp_code: otpCode,
            new_password: newPassword,
            confirm_password: confirmNewPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data?.status !== "success" || !data?.data?.reset) {
        throw new Error(
          data?.message || "Failed to reset password. Please try again."
        );
      }

      setPasswordResetSuccessMessage("Password reset successfully!");

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClosePasswordDialog();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.";
      setPasswordError(errorMessage);
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setPasswordResetStep("email");
    setPasswordResetEmail("");
    setOtpCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setOtpError("");
    setPasswordError("");
    setPasswordResetSuccessMessage("");
    setResendTimer(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = () => {
    const firstName = accountFormik.values.firstName || user?.name || "I";
    const lastName = accountFormik.values.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Settings</h1>
        <p className="text-default-600 mt-2">
          Manage your profile and account preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="account">Profile Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={accountFormik.handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <Label className="text-default-700">Profile Picture</Label>
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="size-24 border-2 border-primary-200">
                        {profilePictureId && profilePictureAsset?.file_url ? (
                          <AvatarImage
                            src={profilePictureAsset.file_url}
                            alt="Profile"
                          />
                        ) : 
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-semibold">
                          {getInitials()}
                        </AvatarFallback>}
                      </Avatar>
                      {isLoadingAsset && profilePictureId && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                          <div className="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <UploadFile
                        label=""
                        accept="image/*"
                        value={profilePictureId}
                        onChange={(assetId) => {
                          // eslint-disable-next-line no-console
                          console.log("Upload changed, new asset ID:", assetId);
                          setProfilePictureId(assetId);
                        }}
                        hint="JPG, PNG or WEBP. Max size 2MB"
                      />
                    </div>
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
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
                        value={accountFormik.values.firstName}
                        onChange={accountFormik.handleChange}
                        onBlur={accountFormik.handleBlur}
                        className={`pl-10 ${
                          accountFormik.touched.firstName &&
                          accountFormik.errors.firstName
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="John"
                        disabled={loading.updateProfile}
                      />
                    </div>
                    {accountFormik.touched.firstName &&
                      accountFormik.errors.firstName && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {accountFormik.errors.firstName}
                        </p>
                      )}
                  </div>

                  {/* Last Name */}
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
                        value={accountFormik.values.lastName}
                        onChange={accountFormik.handleChange}
                        onBlur={accountFormik.handleBlur}
                        className={`pl-10 ${
                          accountFormik.touched.lastName &&
                          accountFormik.errors.lastName
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="Doe"
                        disabled={loading.updateProfile}
                      />
                    </div>
                    {accountFormik.touched.lastName &&
                      accountFormik.errors.lastName && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {accountFormik.errors.lastName}
                        </p>
                      )}
                  </div>
                </div>

                {/* Email (Read-only) */}
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
                      value={user?.email || ""}
                      className="pl-10 bg-muted cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-default-700">
                    Phone Number (Optional)
                  </Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={accountFormik.values.phoneNumber}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className={`pl-10 ${
                        accountFormik.touched.phoneNumber &&
                        accountFormik.errors.phoneNumber
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="+1234567890"
                      disabled={loading.updateProfile}
                    />
                  </div>
                  {accountFormik.touched.phoneNumber &&
                    accountFormik.errors.phoneNumber && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {accountFormik.errors.phoneNumber}
                      </p>
                    )}
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-default-700">
                    Specialization (Optional)
                  </Label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={accountFormik.values.specialization}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className="pl-10"
                      placeholder="Web Development, Data Science, etc."
                      disabled={loading.updateProfile}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-default-700">
                    Bio (Optional)
                  </Label>
                  <div className="relative">
                    <FileTextIcon className="absolute left-3 top-3 size-5 text-default-400" />
                    <Textarea
                      id="bio"
                      name="bio"
                      value={accountFormik.values.bio}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className="pl-10 min-h-[120px]"
                      placeholder="Tell us about your experience and expertise..."
                      disabled={loading.updateProfile}
                    />
                  </div>
                </div>

                {/* Social Links - Disabled with Notice */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-default-700">Social Links</Label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 border border-primary-200 rounded-md">
                      <InfoIcon className="size-3.5 text-primary-600" />
                      <span className="text-xs text-primary-700 font-medium">
                        Coming in next version
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
                    <Input placeholder="LinkedIn URL" disabled />
                    <Input placeholder="Instagram URL" disabled />
                    <Input placeholder="YouTube URL" disabled />
                  </div>
                </div>

                {(accountError || storeError) && (
                  <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircleIcon className="size-4 shrink-0" />
                    <span>{accountError || storeError}</span>
                  </div>
                )}

                {accountSuccess && (
                  <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{accountSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading.updateProfile}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {loading.updateProfile ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-default-900">
                    Reset Password
                  </h3>
                  <p className="text-sm text-default-600">
                    Click the button below to receive a password reset link via
                    email. You&apos;ll be able to set a new password without
                    entering your old one.
                  </p>

                  {accountError && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircleIcon className="size-4 shrink-0" />
                      <span>{accountError}</span>
                    </div>
                  )}

                  <Button
                    onClick={handlePasswordReset}
                    disabled={isPasswordResetLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isPasswordResetLoading
                      ? "Sending..."
                      : "Send Password Reset Email"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Reset Multi-Step Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={handleClosePasswordDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {passwordResetStep === "otp" && (
                <>
                  <CheckCircleIcon className="size-5 text-success-700" />
                  Email Sent Successfully
                </>
              )}
              {passwordResetStep === "password" && (
                <>
                  <LockIcon className="size-5 text-primary-600" />
                  Reset Password
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {passwordResetStep === "otp" &&
                "We've sent a 6-digit OTP to your email address."}
              {passwordResetStep === "password" && "Enter your new password"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step 1: OTP Entry */}
            {passwordResetStep === "otp" && (
              <>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-default-700">
                    <span className="font-semibold">Email:</span>{" "}
                    {passwordResetEmail}
                  </p>
                  <p className="text-sm text-default-600">
                    Check your inbox and enter the 6-digit OTP below. The code
                    will expire in 15 minutes.
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <Label className="text-default-700">
                    Enter 6-digit OTP <span className="text-error-600">*</span>
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={(value) => {
                        setOtpCode(value);
                        setOtpError("");
                      }}
                      disabled={isPasswordResetLoading}
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
                  {otpError && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {otpError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm border-t pt-4">
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
                      disabled={isPasswordResetLoading}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClosePasswordDialog}
                    disabled={isPasswordResetLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isPasswordResetLoading || otpCode.length !== 6}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isPasswordResetLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: New Password Entry */}
            {passwordResetStep === "password" && (
              <>
                <div className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-default-700">
                      New Password <span className="text-error-600">*</span>
                    </Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className="pl-10 pr-10"
                        placeholder="At least 12 characters with uppercase, lowercase, and numbers"
                        disabled={isPasswordResetLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOffIcon className="size-5" />
                        ) : (
                          <EyeIcon className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmNewPassword"
                      className="text-default-700"
                    >
                      Confirm Password <span className="text-error-600">*</span>
                    </Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                      <Input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className="pl-10 pr-10"
                        placeholder="Confirm new password"
                        disabled={isPasswordResetLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmNewPassword(!showConfirmNewPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmNewPassword ? (
                          <EyeOffIcon className="size-5" />
                        ) : (
                          <EyeIcon className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {passwordError}
                    </p>
                  )}

                  {passwordResetSuccessMessage && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircleIcon className="size-4 shrink-0" />
                      <span>{passwordResetSuccessMessage}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClosePasswordDialog}
                    disabled={isPasswordResetLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={
                      isPasswordResetLoading ||
                      !newPassword ||
                      !confirmNewPassword
                    }
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isPasswordResetLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
