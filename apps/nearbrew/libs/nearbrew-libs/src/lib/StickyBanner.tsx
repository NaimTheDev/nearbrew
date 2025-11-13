import { FaCoffee } from 'react-icons/fa';
import { NearBrewButton } from './NearBrewButton';

export function StickyBanner() {
  return (
    <div className="sticky top-0 bg-primary text-primary-foreground p-4 z-50 border-b border-border">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
      
        <div className="flex items-center gap-3">
          <FaCoffee className="text-2xl" />
          <div>
            <span className="text-xl font-bold">NearBrew</span>
            <span className="text-sm opacity-90 ml-2 hidden sm:inline">
              — How busy is your favorite coffee shop?
            </span>
          </div>
        </div>
        
       
        <NearBrewButton 
          variant="secondary" 
          size="md"
          className="bg-primary-foreground text-primary hover:bg-opacity-90"
          onClick={() => (globalThis as any).open('https://buymeacoffee.com/naimabubakh', '_blank')}
        >
          Buy Me a Coffee
        </NearBrewButton>
      </div>
    </div>
  );
}

export default StickyBanner;
