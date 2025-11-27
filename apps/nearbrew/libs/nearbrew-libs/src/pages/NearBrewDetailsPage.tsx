import { useEffect, useState } from 'react';
import { useLocation, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Venue } from '@nearbrew/shared-types';
import { NearBrewDetails } from './NearBrewDetails';
import { venueService } from '../services/venueService';
import { NearBrewButton } from '../lib/NearBrewButton';

interface LocationState {
  venue: Venue;
}

export function NearBrewDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const venueFromState = (location.state as LocationState)?.venue;
  const [remoteVenue, setRemoteVenue] = useState<Venue | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'loading' | 'error' | 'not_found'>('idle');
  const [remoteError, setRemoteError] = useState<string>('');

  useEffect(() => {
    if (venueFromState || !venueId) {
      return;
    }

    let cancelled = false;
    setRemoteStatus('loading');
    setRemoteError('');

    venueService
      .getVenueById(venueId)
      .then((venue) => {
        if (cancelled) return;
        if (venue) {
          setRemoteVenue(venue);
          setRemoteStatus('idle');
          return;
        }

        setRemoteStatus('not_found');
        setRemoteError('We could not find this venue right now.');
      })
      .catch((error) => {
        if (cancelled) return;
        setRemoteStatus('error');
        setRemoteError(error instanceof Error ? error.message : 'Unable to load this venue.');
      });

    return () => {
      cancelled = true;
    };
  }, [venueFromState, venueId]);

  const resolvedVenue = venueFromState ?? remoteVenue;

  const handleBackHome = () => navigate('/');

  if (resolvedVenue) {
    return <NearBrewDetails venue={resolvedVenue} />;
  }

  if (!venueId) {
    return <Navigate to="/" replace />;
  }

  if (remoteStatus === 'loading' || remoteStatus === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading your meetup invite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
        <p className="text-lg font-semibold">We could not load that venue</p>
        <p className="text-sm text-muted-foreground">
          {remoteError || 'Try refreshing the link or opening it again from Nearbrew.'}
        </p>
        <NearBrewButton onClick={handleBackHome} className="w-full">
          Back to Nearbrew
        </NearBrewButton>
      </div>
    </div>
  );
}

export default NearBrewDetailsPage;
