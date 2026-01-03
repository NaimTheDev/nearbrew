import { useMemo, useState, useEffect } from 'react';
import { Popup, Marker, MapContainer, TileLayer, useMap, SVGOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaLocationArrow } from 'react-icons/fa';
import { renderToString } from 'react-dom/server';

type IconDefaultPrototype = typeof L.Icon.Default.prototype & {
  _getIconUrl?: () => string;
};

// Fix for default markers in React Leaflet (following Leaflet docs)
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NearBrewMapProps {
  className?: string;
  height?: number;
  longitude?: number;
  latitude?: number;
  // Called when user taps "Locate me" and grants geolocation permission
  onLocate?: (coords: { lat: number; lng: number }) => void;
}

// Removed LocationMarker and geolocation hooks to avoid browser geolocation prompts

export function NearBrewMap({ className = '', height = 400, latitude, longitude, onLocate }: NearBrewMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [overlayBounds, setOverlayBounds] = useState<[[number, number], [number, number]] | null>(null);
  
  const fallbackPosition: [number, number] = [51.505, -0.09];
  
  useEffect(() => {
    // Use provided latitude/longitude if available; fallback otherwise
    if (
      typeof latitude === 'number' && Number.isFinite(latitude) &&
      typeof longitude === 'number' && Number.isFinite(longitude)
    ) {
      setUserPosition([latitude, longitude]);
    } else {
      setUserPosition(fallbackPosition);
    }
  }, [latitude, longitude]);


  const mapCenter = userPosition || fallbackPosition;

  // Helper component to capture the map instance from react-leaflet
  function MapInstanceSetter({ onMap }: { onMap: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
      onMap(map);
    }, [map, onMap]);
    return null;
  }
    const myLocationIcon = useMemo(
    () =>
     L.divIcon({
  className: 'nearbrew-marker',
  iconSize: [48, 56],

  iconAnchor: [48, 56],

  popupAnchor: [-24, -56],

  html: renderToString(
    <span className="nearbrew-marker__pin">
      <span className="nearbrew-marker__inner">
        <FaLocationArrow 
          className="nearbrew-marker__icon text-amber-800" 
          size={20}
          aria-hidden="true"
          style={{ 
            transform: 'rotate(0deg)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50%',
            height: '50%'
          }}
        />
      </span>
    </span>
  ),
})
,
    []
  );

  // Keep an SVGOverlay in sync with current viewport bounds (per Leaflet docs)
  useEffect(() => {
    if (!mapInstance) return;
    const updateBounds = () => {
      const b = mapInstance.getBounds();
      setOverlayBounds([
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getEast()],
      ]);
    };
    updateBounds();
    mapInstance.on('moveend zoomend', updateBounds);
    return () => {
      mapInstance.off('moveend zoomend', updateBounds);
    };
  }, [mapInstance]);

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      // eslint-disable-next-line no-console
      console.warn('Geolocation API not available in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPosition([lat, lng]);
        if (mapInstance) {
          mapInstance.setView([lat, lng], Math.max(mapInstance.getZoom(), 13), { animate: true });
        }
        onLocate?.({ lat, lng });
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div
      style={{ height, zIndex: 1 }}
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl bg-[#f6d9b2] ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={13}
        minZoom={11}
        zoomControl={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        className=""
        style={{ height: '100%', width: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when position changes
      >
        <MapInstanceSetter onMap={setMapInstance} />
        <TileLayer
          className=""
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Current position marker */}
        <Marker position={mapCenter} icon={myLocationIcon}>
          <Popup>You are here</Popup>
        </Marker>

      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-4 z-20" aria-hidden="true" />
      {/* Locate me control (top-right) */}
      <div className="absolute top-3 right-3 pointer-events-auto" style={{ zIndex: 1001 }}>
        <button
          type="button"
          onClick={handleLocateMe}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          title="Locate me"
          aria-label="Locate me"
        >
          <FaLocationArrow className="text-amber-700" />
          Locate me
        </button>
      </div>
    </div>
  );
}

export default NearBrewMap;
