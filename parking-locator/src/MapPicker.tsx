import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Coordinates } from './types'

const carPin = L.divIcon({
  className: 'car-pin',
  html: '<span>●</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

type MapPickerProps = {
  coordinates: Coordinates
  onChange: (coordinates: Coordinates) => void
}

function MapClick({ onChange }: Pick<MapPickerProps, 'onChange'>) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng })
    },
  })
  return null
}

export function MapPicker({ coordinates, onChange }: MapPickerProps) {
  const position = useMemo<[number, number]>(
    () => [coordinates.latitude, coordinates.longitude],
    [coordinates.latitude, coordinates.longitude],
  )

  return (
    <MapContainer center={position} zoom={coordinates.latitude === 0 && coordinates.longitude === 0 ? 2 : 18} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClick onChange={onChange} />
      <Marker
        position={position}
        icon={carPin}
        draggable
        eventHandlers={{
          dragend(event) {
            const point = event.target.getLatLng()
            onChange({ latitude: point.lat, longitude: point.lng })
          },
        }}
      />
    </MapContainer>
  )
}
