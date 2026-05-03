'use client'

import { addCollection } from '@iconify/react'
import solarIcons from '@iconify-json/solar/icons.json'
import { useEffect } from 'react'

// Register all Solar icons at app startup — eliminates all runtime API calls to
// api.iconify.design / api.unisvg.com / api.simplesvg.com (CSP-safe, offline, fast).
addCollection(solarIcons as Parameters<typeof addCollection>[0])

export function IconifySetup() {
  // Side-effect-free: addCollection() runs at module load time (before any render).
  // This component just ensures the module is imported on the client.
  useEffect(() => {}, [])
  return null
}
