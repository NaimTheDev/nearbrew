import { FaCoffee } from 'react-icons/fa';

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
        
       
        <a href="https://www.buymeacoffee.com/naimabubakh" target="_blank" rel="noopener noreferrer">
          <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=naimabubakh&button_colour=c57b49&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" alt="Buy me a coffee" />
        </a>
      </div>
    </div>
  );
}

export default StickyBanner;
