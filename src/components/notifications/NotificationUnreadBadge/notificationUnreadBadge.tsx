import { Badge } from "@/components/primitives/badge"
import { cn } from "@/lib/utils"

import { formatUnreadBadgeCount } from "../shared/formatNotificationTime"

type NotificationUnreadBadgeProps = {
  count: number
  className?: string
}

export function NotificationUnreadBadge({
  count,
  className,
}: NotificationUnreadBadgeProps) {
  const label = formatUnreadBadgeCount(count)
  if (!label) return null

  return (
    <Badge
      variant="default"
      className={cn(
        "h-4 min-w-4 justify-center px-1 text-[0.65rem] tabular-nums",
        className
      )}
      aria-hidden
    >
      {label}
    </Badge>
  )
}
