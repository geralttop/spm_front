'use client';

import { Edit2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ShareLinkButton } from '@/shared/ui';
import { UserBadges } from '@/shared/ui/user-badges';
import { userProfilePath } from '@/shared/lib/user-profile-path';

interface ProfileHeaderProps {
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  createdPointsCount?: number;
  isEditing: boolean;
  onEdit: () => void;
}

export function ProfileHeader({ username, email, avatar, role, createdPointsCount, isEditing, onEdit }: ProfileHeaderProps) {
  const { t } = useTranslation();
  
  const avatarUrl = avatar 
    ? `${process.env.NEXT_PUBLIC_API_URL}${avatar}`
    : null;
  
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Аватарка */}
        <div className="shrink-0">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted border-4 border-border">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={username} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary/50" />
              </div>
            )}
          </div>
        </div>
        
        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h1 className="flex min-w-0 items-center gap-2 truncate text-2xl font-bold text-text-main sm:text-3xl">
            <span className="truncate">{username}</span>
            <UserBadges
              role={role}
              createdPointsCount={createdPointsCount}
              className="shrink-0"
            />
          </h1>
          <p className="mt-1 text-sm text-text-muted truncate">{email}</p>
        </div>
        
        {/* Поделиться и редактирование */}
        {!isEditing && (
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <ShareLinkButton path={userProfilePath(username)} />
            <Button onClick={onEdit} variant="outline" className="min-w-0 flex-1 gap-2 sm:flex-initial">
              <Edit2 className="h-4 w-4" />
              <span>{t('profile.profileHeader.edit')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
