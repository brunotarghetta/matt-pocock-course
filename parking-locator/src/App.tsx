import { useEffect, useState } from 'react'
import { MapPicker } from './MapPicker'
import { loadSpots, saveSpots } from './storage'
import type { Coordinates, ParkingSpot } from './types'

type EditorState = {
  id?: string
  coordinates: Coordinates
  note: string
  accuracy?: number
}

const initialSpots = loadSpots()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function externalMapUrl({ latitude, longitude }: Coordinates) {
  const query = `${latitude},${longitude}`
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return `https://maps.apple.com/?ll=${query}&q=Mi%20auto`
  }
  if (/Android/i.test(navigator.userAgent)) {
    return `geo:${query}?q=${query}`
  }
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`
}

export default function App() {
  const [spots, setSpots] = useState(initialSpots)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      saveSpots(spots)
    } catch {
      setMessage('No se pudo guardar. Revisá el espacio disponible en el dispositivo.')
    }
  }, [spots])

  function saveNewSpot(coordinates: Coordinates, accuracy?: number) {
    const newSpot: ParkingSpot = {
      id: crypto.randomUUID(),
      coordinates,
      createdAt: new Date().toISOString(),
      accuracy,
      note: '',
    }
    setSpots((current) => [newSpot, ...current])
    setMessage(accuracy && accuracy > 50
      ? `Lugar guardado. La ubicación puede tener un margen de ${Math.round(accuracy)} m; podés corregirla desde la tarjeta.`
      : 'Lugar guardado. ¡Que disfrutes!')
  }

  function markCurrentLocation() {
    setMessage('Buscando tu ubicación…')
    if (!navigator.geolocation) {
      setMessage('Este navegador no ofrece ubicación. Podés marcar el punto en el mapa.')
      setEditor({ coordinates: { latitude: 0, longitude: 0 }, note: '' })
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        saveNewSpot({ latitude: coords.latitude, longitude: coords.longitude }, coords.accuracy)
        setBusy(false)
      },
      (error) => {
        const reason = error.code === error.PERMISSION_DENIED
          ? 'No hay permiso para usar la ubicación.'
          : 'No pudimos obtener tu ubicación.'
        setMessage(`${reason} Marcá el punto manualmente en el mapa.`)
        setEditor({ coordinates: { latitude: 0, longitude: 0 }, note: '' })
        setBusy(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  function openEditor(spot: ParkingSpot) {
    setEditor({
      id: spot.id,
      coordinates: spot.coordinates,
      note: spot.note,
      accuracy: spot.accuracy,
    })
  }

  function commitEditor() {
    if (!editor) return
    if (editor.id) {
      setSpots((current) => current.map((spot) => spot.id === editor.id
        ? { ...spot, coordinates: editor.coordinates, note: editor.note.trim(), accuracy: undefined }
        : spot))
      setMessage('Ubicación actualizada.')
    } else {
      const spot: ParkingSpot = {
        id: crypto.randomUUID(),
        coordinates: editor.coordinates,
        createdAt: new Date().toISOString(),
        note: editor.note.trim(),
      }
      setSpots((current) => [spot, ...current])
      setMessage('Lugar guardado.')
    }
    setEditor(null)
  }

  function deleteSpot(id: string) {
    setSpots((current) => current.filter((spot) => spot.id !== id))
    setMessage('Estacionamiento eliminado.')
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="¿Dónde estacioné? inicio">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>¿Dónde estacioné?</span>
        </a>
        <span className="privacy-pill"><span /> Solo en este dispositivo</span>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Tu auto, a mano</p>
          <h1>Estacioná y seguí con tu día.</h1>
          <p className="hero-description">Guardamos el lugar por vos. Cuando vuelvas, abrí el mapa y listo.</p>
          <button className="save-button" onClick={markCurrentLocation} disabled={busy}>
            <span className="save-icon" aria-hidden="true">⌖</span>
            <span>{busy ? 'Buscando ubicación…' : 'Guardar dónde estacioné'}</span>
            {!busy && <span className="save-arrow" aria-hidden="true">↗</span>}
          </button>
          <p className="privacy-note">No necesitás una cuenta. Tus lugares quedan guardados en este dispositivo.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="road road-back" />
          <div className="parking-sign"><span>P</span><i /></div>
          <div className="car-shadow" />
          <div className="car"><div className="car-window" /><div className="wheel wheel-left" /><div className="wheel wheel-right" /></div>
          <div className="pin-bubble"><span>⌖</span></div>
          <div className="art-caption">Ya sabés dónde volver.</div>
        </div>
      </section>

      {message && <p className="status-message" role="status">{message}</p>}

      <section className="history-section" aria-labelledby="history-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tu historial</p>
            <h2 id="history-heading">Estacionamientos recientes</h2>
          </div>
          <span className="count-pill">{spots.length} {spots.length === 1 ? 'lugar' : 'lugares'}</span>
        </div>

        {spots.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">⌖</span>
            <h3>Tu próximo lugar empieza acá</h3>
            <p>Cuando estaciones, tocá el botón grande y guardamos la ubicación.</p>
          </div>
        ) : (
          <div className="parking-grid">
            {spots.map((spot, index) => (
              <article className={`parking-card${index === 0 ? ' newest' : ''}`} key={spot.id}>
                <div className="card-topline">
                  <span className="card-label">{index === 0 ? 'Último lugar' : 'Estacionamiento'}</span>
                  <button className="icon-button delete-button" onClick={() => deleteSpot(spot.id)} aria-label={`Borrar estacionamiento del ${formatDate(spot.createdAt)}`} title="Borrar">×</button>
                </div>
                <h3>{spot.note || (index === 0 ? 'Tu auto está acá' : 'Lugar guardado')}</h3>
                <p className="card-date">{formatDate(spot.createdAt)}</p>
                {spot.accuracy && spot.accuracy > 50 && <p className="accuracy-note">Ubicación aproximada · margen de {Math.round(spot.accuracy)} m</p>}
                <div className="card-actions">
                  <a className="map-link" href={externalMapUrl(spot.coordinates)}>
                    Ver en el mapa <span aria-hidden="true">↗</span>
                  </a>
                  <button className="edit-link" onClick={() => openEditor(spot)}>Corregir</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer-note">
        <span aria-hidden="true">✳</span>
        <p>Un toque para guardar. Un mapa para volver.</p>
      </footer>

      {editor && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditor(null)
        }}>
          <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Ajustar ubicación</p>
                <h2 id="editor-title">Tocá dónde está el auto</h2>
              </div>
              <button className="icon-button close-button" onClick={() => setEditor(null)} aria-label="Cerrar">×</button>
            </div>
            <p className="map-help">Tocá el mapa o mové el marcador para elegir el punto exacto. El mapa necesita conexión a internet.</p>
            <MapPicker coordinates={editor.coordinates} onChange={(coordinates) => setEditor((current) => current ? { ...current, coordinates } : current)} />
            <label className="note-field">
              <span>Nota <em>· opcional</em></span>
              <input
                value={editor.note}
                onChange={(event) => setEditor((current) => current ? { ...current, note: event.target.value } : current)}
                maxLength={80}
                placeholder="Piso, sector o columna"
              />
            </label>
            <button className="confirm-button" onClick={commitEditor}>Guardar lugar</button>
          </section>
        </div>
      )}
    </main>
  )
}
