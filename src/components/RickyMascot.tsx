import React from 'react';

interface RickyMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export const RickyMascot: React.FC<RickyMascotProps> = ({
  size = 'lg',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Mascot Image Container - No white background, transparent */}
      <div className="relative">
        {/* Main image container */}
        <div className={`relative ${sizeMap[size]} transition-all duration-300`}>
          <img
            src="https://iili.io/f0nWwnj.png"
            alt="Ricky - Turf45 Pickleball Mascot"
            className="w-full h-full object-contain relative z-10 drop-shadow-lg animate-bounce-slow"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};
