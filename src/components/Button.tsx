'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  className = '',
  variant = 'primary',
  onClick,
  ...rest
}) => {
  const baseStyles =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-none outline-offset-0 ';

  const variants = {
    primary: 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 outline-none focus:ring-fuchsia-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className="w-5 h-5 font-bold">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default Button;
