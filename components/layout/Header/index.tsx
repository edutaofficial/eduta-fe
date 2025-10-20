"use client";

import React from "react";
import Link from "next/link";

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
import { CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  HeartIcon,
  LogInIcon,
  GraduationCapIcon,
  AwardIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header({ loggedIn }: { loggedIn: boolean }) {
  const blogTriggerRef = React.useRef<HTMLButtonElement>(null);
  const categoriesTriggerRef = React.useRef<HTMLButtonElement>(null);
  const avatarTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [showSearch, setShowSearch] = React.useState(false);

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
                <MobileUserDrawer />
              ) : (
                <Button size="icon" variant="ghost">
                  <LogInIcon className="size-5" />
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
                  width={100}
                  height={32}
                  className="min-w-[6.25rem] min-h-[2rem]"
                />
              </Link>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Explore</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <SearchComponent />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="#">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger ref={blogTriggerRef}>
                  Blog
                </NavigationMenuTrigger>
                <NavMenuContentModified triggerRef={blogTriggerRef}>
                  <ul className="grid gap-2 md:w-[25rem] lg:w-[31.25rem] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3 p-4">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full flex-col justify-end rounded-md bg-cover bg-center p-6 no-underline outline-hidden select-none focus:shadow-md"
                          style={{
                            backgroundImage: `url(${
                              CONSTANTS.BLOG_POSTS[0]?.imageUrl ||
                              CONSTANTS.PLACEHOLDER_IMAGE(215, 215)
                            })`,
                          }}
                          href={CONSTANTS.BLOG_POSTS[0]?.href || "/"}
                        >
                          <div className="mt-4 mb-2 text-lg font-medium line-clamp-2">
                            {CONSTANTS.BLOG_POSTS[0]?.title ||
                              "Featured Blog Post"}
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight line-clamp-3">
                            {CONSTANTS.BLOG_POSTS[0]?.description ||
                              "Discover insights and tutorials"}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {CONSTANTS.BLOG_POSTS.slice(1).map((post) => (
                      <ListItem
                        key={post.id}
                        href={post.href}
                        title={post.title}
                      >
                        {post.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavMenuContentModified>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger ref={categoriesTriggerRef}>
                  Categories
                </NavigationMenuTrigger>
                <NavMenuContentModified triggerRef={categoriesTriggerRef}>
                  <ul className="grid w-[25rem] gap-2 p-4 md:w-[31.25rem] md:grid-cols-2 lg:w-[37.5rem]">
                    {CONSTANTS.CATEGORIES.slice(0, 6).map((category) => (
                      <li key={category.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-primary-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-semibold leading-none line-clamp-1">
                              {category.name}
                            </div>
                            <p className="text-sm leading-snug text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavMenuContentModified>
              </NavigationMenuItem>
              <NavigationMenuItem>
                {loggedIn ? (
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon">
                      <BellIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <HeartIcon className="size-5" />
                    </Button>
                    <NavigationMenuTrigger
                      ref={avatarTriggerRef}
                      className="ml-2 p-0 hover:bg-transparent"
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={CONSTANTS.USER_DATA.avatar} />
                        <AvatarFallback>
                          {CONSTANTS.USER_DATA.fallback}
                        </AvatarFallback>
                      </Avatar>
                    </NavigationMenuTrigger>
                    <NavMenuContentModified triggerRef={avatarTriggerRef}>
                      <div className="w-[18.75rem]">
                        {/* User Info Section */}
                        <div className="flex items-center gap-3 p-4">
                          <Avatar className="size-14">
                            <AvatarImage src={CONSTANTS.USER_DATA.avatar} />
                            <AvatarFallback>
                              {CONSTANTS.USER_DATA.fallback}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold line-clamp-1">
                              {CONSTANTS.USER_DATA.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {CONSTANTS.USER_DATA.email}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Learning Section */}

                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <GraduationCapIcon className="size-5" />
                          <span className="text-sm">My Learning</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <AwardIcon className="size-5" />
                          <span className="text-sm">My Certificates</span>
                        </Link>

                        <Separator className="my-4" />

                        {/* Orders Section */}

                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <ShoppingCartIcon className="size-5" />
                          <span className="text-sm">My Orders</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <CreditCardIcon className="size-5" />
                          <span className="text-sm">Purchase History</span>
                        </Link>

                        <Separator className="my-4" />

                        {/* Settings Section */}

                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <MessageSquareIcon className="size-5" />
                          <span className="text-sm">Messages</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <SettingsIcon className="size-5" />
                          <span className="text-sm font-bold">
                            Account Settings
                          </span>
                        </Link>

                        <Separator className="my-4" />

                        {/* Logout Section */}

                        <Link
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors text-destructive"
                        >
                          <LogOutIcon className="size-5" />
                          <span className="text-sm">Log Out</span>
                        </Link>
                      </div>
                    </NavMenuContentModified>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button>Login</Button>
                    <Button variant="outline">Sign up</Button>
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

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-hidden transition-colors hover:bg-primary-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm leading-none font-medium line-clamp-1">
            {title}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
