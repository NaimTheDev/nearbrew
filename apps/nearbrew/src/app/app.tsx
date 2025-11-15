import {  NearBrewCard, StickyBanner, NearBrewMap, VenueItemListComponent } from '../../libs/nearbrew-libs/src';



export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyBanner />
      
      {/* Add proper margin-top to account for sticky banner height */}
      <div className="flex justify-center py-16 px-4" style={{ marginTop: '72px' }}>
        <NearBrewCard className="w-full max-w-3xl">
          <div className="space-y-6">
            
            <NearBrewMap height={350} />
          </div>
          <VenueItemListComponent />
        </NearBrewCard>
        
       

      </div>
      
    </div>
  );
}

export default App;
