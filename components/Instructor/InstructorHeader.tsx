"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CreditCardIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInstructorStore } from "@/store/useInstructorStore";
import { useAuth } from "@/lib/context/AuthContext";

export function InstructorHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const { profile, fetchProfile, loading } = useInstructorStore();

  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);

  React.useEffect(() => {
    if (!profile && !loading.fetchProfile && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      fetchProfile().catch(() => {
        // Silently fail - header is not critical
      });
    }
  }, [fetchProfile, loading.fetchProfile, profile, hasAttemptedFetch]);

  const name = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`
    : session?.user?.name || "Instructor";
  const email = session?.user?.email || "instructor@eduta.org";

  // Prefer auth user (has signed URL), then profile URL, then session image
  const avatarUrl =
    (authUser as { profilePictureUrl?: string } | undefined)?.profilePictureUrl ||
    profile?.profile_picture_url ||
    (session?.user as { image?: string } | undefined)?.image ||
    null;

  const menuItems = [
    {
      id: "courses",
      name: "Courses",
      icon: BookOpenIcon,
      href: "/instructor/courses",
    },
    {
      id: "announcements",
      name: "Announcement",
      icon: MegaphoneIcon,
      href: "/instructor/announcements",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: ChartBarIcon,
      href: "/instructor/analytics",
    },
    {
      id: "payments",
      name: "Payment",
      icon: CreditCardIcon,
      href: "/instructor/payments",
    },
    {
      id: "settings",
      name: "Settings",
      icon: SettingsIcon,
      href: "/instructor/settings",
    },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const getInitials = () => {
    const firstName = profile?.first_name || name || "I";
    const lastName = profile?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <header className="bg-white shadow-md fixed top-0 right-0 z-30 py-4 px-6 left-0 md:left-20">
      <div className="flex items-center md:justify-between justify-end w-full max-w-[1400px] mx-auto">
        {/* Page Title - Hidden on mobile */}
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-default-900">
            Instructor Dashboard
          </h1>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-10 rounded-full p-0"
              >
                <Avatar className="size-10" key={avatarUrl || "no-avatar"}>
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" key={avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-75" align="end">
              {/* User Info Section */}
              <div className="flex items-center gap-3 p-4">
                <Avatar className="size-14" key={avatarUrl || "no-avatar-dropdown"}>
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" key={avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold line-clamp-1">{name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {email}
                  </p>
                </div>
              </div>

              <div className="my-1 h-px bg-default-200" />

              {/* Menu Items */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);

                return (
                  <DropdownMenuItem
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                      isActive
                        ? "bg-primary-50 text-primary-600 font-medium"
                        : ""
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="text-sm flex-1">{item.name}</span>
                  </DropdownMenuItem>
                );
              })}

              <div className="my-1 h-px bg-default-200" />

              {/* Logout */}
              <DropdownMenuItem
                className="flex items-center gap-3 px-4 py-3 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOutIcon className="size-5 shrink-0" />
                <span className="text-sm">Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
