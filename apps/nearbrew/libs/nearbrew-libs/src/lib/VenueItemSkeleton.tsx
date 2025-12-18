import { NearBrewCard } from './NearBrewCard';

/**
 * Skeleton placeholder for a venue card while data is loading.
 * Uses Tailwind's animate-pulse and neutral background blocks to mimic layout.
 */
export function VenueItemSkeleton() {
  return (
    <NearBrewCard className="animate-pulse">
      <div className="flex flex-col justify-between w-full min-h-[120px] p-4">
        {/* Header row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <div className="h-4 bg-muted rounded w-3/4 mb-1" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="flex items-center">
            <div className="h-5 w-14 bg-muted rounded" />
          </div>
        </div>

        {/* Busy level + rating */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex justify-between items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-36 bg-muted rounded" />
          </div>
          <div className="h-7 w-40 bg-muted rounded-full" />
        </div>
        <div className="mt-2 h-3 w-28 bg-muted rounded" />
      </div>
    </NearBrewCard>
  );
}

export default VenueItemSkeleton;
