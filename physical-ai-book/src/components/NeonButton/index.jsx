import React, { forwardRef } from 'react';
import styles from './styles.module.css';

/**
 * NeonButton Component
 * Reusable button with neon glow styling and hover effects
 */
const NeonButton = forwardRef(
  (
    {
      children,
      className = '',
      variant = 'primary',
      disabled = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const combinedClassName = [
      styles.button,
      styles[variant],
      className,
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeonButton.displayName = 'NeonButton';

export default NeonButton;
