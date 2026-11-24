import { useEffect, useRef } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

export default function Toast() {
  const notification = useNotificationStore(state => state.notification)
  const hideNotification = useNotificationStore(state => state.hideNotification)
  const toast = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!notification) return
    const element = toast.current
    element?.showPopover()
    const timer = window.setTimeout(hideNotification, 3000)
    return () => {
      window.clearTimeout(timer)
      element?.hidePopover()
    }
  }, [notification, hideNotification])

  return <div
    ref={toast}
    popover="manual"
    role={notification?.kind === 'error' ? 'alert' : 'status'}
    className={`fixed inset-auto right-4 bottom-4 max-w-[calc(100%-2rem)] rounded px-4 py-3 text-white shadow-lg ${notification?.kind === 'error' ? 'bg-red-800' : 'bg-green-800'}`}
  >
    {notification?.message}
  </div>
}
