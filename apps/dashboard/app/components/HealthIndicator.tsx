import React from 'react';

interface HealthIndicatorProps {
  health: 'good' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthIndicator({ health, size = 'md' }: HealthIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const healthClasses = {
    good: 'bg-green-500 animate-pulse',
    warning: 'bg-yellow-500 animate-pulse-slow',
    critical: 'bg-red-500 animate-pulse',
  };

  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${healthClasses[health]}`}
      title={`Health: ${health}`}
    />
  );
}