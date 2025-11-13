import React from 'react';

interface NearBrewCardProps {
  children?: React.ReactNode;
  className?: string;
}

export function NearBrewCard({ children, className = '' }: NearBrewCardProps) {
  return (
    <div className={`bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-lg max-w-4xl mx-auto overflow-hidden ${className}`}>
      {children || <h2 className="text-2xl font-semibold text-center">Parent Card </h2>}
    </div>
  );
}

export default NearBrewCard;
