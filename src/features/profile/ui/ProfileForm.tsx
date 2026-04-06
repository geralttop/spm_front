'use client';

import { useMemo } from 'react';
import { User, Mail, Check, X, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input, Textarea, Button, ShareLinkButton } from '@/shared/ui';
import { UserBadges } from '@/shared/ui/user-badges';
import { userProfilePath } from '@/shared/lib/user-profile-path';
import { useForm } from '@/shared/lib/hooks';
import { createUpdateProfileSchema } from '@/shared/schemas';
import type { ProfileResponse } from '@/shared/types';
import { AvatarUpload } from './AvatarUpload';

interface ProfileFormProps {
  profile: ProfileResponse;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: { username?: string; bio?: string }) => Promise<void>;
  onCancel: () => void;
  onAvatarChange: () => void;
}

export function ProfileForm({ profile, isEditing, onEdit, onSave, onCancel, onAvatarChange }: ProfileFormProps) {
  const { t } = useTranslation();
  const updateProfileSchema = useMemo(() => createUpdateProfileSchema(t), [t]);
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      username: profile.username || '',
      bio: profile.bio || '',
    },
    schema: updateProfileSchema,
    onSubmit: onSave,
  });

  const avatarUrl = profile.avatar 
    ? `${process.env.NEXT_PUBLIC_API_URL}${profile.avatar}`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-6 shadow-sm">
      {/* Шапка с аватаркой и кнопкой редактирования */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border">
        {/* Аватарка */}
        <div className="shrink-0">
          <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted border-2 sm:border-4 border-border">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={profile.username} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <User className="h-8 w-8 sm:h-12 sm:w-12 text-primary/50" />
              </div>
            )}
          </div>
        </div>
        
        {/* Информация */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h1 className="flex min-w-0 items-center gap-2 truncate text-xl font-bold text-text-main sm:text-3xl">
            <span className="truncate">{profile.username || t("profile.title")}</span>
            <UserBadges
              role={profile.role}
              createdPointsCount={profile.createdPointsCount}
              className="shrink-0"
            />
          </h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-muted truncate break-all">{profile.email}</p>
        </div>
        
        {/* Поделиться и редактирование */}
        {!isEditing && (
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            {profile.username ? (
              <ShareLinkButton path={userProfilePath(profile.username)} />
            ) : null}
            <Button onClick={onEdit} variant="outline" className="min-w-0 flex-1 gap-2 touch-target sm:flex-initial">
              <Edit2 className="h-4 w-4" />
              <span>{t('profile.profileHeader.edit')}</span>
            </Button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && (
          <div className="pb-4 border-b border-border">
            <label className="mb-2 block text-sm font-medium text-text-muted">
              {t('profile.avatar.upload')}
            </label>
            <AvatarUpload 
              currentAvatar={profile.avatar} 
              onAvatarChange={onAvatarChange}
            />
          </div>
        )}
        
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
            <User className="h-4 w-4" />
            {t('profile.profileForm.username')}
          </label>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={values.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder={t('profile.profileForm.usernamePlaceholder')}
                maxLength={30}
                minLength={3}
                className="text-base touch-target"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-destructive">{errors.username}</p>
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
            {t('profile.email')}
          </label>
          <p className="text-text-main font-medium break-all">{profile.email}</p>
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            {t('profile.profileForm.bio')}
          </label>
          {isEditing ? (
            <>
              <Textarea
                value={values.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder={t('profile.profileForm.bioPlaceholder')}
                maxLength={500}
                rows={4}
                className="text-base touch-target min-h-[100px]"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-destructive">{errors.bio}</p>
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
              className="flex-1 gap-2 w-full touch-target"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? t('profile.profileForm.saving') : t('profile.profileForm.save')}
            </Button>
            <Button 
              type="button"
              onClick={onCancel} 
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 gap-2 w-full touch-target"
            >
              <X className="h-4 w-4" />
              {t('profile.profileForm.cancel')}
            </Button>
          </div>
        )}

        {errors.submit && (
          <p className="text-sm text-destructive">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
