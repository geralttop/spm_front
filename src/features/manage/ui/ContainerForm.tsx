'use client';

import { useForm } from '@/shared/lib/hooks';
import { useTranslation } from 'react-i18next';
import { containersApi, type Container } from '@/shared/api';

interface ContainerFormProps {
  editingContainer: Container | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContainerForm({ editingContainer, onSuccess, onCancel }: ContainerFormProps) {
  const { t } = useTranslation();
  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      title: editingContainer?.title || '',
      description: editingContainer?.description || '',
      color: editingContainer?.color || '#3B82F6',
    },
    onSubmit: async (values) => {
      if (editingContainer) {
        await containersApi.update(editingContainer.id, values);
      } else {
        await containersApi.create(values);
      }
      onSuccess();
    },
  });

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-surface rounded-lg border border-border">
      <h3 className="font-medium text-text-main mb-4">
        {editingContainer ? t('manage.containerForm.edit') : t('manage.containerForm.new')}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            {t('manage.containerForm.title')} <span className="text-destructive">{t('manage.containerForm.required')}</span>
          </label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            required
            maxLength={255}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            {t('manage.containerForm.description')}
          </label>
          <textarea
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            {t('manage.containerForm.color')} <span className="text-destructive">{t('manage.containerForm.required')}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-border bg-background p-1"
              required
            />
            <input
              type="text"
              value={values.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              required
              pattern="^#([A-Fa-f0-9]{6})$"
              placeholder="#3B82F6"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('manage.containerForm.saving') : editingContainer ? t('manage.containerForm.save') : t('manage.containerForm.create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg text-text-main hover:bg-surface transition-colors"
          >
            {t('manage.containerForm.cancel')}
          </button>
        </div>
      </div>
    </form>
  );
}
