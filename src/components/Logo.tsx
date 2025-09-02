import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md', theme = 'dark' }) => {
  const sizeClasses = {
    sm: { wrapper: 'h-8', icon: 'h-6 w-6', text: 'text-lg' },
    md: { wrapper: 'h-12', icon: 'h-10 w-10', text: 'text-xl' },
    lg: { wrapper: 'h-16', icon: 'h-14 w-14', text: 'text-2xl' },
    xl: { wrapper: 'h-20', icon: 'h-18 w-18', text: 'text-3xl' },
  };

  const iconColor = theme === 'dark' ? '#7C3AED' : '#FFFFFF';
  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';

  return (
    <div className={`flex items-center space-x-3 ${className} ${sizeClasses[size].wrapper}`}>
      <svg
        className={sizeClasses[size].icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo principal roxo com borda */}
        <circle cx="50" cy="50" r="47" fill={iconColor} stroke="white" strokeWidth="2"/>
        
        {/* Círculo interno claro (maior e mais visível) */}
        <circle cx="50" cy="50" r="20" fill="#E5E7EB" opacity="0.6"/>
        
        {/* Linhas de luz em 8 direções (mais grossas) */}
        <path d="M25 25L35 35" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 10V25" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M75 25L65 35" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M90 50H75" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M75 75L65 65" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 90V75" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M25 75L35 65" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M10 50H25" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      {showText && (
        <span className={`font-bold ${textColor} ${sizeClasses[size].text}`}>
          Lumenix
        </span>
      )}
    </div>
  );
};

export default Logo;
