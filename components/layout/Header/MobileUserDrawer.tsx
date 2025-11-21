"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCapIcon,
  AwardIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { CONSTANTS } from "@/lib/constants";
import type { User } from "@/lib/context/AuthContext";

interface MobileUserDrawerProps {
  user: User | null;
  onLogout: () => void;
}

export default function MobileUserDrawer({
  user,
  onLogout,
}: MobileUserDrawerProps) {
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Avatar className="size-8">
            <AvatarImage src={user?.profilePictureUrl || CONSTANTS.USER_DATA.avatar} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || CONSTANTS.USER_DATA.fallback}</AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Account</SheetTitle>
        </SheetHeader>

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

        {/* Learning Section */}
        <div className="p-4">
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <GraduationCapIcon className="size-5" />
            <span className="text-sm">My Learning</span>
          </Link>
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <AwardIcon className="size-5" />
            <span className="text-sm">My Certificates</span>
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Orders Section */}
        <div className="p-4">
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <ShoppingCartIcon className="size-5" />
            <span className="text-sm">My Orders</span>
          </Link>
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <CreditCardIcon className="size-5" />
            <span className="text-sm">Purchase History</span>
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Settings Section */}
        <div className="p-4">
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <MessageSquareIcon className="size-5" />
            <span className="text-sm">Messages</span>
          </Link>
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            <SettingsIcon className="size-5" />
            <span className="text-sm font-bold">Account Settings</span>
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Logout Section */}
        <div className="p-4 pb-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors text-destructive w-full text-left"
          >
            <LogOutIcon className="size-5" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
