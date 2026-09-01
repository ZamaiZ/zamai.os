export type NotificationItemData = {
  id: string
  title: string
  body: string
  createdAt: string
}

export type NotificationsContextValue = {
  unreadCount: number
  items: NotificationItemData[]
  isLoadingInitial: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}
