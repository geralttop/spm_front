'use client';

import { useState } from 'react';
import { X, AlertTriangle, Flag } from 'lucide-react';
import { reportsApi, CreateReportRequest } from '@/shared/api';
import { useTranslation } from 'react-i18next';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'point' | 'comment' | 'user';
  targetId: string | number;
  targetName?: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', labelKey: 'reports.reasons.spam' },
  { value: 'inappropriate', labelKey: 'reports.reasons.inappropriate' },
  { value: 'harassment', labelKey: 'reports.reasons.harassment' },
  { value: 'fake', labelKey: 'reports.reasons.fake' },
  { value: 'other', labelKey: 'reports.reasons.other' },
] as const;

export function ReportModal({ 
  isOpen, 
  onClose, 
  type, 
  targetId, 
  targetName,
  onSuccess 
}: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<CreateReportRequest['reason']>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reportData: CreateReportRequest = {
        type,
        reason,
        description: description.trim() || undefined,
      };

      // Добавляем соответствующий ID в зависимости от типа
      if (type === 'point') {
        reportData.pointId = targetId as string;
      } else if (type === 'comment') {
        reportData.commentId = targetId as number;
      } else if (type === 'user') {
        reportData.reportedUserId = targetId as number;
      }

      await reportsApi.create(reportData);
      onSuccess?.();
      onClose();
      
      // Сбрасываем форму
      setReason('spam');
      setDescription('');
    } catch (err: any) {
      console.error('Ошибка при отправке жалобы:', err);
      setError(
        err.response?.data?.message || 
        t('reports.errors.submitFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'point':
        return t('reports.types.point');
      case 'comment':
        return t('reports.types.comment');
      case 'user':
        return t('reports.types.user');
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 max-sm:items-stretch max-sm:justify-start max-sm:p-0">
      <div className="w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card text-card-foreground shadow-2xl max-h-[90vh] max-sm:flex max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:max-w-none max-sm:flex-col max-sm:overflow-hidden max-sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card p-6 max-sm:shrink-0 max-sm:p-4 max-sm:pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3 max-sm:min-w-0 max-sm:flex-1">
            <div className="shrink-0 rounded-lg bg-destructive/15 p-2">
              <Flag className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                {t('reports.title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('reports.subtitle', { type: getTypeLabel() })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 max-sm:flex max-sm:min-h-[44px] max-sm:min-w-[44px] max-sm:touch-target max-sm:items-center max-sm:justify-center"
            disabled={isSubmitting}
            aria-label={t('profile.close')}
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card p-6 max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col max-sm:space-y-4 max-sm:overflow-y-auto max-sm:overscroll-y-contain max-sm:p-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {/* Target info */}
          {targetName && (
            <div className="p-3 bg-muted rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                {t('reports.target')}:
              </p>
              <p className="font-medium text-foreground">{targetName}</p>
            </div>
          )}

          {/* Reason selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {t('reports.reasonLabel')} <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reasonOption) => (
                <label
                  key={reasonOption.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted max-sm:min-h-[48px]"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value as CreateReportRequest['reason'])}
                    className="text-destructive focus:ring-destructive"
                    disabled={isSubmitting}
                  />
                  <span className="text-foreground">
                    {t(reasonOption.labelKey)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('reports.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reports.descriptionPlaceholder')}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring max-sm:min-h-[120px] max-sm:py-2.5 max-sm:text-base"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/500
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-border pt-4 max-sm:flex-col-reverse max-sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground transition-colors hover:bg-muted max-sm:min-h-[48px] max-sm:py-3"
              disabled={isSubmitting}
            >
              {t('reports.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 max-sm:min-h-[48px] max-sm:py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('reports.submitting') : t('reports.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}