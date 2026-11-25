import type { ParkingSpot } from './types'

const STORAGE_KEY = 'parking-locator.spots.v1'

export function loadSpots(): ParkingSpot[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter(isParkingSpot).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

export function saveSpots(spots: ParkingSpot[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
}

function isParkingSpot(value: unknown): value is ParkingSpot {
  if (typeof value !== 'object' || value === null) return false
  const spot = value as Partial<ParkingSpot>
  return typeof spot.id === 'string'
    && typeof spot.createdAt === 'string'
    && typeof spot.note === 'string'
    && typeof spot.coordinates?.latitude === 'number'
    && typeof spot.coordinates?.longitude === 'number'
}
