import { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { FaCoffee } from 'react-icons/fa';

type IconDefaultPrototype = typeof L.Icon.Default.prototype & {
  _getIconUrl?: () => string;
};

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface VenueLocationMapProps {
  lat: number;
  lng: number;
  name: string;
  height?: number;
  className?: string;
}

export function VenueLocationMap({
  lat,
  lng,
  name,
  height,
  className = '',
}: VenueLocationMapProps) {
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

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
                  height: '50%',
                }}
              />
            </span>
          </span>
        ),
      }),
    []
  );

  const containerStyle = height ? { height } : undefined;

  return (
    <div
      style={containerStyle}
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl bg-[#f6d9b2] ${className}`}
    >
      <MapContainer
        center={center}
        zoom={15}
        minZoom={12}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        key={`${lat}-${lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={coffeeMarkerIcon}>
          <Popup>{name}</Popup>
        </Marker>
        <ZoomControl position="bottomright" />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-full bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-900 shadow-lg max-w-[85%] truncate">
        {name}
      </div>
    </div>
  );
}

export default VenueLocationMap;
