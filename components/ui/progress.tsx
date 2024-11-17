import React from 'react';

import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLProgressElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    return (
      <progress
        ref={ref}
        value={value}
        max={max}
        className={cn(
          'w-full h-2 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full',
          'bg-secondary [&::-webkit-progress-value]:bg-primary',
          className
        )}
        {...props}
      />
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
