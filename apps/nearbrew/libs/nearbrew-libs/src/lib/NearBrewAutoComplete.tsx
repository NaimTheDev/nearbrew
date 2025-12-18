import { useCallback, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GooglePlacesAutocomplete, {getLatLng, geocodeByAddress, geocodeByPlaceId} from 'react-google-places-autocomplete';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';
import { searchService } from '../services/searchService';
import { NearBrewButton } from './NearBrewButton';
import { config } from '../config';

type PlaceOption = {
  label: string;
  value: {
    description?: string;
    place_id: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
    types: string[];
  };
};

const buttonClasses =
  'flex items-center justify-center gap-2 whitespace-nowrap bg-[#c47a3d] hover:bg-[#b06c35] text-white shadow-lg shadow-[#c47a3d]/40';

// Default search radius (meters) for geocoding-driven venue queries
const SEARCH_RADIUS_METERS = '9000';

// Helper to comply with API requirements: round coordinates to max 3 decimal places
const roundTo3 = (n: number) => Math.round(n * 1000) / 1000;

export function NearBrewAutoComplete({
  onGeocodeSearch,
}: {
  onGeocodeSearch?: (coords: { lat: number; lng: number; radius?: string }) => void;
}) {
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<PlaceOption | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleMapsApiKey = config.googleMapsApiKey;
  const isPlacesEnabled = Boolean(googleMapsApiKey);

  const handlePlaceSelect = (place: PlaceOption | null) => {
    setSelectedPlace(place);
    setError(null);
  };

  const handleSearch = useCallback(async () => {
    const currentText = inputValue.trim();
    if (!selectedPlace && !currentText) {
      setError('Type a location or pick a coffee shop to search.');
      return;
    }

    const formatting = selectedPlace?.value?.structured_formatting;
    const venueName = formatting?.main_text ?? selectedPlace?.label ?? '';
    const venueAddress =
      formatting?.secondary_text ??
      selectedPlace?.value?.description ??
      '';

    setIsLoading(true);
    try {
      // Clear input immediately on search, but keep a copy of the text we captured above
      setSelectedPlace(null);
      setInputValue('');

      const types = selectedPlace?.value?.types ?? [];
      const placeId = selectedPlace?.value?.place_id;

      // Branch 1: No selection, use typed address via geocodeByAddress
      if (!selectedPlace && currentText) {
        try {
          console.log("trying geocode by address for:", currentText);
          const results = await geocodeByAddress(currentText);
          if (results && results.length > 0) {
            const { lat, lng } = await getLatLng(results[0]);
            // Ensure coordinates are rounded to a maximum of 3 decimal places
            onGeocodeSearch?.({ lat: roundTo3(lat), lng: roundTo3(lng), radius: SEARCH_RADIUS_METERS });
            return; // Do not proceed to live forecast navigation
          }
        } catch (err) {
          // Swallow geocoding errors but log for diagnostics
          console.warn('NearBrew: geocodeByAddress failed', err);
        }
      }

      // Branch 2: If user selected a place from the drowpdown
      if (selectedPlace && placeId && types.includes('geocode')) {
        try {
          const results = await geocodeByPlaceId(placeId);
          if (results && results.length > 0) {
            const { lat, lng } = await getLatLng(results[0]);
            // Ensure coordinates are rounded to a maximum of 3 decimal places
            onGeocodeSearch?.({ lat: roundTo3(lat), lng: roundTo3(lng), radius: SEARCH_RADIUS_METERS });
            return; // Do not proceed to live forecast navigation
          }
        } catch (err) {
          // Swallow geocoding errors but log for diagnostics
          console.warn('NearBrew: geocodeByPlaceId failed', err);
        }
      }

      // Default path: They searched for a specific venu
      const searchResult = await searchService.fetchLiveForecast({
        venue_name: venueName,
        venue_address: venueAddress,
      });

      navigate('/search', {
        state: {
          searchResult,
          metadata: {
            venueName,
            venueAddress,
          },
        },
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to search right now.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate, selectedPlace, inputValue, onGeocodeSearch]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const searchDisabled = (!selectedPlace && !inputValue.trim()) || isLoading || !isPlacesEnabled;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Search for a coffee shop
          </label>
          <div className="bg-white/90 border border-border rounded-2xl shadow-inner">
            {isPlacesEnabled ? (
              <GooglePlacesAutocomplete
                apiKey={googleMapsApiKey}
                selectProps={{
                  value: selectedPlace,
                  onChange: handlePlaceSelect,
                  placeholder: 'Try “Qahwah House” or an address',
                  onKeyDown: handleKeyDown,
                  isDisabled: isLoading,
                  inputValue,
                  onInputChange: (val) => setInputValue(val),
                  styles: {
                    container: (provided) => ({
                      ...provided,
                      width: '100%',
                    }),
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      minHeight: '64px',
                      padding: '8px 4px',
                      opacity: state.isDisabled ? 0.6 : 1,
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: '0 8px',
                    }),
                    input: (provided) => ({
                      ...provided,
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#4b2e17',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 20,
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }),
                  },
                }}
              />
            ) : (
              <div className="px-4 py-6 text-sm text-red-500 flex items-center gap-2">
                <FiAlertCircle />
                Configure the `VITE_GOOGLE_MAPS_API_KEY` environment variable to enable Google Places
                search.
              </div>
            )}
          </div>
        </div>
        <NearBrewButton
          onClick={handleSearch}
          disabled={searchDisabled}
          className={buttonClasses}
        >
          {isLoading ? 'Searching…' : (<><FiSearch /> Search</>)}
        </NearBrewButton>
      </div>

      {error && isPlacesEnabled && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <FiAlertCircle />
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Hit enter or tap Search to jump straight to the live busyness report.
      </p>
    </div>
  );
}

export default NearBrewAutoComplete;
