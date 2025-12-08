"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuTrigger,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavMenuContentModified } from "@/components/ui/nav-menu-content-modified";
import { Separator } from "@/components/ui/separator";

import Image from "next/image";

import SearchComponent from "./SearchComponent";
import MobileMenu from "./MobileMenu";
import MobileUserDrawer from "./MobileUserDrawer";
import MobileSearchModal, { MobileSearchTrigger } from "./MobileSearchModal";
import { BlogDropdown } from "./BlogDropdown";
import { CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import {
  HeartIcon,
  LogInIcon,
  GraduationCapIcon,
  AwardIcon,
  ShoppingCartIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCategoryStore } from "@/store/useCategoryStore";

// Explore with Categories Dropdown Component
function ExploreDropdown({
  exploreTriggerRef,
}: {
  exploreTriggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { categories, loading } = useCategoryStore();
  const router = useRouter();

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger 
        ref={exploreTriggerRef}
        onClick={(e) => {
          // On direct click, navigate to all courses
          e.preventDefault();
          router.push("/topics");
        }}
      >
        Explore
      </NavigationMenuTrigger>
      <NavMenuContentModified triggerRef={exploreTriggerRef} className="left-0">
        <ul className="grid w-[25rem] gap-2 p-4 md:w-[31.25rem] md:grid-cols-2 lg:w-[37.5rem]">
          {loading ? (
            // Skeleton
            <>
              {[...Array(6)].map((_, i) => (
                <li key={i} className="p-3">
                  <div className="h-4 w-32 bg-default-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-full bg-default-200 animate-pulse rounded" />
                </li>
              ))}
            </>
          ) : (
            categories.slice(0, 8).map((category) => (
              <li key={category.categoryId}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/topics?categories=${category.categoryId}`}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-primary-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-semibold leading-none line-clamp-1">
                      {category.name}
                    </div>
                    <p className="text-sm leading-snug text-muted-foreground line-clamp-2 break-words">
                      {category.description ||
                        "Explore courses in this category"}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))
          )}
        </ul>
      </NavMenuContentModified>
    </NavigationMenuItem>
  );
}

export default function Header() {
  // Fetch categories on mount
  const { fetchCategories, categories } = useCategoryStore();

  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);
  const { user, logout } = useAuth();
  const loggedIn = Boolean(user);
  const pathname = usePathname();
  const router = useRouter();
  const blogTriggerRef = React.useRef<HTMLButtonElement>(null);
  const exploreTriggerRef = React.useRef<HTMLButtonElement>(null);
  const avatarTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [showSearch, setShowSearch] = React.useState(false);

  // Check if user is on the home page
  const isHomePage = pathname === "/";

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 py-4 px-6">
      <NavigationMenu viewport={false} className="w-full mx-auto">
        <NavigationMenuList className="flex items-center justify-between w-full">
          {/* Mobile: Hamburger - Logo - Search/Login */}
          <div className="flex md:hidden items-center justify-between w-full">
            {/* Left: Hamburger */}
            <MobileMenu />

            {/* Center: Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image
                src="/logo-main.webp"
                alt="logo"
                width={80}
                height={26}
                className="min-w-[5rem] min-h-[1.625rem]"
              />
            </Link>

            {/* Right: Search Icon + Login/Avatar */}
            <div className="flex items-center gap-2">
              <MobileSearchTrigger onClick={() => setShowSearch(true)} />
              {loggedIn ? (
                <MobileUserDrawer user={user} onLogout={logout} />
              ) : (
                <Button size="icon" variant="ghost" asChild>
                  <Link href="/login">
                    <LogInIcon className="size-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop: Full Navigation */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/logo-main.webp"
                  alt="logo"
                  width={120  }
                  height={36}
                  className="min-w-[7.5rem] min-h-[2.25rem]"
                />
              </Link>
              <ExploreDropdown exploreTriggerRef={exploreTriggerRef} />
              <SearchComponent />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/about">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/contact">Contact Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/faqs">FAQs</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <BlogDropdown blogTriggerRef={blogTriggerRef} />
              <NavigationMenuItem>
                {loggedIn ? (
                  <>
                    {user?.role === "instructor" ? (
                      // Instructor - Show Dashboard link and Wishlist icon on home page
                      <div className="flex items-center gap-2">
                        <Button asChild>
                          <Link href="/instructor/courses">Dashboard</Link>
                        </Button>
                        {isHomePage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/student/wishlist")}
                          >
                            <HeartIcon className="size-5" />
                          </Button>
                        )}
                        <NavigationMenuTrigger
                          ref={avatarTriggerRef}
                          className="ml-2 p-0 hover:bg-transparent"
                        >
                          <Avatar className="size-10">
                            <AvatarImage src={user?.profilePictureUrl || CONSTANTS.USER_DATA.avatar} />
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </NavigationMenuTrigger>
                      </div>
                    ) : (
                      // Student - Show normal navigation
                      <div className="flex items-center">
                     
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push("/student/wishlist")}
                        >
                          <HeartIcon className="size-5" />
                        </Button>
                        <NavigationMenuTrigger
                          ref={avatarTriggerRef}
                          className="ml-2 p-0 hover:bg-transparent"
                        >
                          <Avatar className="size-10">
                            <AvatarImage src={user?.profilePictureUrl || CONSTANTS.USER_DATA.avatar} />
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </NavigationMenuTrigger>
                      </div>
                    )}
                    <NavMenuContentModified triggerRef={avatarTriggerRef}>
                      <div className="w-[18.75rem]">
                        {/* User Info Section */}
                        <div className="flex items-center gap-3 p-4">
                          <Avatar className="size-14">
                            <AvatarImage src={user?.profilePictureUrl || CONSTANTS.USER_DATA.avatar} />
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold line-clamp-1">
                              {user?.name || CONSTANTS.USER_DATA.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {user?.email || CONSTANTS.USER_DATA.email}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Show different menus based on role */}
                        {user?.role === "instructor" ? (
                          // Instructor Menu
                          <>
                            <Link
                              href="/instructor/courses"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <GraduationCapIcon className="size-5" />
                              <span className="text-sm">My Courses</span>
                            </Link>
                            <Link
                              href="/instructor/analytics"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <MessageSquareIcon className="size-5" />
                              <span className="text-sm">Analytics</span>
                            </Link>

                            <Separator className="my-4" />

                            <Link
                              href="/instructor/settings"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <SettingsIcon className="size-5" />
                              <span className="text-sm font-bold">
                                Account Settings
                              </span>
                            </Link>
                          </>
                        ) : (
                          // Student Menu
                          <>
                            <Link
                              href="/student/courses"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <GraduationCapIcon className="size-5" />
                              <span className="text-sm">My Learning</span>
                            </Link>
                            <Link
                              href="/student/certificates"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <AwardIcon className="size-5" />
                              <span className="text-sm">My Certificates</span>
                            </Link>

                            <Separator className="my-4" />

                            <Link
                              href="/student/wishlist"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <ShoppingCartIcon className="size-5" />
                              <span className="text-sm">My Wishlist</span>
                            </Link>

                            <Separator className="my-4" />

                            <Link
                              href="/blog"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <MessageSquareIcon className="size-5" />
                              <span className="text-sm">Blog</span>
                            </Link>
                            <Link
                              href="/student/settings"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                            >
                              <SettingsIcon className="size-5" />
                              <span className="text-sm font-bold">
                                Account Settings
                              </span>
                            </Link>
                          </>
                        )}

                        <Separator className="my-4" />

                        {/* Logout Section */}

                        <button
                          onClick={logout}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors text-destructive w-full text-left"
                        >
                          <LogOutIcon className="size-5" />
                          <span className="text-sm">Log Out</span>
                        </button>
                      </div>
                    </NavMenuContentModified>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </NavigationMenuItem>
            </div>
          </div>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Search Modal */}
      <MobileSearchModal open={showSearch} onOpenChange={setShowSearch} />
    </header>
  );
}
