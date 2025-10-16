"use client";

import Link from "next/link";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 py-4">
      <NavigationMenu
        viewport={false}
        className="max-w-container !w-full mx-auto border border-red-500"
      >
        <NavigationMenuList>
          {/* child container */}
          <div>
            {/* left side */}
            <div className="flex items-center gap-4">
              {/* logo */}

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
              <Command className="relative group w-full max-w-[390px] border-2 border-primary-200 rounded-md overflow-visible">
                <CommandInput
                  className="h-10"
                  placeholder="Type a command or search..."
                />
                <CommandList className="max-h-[300px] bg-white overflow-y-auto group-hover:block block absolute top-10 left-0 w-full">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Search Emoji</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Settings">
                    <CommandItem>Profile</CommandItem>
                    <CommandItem>Billing</CommandItem>
                    <CommandItem>Settings</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            {/* logo */}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
