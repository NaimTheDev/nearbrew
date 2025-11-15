
import { useVenues } from '../lib/useVenues';
import { VenueItemComponent } from './VenueItemComponent'; 


export function VenueItemListComponent() {
  const { venues, loading, error } = useVenues();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
     
      {venues.map((venue) => (
        <VenueItemComponent key={venue.venue_id} venue={venue} />
      ))}
    </div>
  );
}

export default VenueItemListComponent;
