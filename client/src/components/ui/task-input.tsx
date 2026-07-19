import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface TaskInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const TaskInput = React.forwardRef<HTMLInputElement, TaskInputProps>(
  ({ className, id, label, error, required, ...props }, ref) => {
    const tempId = React.useId();
    const inputId = id || props.name || tempId;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}

        <Input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
          {...props}
        />

        {error && <p className="text-sm text-destructive">* {error}</p>}
      </div>
    );
  },
);

TaskInput.displayName = 'TaskInput';

export default TaskInput;
