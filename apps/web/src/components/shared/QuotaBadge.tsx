import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { toBanglaDigits } from '@ngo-erp/shared';
import { Database, AlertTriangle } from 'lucide-react';

interface QuotaBadgeProps {
  reads?: number;
  maxReads?: number;
  writes?: number;
  maxWrites?: number;
  className?: string;
}

export const QuotaBadge: React.FC<QuotaBadgeProps> = ({
  reads = 420,
  maxReads = 50000,
  writes = 65,
  maxWrites = 20000,
  className = ''
}) => {
  const { isBangla } = useI18n();

  const percentage = Math.min(100, Math.round((reads / maxReads) * 100));

  let colorClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  if (percentage >= 80) {
    colorClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 animate-pulse';
  } else if (percentage >= 50) {
    colorClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  }

  const readsStr = isBangla ? toBanglaDigits(reads) : reads.toLocaleString();
  const maxReadsStr = isBangla ? toBanglaDigits('50K') : '50K';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClass} ${className}`}
      title={`Estimated Reads: ${reads} / ${maxReads} (${percentage}%) | Writes: ${writes} / ${maxWrites}`}
    >
      {percentage >= 80 ? (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
      ) : (
        <Database className="w-3.5 h-3.5 opacity-80" />
      )}
      <span>
        {isBangla ? `স্পার্ক কোটা: ${readsStr}/${maxReadsStr}` : `Spark Quota: ${readsStr}/${maxReadsStr}`}
      </span>
      <span className="font-bold">({isBangla ? toBanglaDigits(percentage) : percentage}%)</span>
    </div>
  );
};
