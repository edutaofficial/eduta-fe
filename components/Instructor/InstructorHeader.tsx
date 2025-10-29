import React from "react";
import { Button } from "../ui/button";
import { BellIcon, HeartIcon, MessageSquareIcon } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function InstructorHeader() {
  return (
    <header className="h-[4.5rem] p-4 flex items-center justify-end fixed top-0 left-0 w-full bg-default-50 z-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <BellIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquareIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <HeartIcon className="size-4" />
        </Button>

        <Avatar>
          <AvatarImage src={CONSTANTS.INSTRUCTOR?.avatar} />
          <AvatarFallback>
            {CONSTANTS.INSTRUCTOR?.name?.charAt(0) || "I"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export default InstructorHeader;
