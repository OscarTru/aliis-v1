self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title ?? 'Aliis'
  const body = data.body ?? ''
  const url = data.url ?? '/diario'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/aliis-black-single.png',
      badge: '/assets/aliis-black-single.png',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/diario')
  )
})
