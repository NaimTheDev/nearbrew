import {
  NearBrewCard,
  StickyBanner,
  NearBrewMap,
  VenueItemListComponent,
  NearBrewAutoComplete,
  BuyMeACoffeeButton,
} from '../../libs/nearbrew-libs/src';

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyBanner />

      {/* Add proper margin-top to account for sticky banner height */}
      <div
        className="flex justify-center py-16 px-4"
        style={{ marginTop: '72px' }}
      >
        <NearBrewCard className="w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">
              How busy is your favorite coffee shop?
            </h1>
            <p className="text-sm text-muted-foreground">
              Search your favorite coffee shop to jump into its live insights or browse curated
              picks below.
            </p>
          </div>
          <NearBrewAutoComplete />
          <NearBrewMap height={350} />
          <VenueItemListComponent />
        </NearBrewCard>
      </div>

      <div className="fixed inset-x-0 bottom-4 flex justify-center sm:hidden px-4">
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
}

export default App;
