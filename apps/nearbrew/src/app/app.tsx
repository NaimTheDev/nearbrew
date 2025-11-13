import {  NearBrewCard, StickyBanner, NearBrewMap } from '../../libs/nearbrew-libs/src';




export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyBanner />
      
      {/* Main content area */}
      <div className="flex justify-center py-16 px-4">
        <NearBrewCard className="w-full max-w-3xl">
          <div className="space-y-6">
            
            <NearBrewMap height={350} />
          </div>
        </NearBrewCard>
      </div>
      
    </div>
  );
}

export default App;
