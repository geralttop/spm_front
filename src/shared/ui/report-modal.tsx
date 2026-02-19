'use client';

import { useState } from 'react';
import { X, AlertTriangle, Flag } from 'lucide-react';
import { reportsApi, CreateReportRequest } from '@/shared/api';
import { useToast } from './toast';
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
  const { showToast } = useToast();
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
      
      // Показываем уведомление об успехе
      showToast(t('reports.successMessage'), 'success');
      
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('reports.title')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('reports.subtitle', { type: getTypeLabel() })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
          {/* Target info */}
          {targetName && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">
                {t('reports.target')}:
              </p>
              <p className="font-medium text-gray-900">{targetName}</p>
            </div>
          )}

          {/* Reason selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {t('reports.reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reasonOption) => (
                <label
                  key={reasonOption.value}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value as CreateReportRequest['reason'])}
                    className="text-red-600 focus:ring-red-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-gray-900">
                    {t(reasonOption.labelKey)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('reports.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reports.descriptionPlaceholder')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white text-gray-900"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors bg-white"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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