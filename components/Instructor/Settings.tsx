"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { useAuth } from "@/lib/context/AuthContext";
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
  UserIcon,
  MailIcon,
  BriefcaseIcon,
  FileTextIcon,
  LinkedinIcon,
  InstagramIcon,
  YoutubeIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UploadIcon,
} from "lucide-react";

// Password validation: at least 12 characters, uppercase, lowercase, numbers
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

// Name validation: only letters and spaces
const nameRegex = /^[a-zA-Z\s]+$/;

// URL validation (optional)
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const accountSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .regex(nameRegex, "Name must contain only letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  professionalTitle: z
    .string()
    .min(1, "Professional title is required")
    .min(3, "Professional title must be at least 3 characters"),
  bio: z
    .string()
    .min(1, "Bio is required")
    .min(20, "Bio must be at least 20 characters"),
  linkedin: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlRegex.test(val),
      "Please enter a valid LinkedIn URL"
    ),
  instagram: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlRegex.test(val),
      "Please enter a valid Instagram URL"
    ),
  youtube: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlRegex.test(val),
      "Please enter a valid YouTube URL"
    ),
});

const accountSecuritySchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
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

type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;
type AccountSecurityFormValues = z.infer<typeof accountSecuritySchema>;

export function InstructorSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  const accountFormik = useFormik<AccountSettingsFormValues>({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      professionalTitle: "",
      bio: "",
      linkedin: "",
      instagram: "",
      youtube: "",
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
    onSubmit: async (_values) => {
      setIsAccountLoading(true);
      setAccountError("");
      setAccountSuccess("");

      try {
        // 🔴 REPLACE WITH REAL API CALL
        // API Endpoint: PUT /api/instructor/settings/account
        // Request Body: { name, email, professionalTitle, bio, profileImage, linkedin, instagram, youtube }
        // Expected Response: { success: boolean, message?: string, error?: string }
        // const response = await fetch("/api/instructor/settings/account", {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     name: _values.name,
        //     email: _values.email,
        //     professionalTitle: _values.professionalTitle,
        //     bio: _values.bio,
        //     profileImage,
        //     linkedin: _values.linkedin,
        //     instagram: _values.instagram,
        //     youtube: _values.youtube,
        //   }),
        // });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAccountSuccess("Account settings updated successfully!");
      } catch {
        setAccountError("Failed to update account settings. Please try again.");
      } finally {
        setIsAccountLoading(false);
      }
    },
  });

  const securityFormik = useFormik<AccountSecurityFormValues>({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const result = accountSecuritySchema.safeParse(values);
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
    onSubmit: async (_values) => {
      setIsSecurityLoading(true);
      setSecurityError("");
      setSecuritySuccess("");

      try {
        // 🔴 REPLACE WITH REAL API CALL
        // API Endpoint: PUT /api/instructor/settings/security
        // Request Body: { oldPassword, newPassword }
        // Expected Response: { success: boolean, message?: string, error?: string }
        // const response = await fetch("/api/instructor/settings/security", {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     oldPassword: _values.oldPassword,
        //     newPassword: _values.newPassword,
        //   }),
        // });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSecuritySuccess("Password changed successfully!");
        securityFormik.resetForm();
      } catch {
        setSecurityError("Failed to change password. Please try again.");
      } finally {
        setIsSecurityLoading(false);
      }
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🔴 In production, upload to backend and get URL
      // For now, create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Settings</h1>
        <p className="text-default-600 mt-2">
          Manage your account settings and security preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="security">Account Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader className="hidden">
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your profile information and social links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={accountFormik.handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label className="text-default-700">Profile Picture</Label>
                  <div className="flex items-center gap-6">
                    <Avatar className="size-20">
                      {profileImage ? (
                        <AvatarImage src={profileImage} alt="Profile" />
                      ) : null}
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                        {accountFormik.values.name?.charAt(0)?.toUpperCase() ||
                          "I"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label
                        htmlFor="profile-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <UploadIcon className="size-4" />
                        Upload Photo
                      </Label>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-default-500 mt-2">
                        JPG, PNG or GIF. Max size 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
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
                      value={accountFormik.values.name}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className={`pl-10 ${
                        accountFormik.touched.name && accountFormik.errors.name
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="John Doe"
                      disabled={isAccountLoading}
                    />
                  </div>
                  {accountFormik.touched.name && accountFormik.errors.name && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {accountFormik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
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
                      value={accountFormik.values.email}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className={`pl-10 ${
                        accountFormik.touched.email &&
                        accountFormik.errors.email
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="you@example.com"
                      disabled={isAccountLoading}
                    />
                  </div>
                  {accountFormik.touched.email &&
                    accountFormik.errors.email && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {accountFormik.errors.email}
                      </p>
                    )}
                </div>

                {/* Professional Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="professionalTitle"
                    className="text-default-700"
                  >
                    Professional Title <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                    <Input
                      id="professionalTitle"
                      name="professionalTitle"
                      type="text"
                      value={accountFormik.values.professionalTitle}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className={`pl-10 ${
                        accountFormik.touched.professionalTitle &&
                        accountFormik.errors.professionalTitle
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Senior Developer"
                      disabled={isAccountLoading}
                    />
                  </div>
                  {accountFormik.touched.professionalTitle &&
                    accountFormik.errors.professionalTitle && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {accountFormik.errors.professionalTitle}
                      </p>
                    )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-default-700">
                    Bio <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <FileTextIcon className="absolute left-3 top-3 size-5 text-default-400" />
                    <Textarea
                      id="bio"
                      name="bio"
                      value={accountFormik.values.bio}
                      onChange={accountFormik.handleChange}
                      onBlur={accountFormik.handleBlur}
                      className={`pl-10 min-h-[120px] ${
                        accountFormik.touched.bio && accountFormik.errors.bio
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Tell us about your experience and expertise..."
                      disabled={isAccountLoading}
                    />
                  </div>
                  {accountFormik.touched.bio && accountFormik.errors.bio && (
                    <p className="text-sm text-error-600 flex items-center gap-1">
                      <AlertCircleIcon className="size-3" />
                      {accountFormik.errors.bio}
                    </p>
                  )}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-default-700">Social Links</Label>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-default-600">
                      LinkedIn (Optional)
                    </Label>
                    <div className="relative">
                      <LinkedinIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                      <Input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={accountFormik.values.linkedin || ""}
                        onChange={accountFormik.handleChange}
                        onBlur={accountFormik.handleBlur}
                        className={`pl-10 ${
                          accountFormik.touched.linkedin &&
                          accountFormik.errors.linkedin
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                        disabled={isAccountLoading}
                      />
                    </div>
                    {accountFormik.touched.linkedin &&
                      accountFormik.errors.linkedin && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {accountFormik.errors.linkedin}
                        </p>
                      )}
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-default-600">
                      Instagram (Optional)
                    </Label>
                    <div className="relative">
                      <InstagramIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                      <Input
                        id="instagram"
                        name="instagram"
                        type="url"
                        value={accountFormik.values.instagram || ""}
                        onChange={accountFormik.handleChange}
                        onBlur={accountFormik.handleBlur}
                        className={`pl-10 ${
                          accountFormik.touched.instagram &&
                          accountFormik.errors.instagram
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="https://instagram.com/yourprofile"
                        disabled={isAccountLoading}
                      />
                    </div>
                    {accountFormik.touched.instagram &&
                      accountFormik.errors.instagram && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {accountFormik.errors.instagram}
                        </p>
                      )}
                  </div>

                  {/* YouTube */}
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="text-default-600">
                      YouTube (Optional)
                    </Label>
                    <div className="relative">
                      <YoutubeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
                      <Input
                        id="youtube"
                        name="youtube"
                        type="url"
                        value={accountFormik.values.youtube || ""}
                        onChange={accountFormik.handleChange}
                        onBlur={accountFormik.handleBlur}
                        className={`pl-10 ${
                          accountFormik.touched.youtube &&
                          accountFormik.errors.youtube
                            ? "border-error-500"
                            : ""
                        }`}
                        placeholder="https://youtube.com/@yourchannel"
                        disabled={isAccountLoading}
                      />
                    </div>
                    {accountFormik.touched.youtube &&
                      accountFormik.errors.youtube && (
                        <p className="text-sm text-error-600 flex items-center gap-1">
                          <AlertCircleIcon className="size-3" />
                          {accountFormik.errors.youtube}
                        </p>
                      )}
                  </div>
                </div>

                {accountError && (
                  <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircleIcon className="size-4 shrink-0" />
                    <span>{accountError}</span>
                  </div>
                )}

                {accountSuccess && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{accountSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isAccountLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isAccountLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={securityFormik.handleSubmit}
                className="space-y-5"
              >
                {/* Old Password */}
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-default-700">
                    Current Password <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={securityFormik.values.oldPassword}
                      onChange={securityFormik.handleChange}
                      onBlur={securityFormik.handleBlur}
                      className={`pl-10 pr-10 ${
                        securityFormik.touched.oldPassword &&
                        securityFormik.errors.oldPassword
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Enter your current password"
                      disabled={isSecurityLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showOldPassword ? (
                        <EyeOffIcon className="size-5" />
                      ) : (
                        <EyeIcon className="size-5" />
                      )}
                    </button>
                  </div>
                  {securityFormik.touched.oldPassword &&
                    securityFormik.errors.oldPassword && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {securityFormik.errors.oldPassword}
                      </p>
                    )}
                </div>

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
                      value={securityFormik.values.newPassword}
                      onChange={securityFormik.handleChange}
                      onBlur={securityFormik.handleBlur}
                      className={`pl-10 pr-10 ${
                        securityFormik.touched.newPassword &&
                        securityFormik.errors.newPassword
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="At least 12 characters with uppercase, lowercase, and numbers"
                      disabled={isSecurityLoading}
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
                  {securityFormik.touched.newPassword &&
                    securityFormik.errors.newPassword && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {securityFormik.errors.newPassword}
                      </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-default-700">
                    Confirm New Password{" "}
                    <span className="text-error-600">*</span>
                  </Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400 z-10" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={securityFormik.values.confirmPassword}
                      onChange={securityFormik.handleChange}
                      onBlur={securityFormik.handleBlur}
                      className={`pl-10 pr-10 ${
                        securityFormik.touched.confirmPassword &&
                        securityFormik.errors.confirmPassword
                          ? "border-error-500"
                          : ""
                      }`}
                      placeholder="Confirm your new password"
                      disabled={isSecurityLoading}
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
                  {securityFormik.touched.confirmPassword &&
                    securityFormik.errors.confirmPassword && (
                      <p className="text-sm text-error-600 flex items-center gap-1">
                        <AlertCircleIcon className="size-3" />
                        {securityFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>

                {securityError && (
                  <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircleIcon className="size-4 shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                {securitySuccess && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircleIcon className="size-4 shrink-0" />
                    <span>{securitySuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSecurityLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isSecurityLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
