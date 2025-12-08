import type { HTMLAttributes, ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  icon?: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-primary/10 border-primary/30 text-primary',
  success: 'bg-success/10 border-success/30 text-success',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  error: 'bg-danger/10 border-danger/30 text-danger',
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
};

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  icon,
  className = '',
  ...props
}: AlertProps) {
  const displayIcon = icon ?? defaultIcons[variant];

  return (
    <div
      role="alert"
      className={`
        flex gap-3 rounded-lg border p-4
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {displayIcon && (
        <div className="flex-shrink-0">{displayIcon}</div>
      )}
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
