import { useState } from 'react';
import { Popup, Marker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
}

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export function NearBrewMap({ className = '', height = 400 }: NearBrewMapProps) {
  return (
    <div style={{ height }} className={`w-full rounded-xl overflow-hidden ${className}`}>
      <MapContainer
        center={[51.505, -0.09]} // the longitude and latitude of the map center
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            You are here!.
          </Popup>
        </Marker>
        <LocationMarker />
      </MapContainer>
    </div>
  );
}

export default NearBrewMap;
