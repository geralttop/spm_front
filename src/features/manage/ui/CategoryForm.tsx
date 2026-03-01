'use client';

import { useForm } from '@/shared/lib/hooks';
import { useTranslation } from 'react-i18next';
import { categoriesApi, type Category } from '@/shared/api';

interface CategoryFormProps {
  editingCategory: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ editingCategory, onSuccess, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();
  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      name: editingCategory?.name || '',
      color: editingCategory?.color || '#3B82F6',
    },
    onSubmit: async (values) => {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, values);
      } else {
        await categoriesApi.create(values);
      }
      onSuccess();
    },
  });

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-surface rounded-lg border border-border">
      <h3 className="font-medium text-text-main mb-4">
        {editingCategory ? t('manage.categoryForm.edit') : t('manage.categoryForm.new')}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            {t('manage.categoryForm.name')} <span className="text-red-500">{t('manage.categoryForm.required')}</span>
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            {t('manage.categoryForm.color')}
          </label>
          <input
            type="color"
            value={values.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-20 h-10 border border-border rounded-lg cursor-pointer"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('manage.categoryForm.saving') : editingCategory ? t('manage.categoryForm.save') : t('manage.categoryForm.create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg text-text-main hover:bg-surface transition-colors"
          >
            {t('manage.categoryForm.cancel')}
          </button>
        </div>
      </div>
    </form>
  );
}
