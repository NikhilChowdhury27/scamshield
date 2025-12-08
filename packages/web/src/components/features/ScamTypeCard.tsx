import {
  Users,
  Monitor,
  Building,
  Gift,
  CreditCard,
  Package,
  Heart,
  HeartHandshake,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { ScamTypeInfo } from '@scamshield/shared';

interface ScamTypeCardProps {
  scamType: ScamTypeInfo;
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  Monitor,
  Building,
  Gift,
  CreditCard,
  Package,
  Heart,
  HandHeart: HeartHandshake,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/30',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-500/30',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500/30',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-500/30',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-500/30',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-500/30',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/30',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-500/30',
  },
};

export function ScamTypeCard({ scamType }: ScamTypeCardProps) {
  const Icon = iconMap[scamType.icon] || HelpCircle;
  const colors = colorClasses[scamType.color] || colorClasses.gray;

  return (
    <Card className={`border ${colors.border}`}>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${colors.text}`}>{scamType.name}</h3>
            <p className="text-txt-muted text-sm mt-1">{scamType.description}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-txt mb-2">Red Flags to Watch For:</h4>
          <ul className="space-y-1">
            {scamType.redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-txt-muted flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.text}`} />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
