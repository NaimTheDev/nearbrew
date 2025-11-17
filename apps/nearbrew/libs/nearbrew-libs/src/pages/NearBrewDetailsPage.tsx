import { useLocation, Navigate } from 'react-router-dom';
import { Venue } from '@nearbrew/shared-types';
import { NearBrewDetails } from './NearBrewDetails';

interface LocationState {
  venue: Venue;
}

export function NearBrewDetailsPage() {
  const location = useLocation();
  const venue = (location.state as LocationState)?.venue;

  // If no venue data was passed, redirect to home
  if (!venue) {
    return <Navigate to="/" replace />;
  }

  return <NearBrewDetails venue={venue} />;
}

export default NearBrewDetailsPage;