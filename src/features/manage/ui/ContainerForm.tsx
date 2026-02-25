'use client';

import { useForm } from '@/shared/lib/hooks';
import { containersApi, type Container } from '@/shared/api';

interface ContainerFormProps {
  editingContainer: Container | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContainerForm({ editingContainer, onSuccess, onCancel }: ContainerFormProps) {
  const { values, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      title: editingContainer?.title || '',
      description: editingContainer?.description || '',
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
        {editingContainer ? 'Редактировать контейнер' : 'Новый контейнер'}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            Название <span className="text-red-500">*</span>
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
            Описание
          </label>
          <textarea
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение...' : editingContainer ? 'Сохранить' : 'Создать'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg text-text-main hover:bg-surface transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </form>
  );
}
