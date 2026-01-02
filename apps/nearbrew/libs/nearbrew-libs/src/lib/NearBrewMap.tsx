import { useMemo, useState, useEffect } from 'react';
import { Popup, Marker, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaCoffee } from 'react-icons/fa';
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
}

// Removed LocationMarker and geolocation hooks to avoid browser geolocation prompts

export function NearBrewMap({ className = '', height = 400, latitude, longitude }: NearBrewMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  
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

  const coffeeMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className: 'nearbrew-marker',
        iconSize: [48, 56],
        iconAnchor: [24, 52],
        popupAnchor: [0, -48],
        html: renderToString(
          <span className="nearbrew-marker__pin">
            <span className="nearbrew-marker__inner">
              <FaCoffee 
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
      }),
    []
  );

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
        <TileLayer
          className=""
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapCenter} icon={coffeeMarkerIcon}>
          <Popup>Map center</Popup>
        </Marker>
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-4 z-20" aria-hidden="true" />
      <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
      
      </div>
    </div>
  );
}

export default NearBrewMap;
