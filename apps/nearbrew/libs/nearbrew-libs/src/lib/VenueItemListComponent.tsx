
import { useVenues, type VenueSearchCoords } from '../lib/useVenues';
import { VenueItemComponent } from './VenueItemComponent'; 
import { VenueItemSkeleton } from './VenueItemSkeleton';

const ROWS_PER_VIEW = 2;
const COLUMNS_PER_VIEW = 2;
const CARD_GAP = 24;
const CARD_HORIZONTAL_PADDING = 24;
const CARD_MIN_WIDTH = 400;
const GRID_COLUMN_WIDTH = `calc((100% - ${(COLUMNS_PER_VIEW - 1) * CARD_GAP}px) / ${COLUMNS_PER_VIEW})`;
const GRID_AUTO_COLUMN = `minmax(${CARD_MIN_WIDTH}px, ${GRID_COLUMN_WIDTH})`;

export function VenueItemListComponent({ coords }: { coords?: VenueSearchCoords }) {
  const { venues, loading, error } = useVenues(coords);

  if (loading) {
    const skeletonCount = ROWS_PER_VIEW * COLUMNS_PER_VIEW * 2; // show 2 viewports worth
    return (
      <div 
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '16px 0'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: `repeat(${ROWS_PER_VIEW}, minmax(0, 1fr))`,
            gridAutoColumns: GRID_AUTO_COLUMN,
            gap: `${CARD_GAP}px`,
            paddingLeft: `${CARD_HORIZONTAL_PADDING}px`,
            paddingRight: `${CARD_HORIZONTAL_PADDING}px`,
            paddingBottom: '8px'
          }}
        >
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex'
              }}
            >
              <div style={{ width: '100%' }}>
                <VenueItemSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div 
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '16px 0'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${ROWS_PER_VIEW}, minmax(0, 1fr))`,
          gridAutoColumns: GRID_AUTO_COLUMN,
          gap: `${CARD_GAP}px`,
          paddingLeft: `${CARD_HORIZONTAL_PADDING}px`,
          paddingRight: `${CARD_HORIZONTAL_PADDING}px`,
          paddingBottom: '8px'
        }}
      >
        {venues.map((venue, index) => (
          <div
            key={venue.venue_id}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex'
            }}
          >
            <div style={{ width: '100%' }}>
              <VenueItemComponent venue={venue} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VenueItemListComponent;
