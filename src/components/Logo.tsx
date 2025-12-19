import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * This custom logo component renders the TURF 45 logo for all use cases.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * Use the TURF 45 brand graphic with green theme styling
   * for all logo purposes, scaling with prop or parent container
   */
}

const imgMap = {
  sm: 32,
  md: 52,
  lg: 80,
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const isMobile = useIsMobile();
  // Prefer smaller logo for mobile regardless of size prop (for navbar fit)
  const height = isMobile ? 36 : imgMap[size] || 52;
  const width = height * 1.5; // TURF 45 logo is wider (horizontal layout)

  return (
    <div className="relative inline-flex items-center gap-2 group">
      <div className="relative">
        {/* Green glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-turf45-green/20 to-turf45-lightgreen/20 rounded-full opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300"></div>
        <img
          src="/turf45-logo.png"
          alt="TURF 45 - FIFA Approved Football, Cricket & Pickleball Turf"
          height={height}
          width={width}
          style={{
            objectFit: "contain",
            background: "transparent",
            maxHeight: height, 
            maxWidth: width,
            filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))",
          }}
            className={`select-none relative z-10 group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-300 ${className || ""}`}
          draggable={false}
          loading="lazy"
        />
      </div>
      {!isMobile && size !== 'sm' && (
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-turf45-green to-turf45-lightgreen font-heading group-hover:from-turf45-green group-hover:to-turf45-lightgreen transition-all duration-300">
          TURF 45
        </span>
      )}
    </div>
  );
};

export default Logo;
