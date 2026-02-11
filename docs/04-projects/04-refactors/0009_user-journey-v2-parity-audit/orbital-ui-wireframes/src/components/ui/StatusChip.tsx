import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';
import { RowStatus } from '../../hooks/useOrbitalState';
interface StatusChipProps {
  status: RowStatus;
  className?: string;
}
export function StatusChip({ status, className = '' }: StatusChipProps) {
  const config = {
    needs_review: {
      icon: HelpCircle,
      text: 'Needs Review',
      classes: 'bg-orange-100 text-orange-800 border-orange-200',
      iconColor: 'text-orange-600'
    },
    reviewed: {
      icon: CheckCircle2,
      text: 'Reviewed',
      classes: 'bg-success-100 text-success-800 border-success-200',
      iconColor: 'text-success-600'
    },
    missing_input: {
      icon: AlertCircle,
      text: 'Missing Input',
      classes: 'bg-muted text-muted-foreground border-border',
      iconColor: 'text-muted-foreground'
    },
    citation_failed: {
      icon: XCircle,
      text: 'Citation Failed',
      classes: 'bg-destructive-100 text-destructive-800 border-destructive-200',
      iconColor: 'text-destructive-600'
    }
  };
  const { icon: Icon, text, classes, iconColor } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes} ${className}`}>

      <Icon className={`w-3.5 h-3.5 mr-1.5 ${iconColor}`} />
      {text}
    </span>);

}