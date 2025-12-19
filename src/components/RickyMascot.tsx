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
      {/* Speech Bubble */}
      {showBubble && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50 animate-fade-in-scale">
          <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-4 max-w-xs">
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg z-10"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Message */}
            <div className="flex items-start gap-2">
              <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                {messages[currentMessage]}
              </p>
            </div>

            {/* Speech bubble tail */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-green-200"></div>
              </div>
            </div>

            {/* Pulsing indicator for multiple messages */}
            {messages.length > 1 && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                {messages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentMessage
                        ? 'bg-green-500 w-4'
                        : 'bg-green-300'
                    }`}
                  />
                ))}
              </div>
            )}
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

