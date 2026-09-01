import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatNotificationTime(isoDate: string) {
  return formatDistanceToNow(new Date(isoDate), {
    addSuffix: true,
    locale: ptBR,
  })
}

export function formatUnreadBadgeCount(count: number) {
  if (count <= 0) return null
  if (count > 9) return "9+"
  return String(count)
}
