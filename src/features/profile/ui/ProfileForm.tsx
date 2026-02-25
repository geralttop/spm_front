'use client';

import { User, Mail, Check, X } from 'lucide-react';
import { Input, Textarea, Button } from '@/shared/ui';
import { useForm } from '@/shared/lib/hooks';
import { updateProfileSchema } from '@/shared/schemas';
import type { ProfileResponse } from '@/shared/types';

interface ProfileFormProps {
  profile: ProfileResponse;
  isEditing: boolean;
  onSave: (data: { username: string; bio: string }) => Promise<void>;
  onCancel: () => void;
}

export function ProfileForm({ profile, isEditing, onSave, onCancel }: ProfileFormProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      username: profile.username || '',
      bio: profile.bio || '',
    },
    schema: updateProfileSchema,
    onSubmit: onSave,
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-base sm:text-lg font-semibold text-text-main">
        Информация профиля
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
            <User className="h-4 w-4" />
            Имя пользователя
          </label>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={values.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Введите имя пользователя"
                maxLength={30}
                minLength={3}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </>
          ) : (
            <p className="text-text-main font-medium hyphens-auto">
              {profile.username || '-'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <p className="text-text-main font-medium break-all">{profile.email}</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Биография
          </label>
          {isEditing ? (
            <>
              <Textarea
                value={values.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Расскажите о себе"
                maxLength={1000}
                rows={4}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </>
          ) : (
            <p className="text-text-main whitespace-pre-wrap hyphens-auto">
              {profile.bio || '-'}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2 w-full"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button 
              type="button"
              onClick={onCancel} 
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 gap-2 w-full"
            >
              <X className="h-4 w-4" />
              Отмена
            </Button>
          </div>
        )}

        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
