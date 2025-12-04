import { FaCoffee } from 'react-icons/fa';
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton';

export function StickyBanner() {
  return (
    <div 
      className="sticky top-0 bg-primary text-primary-foreground p-4 border-b border-border"
      style={{ zIndex: 9999 }}
    >
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
        
       
        <div className="hidden sm:block">
          <BuyMeACoffeeButton />
        </div>
      </div>
    </div>
  );
}

export default StickyBanner;
