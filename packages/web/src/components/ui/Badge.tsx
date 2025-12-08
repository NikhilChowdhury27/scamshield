import type { HTMLAttributes, ReactNode } from 'react';
import type { RiskLevel } from '@scamshield/shared';

type BadgeVariant = 'default' | 'danger' | 'warning' | 'success' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-border/50 text-txt',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  info: 'bg-primary/10 text-primary',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Specialized risk level badge
interface RiskBadgeProps extends Omit<BadgeProps, 'variant'> {
  level: RiskLevel;
}

const riskVariantMap: Record<RiskLevel, BadgeVariant> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};

const riskLabelMap: Record<RiskLevel, string> = {
  HIGH: 'High Risk',
  MEDIUM: 'Medium Risk',
  LOW: 'Low Risk',
};

export function RiskBadge({ level, children, ...props }: RiskBadgeProps) {
  return (
    <Badge variant={riskVariantMap[level]} {...props}>
      {children || riskLabelMap[level]}
    </Badge>
  );
}
