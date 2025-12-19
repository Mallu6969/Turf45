import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface RickyMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'hero' | 'card' | 'footer' | 'decorative';
  messages?: string[];
  className?: string;
}

const defaultMessages = [
  "Hey! Ready to play some pickleball? 🏓",
  "Book your court now and let's have fun! ⚽",
  "I'm here to help you find the perfect slot! 🎾",
  "Turf45 has the best facilities in town! 🏆",
  "Don't wait, slots fill up fast! ⏰",
  "Let's make today awesome! Book now! 🌟",
  "I love seeing players on our courts! 💚",
  "Quick tip: Book early for prime time slots! ⭐",
];

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export const RickyMascot: React.FC<RickyMascotProps> = ({
  size = 'lg',
  position = 'decorative',
  messages = defaultMessages,
  className = '',
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Rotate messages periodically
  useEffect(() => {
    if (showBubble) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showBubble, messages.length]);

  // Auto-show bubble on mount for hero position
  useEffect(() => {
    if (position === 'hero') {
      const timer = setTimeout(() => {
        setShowBubble(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [position]);

  const handleClick = () => {
    setShowBubble(!showBubble);
    if (!showBubble) {
      setCurrentMessage(Math.floor(Math.random() * messages.length));
    }
  };

  const handleHover = () => {
    setIsHovered(true);
    if (position !== 'hero') {
      setShowBubble(true);
    }
  };

  const handleLeave = () => {
    setIsHovered(false);
    if (position !== 'hero' && position !== 'card') {
      setShowBubble(false);
    }
  };

  const getPositionClasses = () => {
    // Position classes are handled by parent container
    return '';
  };

  return (
    <div
      className={`relative ${getPositionClasses()} ${className} cursor-pointer group`}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      {/* Modern Cloud Speech Bubble */}
      {showBubble && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50 animate-fade-in-scale">
          <div className="relative max-w-xs">
            {/* Cloud bubble with tail */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-5 border border-green-100/50">
              {/* Cloud shape with smooth curves */}
              <svg className="absolute bottom-0 left-8 transform translate-y-full -mb-1" width="24" height="12" viewBox="0 0 24 12" fill="none">
                <path d="M12 12C8 12 5 9 5 5.5C5 2.5 7.5 0 10.5 0C11.5 0 12.5 0.3 13.3 0.8C14.2 1.3 15 2 15.5 3C16.5 2.5 17.8 2.5 18.8 3.3C19.8 4.1 20.3 5.3 20.3 6.5C20.3 8.5 18.8 10 17 10.5C16.5 11 15.5 12 12 12Z" fill="white" stroke="rgb(229, 231, 235)" strokeWidth="0.5"/>
              </svg>
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg z-10 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Message */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {messages[currentMessage]}
                  </p>
                  
                  {/* Message dots indicator */}
                  {messages.length > 1 && (
                    <div className="flex gap-1.5 mt-3 justify-center">
                      {messages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentMessage
                              ? 'bg-green-500 w-6'
                              : 'bg-green-300 w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mascot Image Container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Main image container */}
        <div
          className={`relative ${sizeMap[size]} transition-all duration-300 ${
            isHovered || showBubble
              ? 'scale-110 rotate-3'
              : 'scale-100 rotate-0'
          }`}
        >
          <div className="absolute -inset-2 bg-green-500/30 rounded-full blur-lg animate-pulse"></div>
          <img
            src="https://iili.io/f0nWwnj.png"
            alt="Ricky - Turf45 Mascot"
            className={`w-full h-full object-contain relative z-10 drop-shadow-lg animate-bounce-slow ${
              isHovered ? 'animate-bounce' : ''
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* #45 Badge */}
          {position === 'hero' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg z-20">
              #45
            </div>
          )}

          {/* Click hint */}
          {!showBubble && position !== 'hero' && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click me! 👆
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

