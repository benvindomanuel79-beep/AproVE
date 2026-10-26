import React from 'react';

interface AproVELogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  inverted?: boolean;
  className?: string;
}

export const AproVELogo: React.FC<AproVELogoProps> = ({
  size = 'md',
  showSlogan = false,
  inverted = false,
  className = '',
}) => {
  // Sizing definitions
  const sizeMap = {
    sm: {
      text: 'text-lg',
      iconSize: 'w-6 h-6',
      iconInner: 'w-3.5 h-3.5',
      badge: 'text-[9px] px-1.5 py-0.2',
      slogan: 'text-[10px]',
    },
    md: {
      text: 'text-xl sm:text-2xl',
      iconSize: 'w-8 h-8',
      iconInner: 'w-4.5 h-4.5',
      badge: 'text-[10px] px-2 py-0.5',
      slogan: 'text-xs',
    },
    lg: {
      text: 'text-2xl sm:text-3xl',
      iconSize: 'w-10 h-10',
      iconInner: 'w-6 h-6',
      badge: 'text-xs px-2.5 py-0.5',
      slogan: 'text-sm',
    },
    xl: {
      text: 'text-3xl sm:text-4xl lg:text-5xl',
      iconSize: 'w-14 h-14',
      iconInner: 'w-8 h-8',
      badge: 'text-sm px-3 py-1',
      slogan: 'text-base',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Geometric progress & direction icon (Minimalist chevron + forward beacon) */}
        <div
          className={`${currentSize.iconSize} rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105`}
          style={{
            backgroundColor: '#10233F',
            border: '1.5px solid rgba(22, 166, 115, 0.4)',
          }}
          aria-hidden="true"
        >
          <svg
            className={currentSize.iconInner}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Geometric upward progress arrow & check beacon */}
            <path
              d="M4 14L9.5 19.5L20 5"
              stroke="#16A673"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="19.5" cy="4.5" r="2.5" fill="#E6B75A" />
          </svg>
        </div>

        {/* Typographic wordmark with subtle highlight on 'VE' */}
        <div className="flex items-baseline tracking-tight">
          <span
            className={`font-extrabold ${currentSize.text} font-heading ${
              inverted ? 'text-white' : 'text-[#10233F] dark:text-white'
            }`}
          >
            Apro
          </span>
          <span
            className={`font-black ${currentSize.text} font-heading text-[#16A673] relative`}
          >
            VE
            <span
              className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-[#E6B75A]"
              title="Aprovação e Excelência"
            />
          </span>
        </div>
      </div>

      {showSlogan && (
        <span
          className={`mt-0.5 font-medium tracking-wide ${currentSize.slogan} ${
            inverted
              ? 'text-slate-300'
              : 'text-[#344054] dark:text-slate-400'
          }`}
        >
          Mais preparação. Mais confiança.
        </span>
      )}
    </div>
  );
};
