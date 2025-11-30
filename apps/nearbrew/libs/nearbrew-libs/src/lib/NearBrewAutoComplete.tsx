import { useCallback, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';
import { searchService } from '../services/searchService';
import { NearBrewButton } from './NearBrewButton';
import { config } from '../config';

type PlaceOption = {
  label: string;
  value: {
    description?: string;
    place_id?: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
  };
};

const buttonClasses =
  'flex items-center justify-center gap-2 whitespace-nowrap bg-[#c47a3d] hover:bg-[#b06c35] text-white shadow-lg shadow-[#c47a3d]/40';

export function NearBrewAutoComplete() {
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<PlaceOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleMapsApiKey = config.googleMapsApiKey;
  const isPlacesEnabled = Boolean(googleMapsApiKey);

  const handlePlaceSelect = (place: PlaceOption | null) => {
    setSelectedPlace(place);
    setError(null);
  };

  const handleSearch = useCallback(async () => {
    if (!selectedPlace) {
      setError('Pick a coffee shop to see how busy it is.');
      return;
    }

    const formatting = selectedPlace.value?.structured_formatting;
    const venueName = formatting?.main_text ?? selectedPlace.label ?? '';
    const venueAddress =
      formatting?.secondary_text ??
      selectedPlace.value?.description ??
      '';

    if (!venueName || !venueAddress) {
      setError('We could not read the venue details from Google Places.');
      return;
    }

    setIsLoading(true);
    try {
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
  }, [navigate, selectedPlace]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const searchDisabled = !selectedPlace || isLoading || !isPlacesEnabled;

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
