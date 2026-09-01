import { cn } from "@/lib/utils"
import { Loader2Icon } from "@/components/icons"
import type { IconBaseProps } from "react-icons"

function Spinner({ className, ...props }: IconBaseProps) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
