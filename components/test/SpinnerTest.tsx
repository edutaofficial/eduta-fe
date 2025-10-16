  import { Spinner } from "@/components/ui/spinner"
  
  export function SpinnerDemo() {
    return (
      <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Spinner />
            <span className="text-sm tabular-nums">$100.00</span>
      </div>
    )
  }
  