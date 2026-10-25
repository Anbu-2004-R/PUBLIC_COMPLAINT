import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

interface CivicPulseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  linkToHome?: boolean;
  className?: string;
}

export function CivicPulseLogo({
  size = 'md',
  variant = 'dark',
  showTagline = false,
  linkToHome = true,
  className = '',
}: CivicPulseLogoProps) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Civic Beacon & Pulse Wave */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Rounded Hexagonal Shield / Civic Base */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill={isLight ? '#1E2A44' : '#10192E'}
            stroke={isLight ? '#334155' : '#0D9488'}
            strokeWidth="1.5"
          />
          {/* Concentric Pulse Ripples */}
          <circle
            cx="20"
            cy="20"
            r="12"
            stroke="#0D9488"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />
          <circle
            cx="20"
            cy="20"
            r="7"
            stroke="#14B8A6"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          {/* Central Beacon Node with Activity Spark */}
          <circle cx="20" cy="20" r="3.5" fill="#2DD4BF" />
          <path
            d="M12 20H15L17.5 15L20 23L22.5 18L25 20H28"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight font-display flex items-baseline leading-none ${textSizes[size]}`}>
          <span className={isLight ? 'text-white' : 'text-[#10192E]'}>Civic</span>
          <span className="text-[#0D9488] ml-0.5">Pulse</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D9488] ml-1 mb-0.5" />
        </div>
        {showTagline && (
          <span
            className={`text-[10px] tracking-wider uppercase font-semibold mt-1 ${
              isLight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Your City. Your Voice. Real Action.
          </span>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to={ROUTES.HOME} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
