import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CONSTANTS } from "@/lib/constants";
import { Separator } from "../../ui/separator";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function SearchComponent() {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  return (
    <Command className="relative group w-full md:w-[24.375rem] rounded-md overflow-visible">
      <CommandInput
        className="h-10"
        placeholder="Search courses, instructors, and more..."
        value={search}
        onValueChange={(value) => setSearch(value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setShowResults(false)}
      />
      <CommandList
        className={cn(
          "max-h-[18.75rem] bg-white overflow-y-auto absolute top-10 left-0 w-full",
          showResults ? "block" : "hidden"
        )}
      >
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>React Course</CommandItem>
          <CommandItem>Web Development</CommandItem>
          <CommandItem>Desinging</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Courses">
          <CommandItem>
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-md size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <p className="text-default-900 font-medium">Course</p>
                  <p className="text-default-600 text-[.5rem]">
                    Lorem Ipsum Academy
                  </p>
                  <Separator
                    orientation="vertical"
                    className="h-3 bg-primary-600 min-h-3"
                  />
                  <p className="text-default-600 text-[.5rem]">
                    400 enrollments worldwide
                  </p>
                </div>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-md size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elitas
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <p className="text-default-900 font-medium">Course</p>
                  <p className="text-default-600 text-[.5rem]">
                    Lorem Ipsum Academy
                  </p>
                  <Separator
                    orientation="vertical"
                    className="h-3 bg-primary-600 min-h-3"
                  />
                  <p className="text-default-600 text-[.5rem]">
                    400 enrollments worldwide
                  </p>
                </div>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-md size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">
                  Lorem ipsum dolor sit amet, consectetur adipiscing asf
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <p className="text-default-900 font-medium">Course</p>
                  <p className="text-default-600 text-[.5rem]">
                    Lorem Ipsum Academy
                  </p>
                  <Separator
                    orientation="vertical"
                    className="h-3 bg-primary-600 min-h-3"
                  />
                  <p className="text-default-600 text-[.5rem]">
                    400 enrollments worldwide
                  </p>
                </div>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Instructors">
          <CommandItem>
            {" "}
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-full size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">Lorem ipsum 1</h3>
                <p className="text-default-600 text-[.5rem]">
                  Lorem Ipsum Academy
                </p>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            {" "}
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-full size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">Lorem ipsum 2</h3>
                <p className="text-default-600 text-[.5rem]">
                  Lorem Ipsum Academy
                </p>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            {" "}
            <div className="flex items-center gap-3">
              <Image
                src={CONSTANTS.PLACEHOLDER_IMAGE(56, 56)}
                alt="logo"
                width={56}
                height={56}
                className="rounded-full size-14"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-default-900">Lorem ipsum 3</h3>
                <p className="text-default-600 text-[.5rem]">
                  Lorem Ipsum Academy
                </p>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
