interface BuyMeACoffeeButtonProps {
  className?: string;
}

export function BuyMeACoffeeButton({ className = '' }: BuyMeACoffeeButtonProps) {
  return (
    <a
      href="https://www.buymeacoffee.com/naimabubakh"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <img
        src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=naimabubakh&button_colour=c57b49&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"
        alt="Buy me a coffee"
        className="h-12 w-auto shadow-lg rounded-full"
      />
    </a>
  );
}

export default BuyMeACoffeeButton;
