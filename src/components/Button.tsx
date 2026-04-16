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
    'flex items-center justify-center gap-2 px-3 py-3 rounded-sm text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-none outline-offset-0 ';

  const variants = {
    primary: 'bg-[var(--t-accent)] text-white hover:bg-[var(--t-accent-hover)] outline-none',
    secondary: 'bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)] border border-[var(--t-border)] hover:bg-[var(--t-bg-hover)]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
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
