import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CoursesSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CoursesSearchBar({
  value,
  onChange,
  placeholder = "Search courses by title or instructor...",
}: CoursesSearchBarProps) {
  return (
    <div className="mb-8 mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 h-12 bg-white text-base border-default-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
    </div>
  );
}

