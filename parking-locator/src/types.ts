export type Coordinates = {
  latitude: number
  longitude: number
}

export type ParkingSpot = {
  id: string
  coordinates: Coordinates
  createdAt: string
  accuracy?: number
  note: string
}
