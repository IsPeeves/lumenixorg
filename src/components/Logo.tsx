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

  const iconColor = theme === 'dark' ? '#2E2154' : '#FFFFFF';
  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';

  return (
    <div className={`flex items-center space-x-3 ${className} ${sizeClasses[size].wrapper}`}>
      <img
        src="/ICONE LUMENIX.ico"
        alt="Lumenix Logo"
        className={sizeClasses[size].icon}
      />
      {showText && (
        <span className={`font-bold ${textColor} ${sizeClasses[size].text}`}>
          Lumenix
        </span>
      )}
    </div>
  );
};

export default Logo;
