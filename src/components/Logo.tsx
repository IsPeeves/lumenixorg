import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md', theme = 'dark' }) => {
  const sizeClasses = {
    sm: { wrapper: 'h-8', icon: 'h-6 w-6', text: 'text-lg' },
    md: { wrapper: 'h-10', icon: 'h-8 w-8', text: 'text-xl' },
    lg: { wrapper: 'h-12', icon: 'h-10 w-10', text: 'text-2xl' },
  };

  const iconColor = theme === 'dark' ? '#482f6c' : '#FFFFFF';
  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';

  return (
    <div className={`flex items-center space-x-2 ${className} ${sizeClasses[size].wrapper}`}>
      <svg
        className={sizeClasses[size].icon}
        viewBox="0 0 24 24"
        fill={iconColor}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2.5a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75zM12 18.75a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75zM5.47 5.47a.75.75 0 011.06 0l1.414 1.414a.75.75 0 11-1.06 1.06L5.47 6.53a.75.75 0 010-1.06zM17.071 17.071a.75.75 0 011.06 0l1.414 1.414a.75.75 0 01-1.06 1.06l-1.414-1.414a.75.75 0 010-1.06zM2.5 12a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2a.75.75 0 01-.75-.75zM18.75 12a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2a.75.75 0 01-.75-.75zM5.47 18.53a.75.75 0 010-1.06l1.414-1.414a.75.75 0 011.06 1.06L6.53 18.53a.75.75 0 01-1.06 0zM17.071 6.929a.75.75 0 010-1.06l1.414-1.414a.75.75 0 111.06 1.06l-1.414 1.414a.75.75 0 01-1.06 0zM12 7a5 5 0 100 10 5 5 0 000-10z" />
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
