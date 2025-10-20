"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import SearchComponent from "./SearchComponent";

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileSearchModal({
  open,
  onOpenChange,
}: MobileSearchModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Search</h2>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <XIcon className="size-5" />
        </Button>
      </div>

      {/* Search Content */}
      <div className="p-4">
        <SearchComponent alwaysShowResults={true} />
      </div>
    </div>
  );
}

export function MobileSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden">
      <SearchIcon className="size-5" />
    </Button>
  );
}
