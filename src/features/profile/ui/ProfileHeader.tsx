'use client';

import { Edit2 } from 'lucide-react';
import { Button } from '@/shared/ui';

interface ProfileHeaderProps {
  username: string;
  email: string;
  isEditing: boolean;
  onEdit: () => void;
}

export function ProfileHeader({ username, email, isEditing, onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main truncate">
          {username}
        </h1>
        <p className="mt-1 text-sm text-text-muted truncate">{email}</p>
      </div>
      
      {!isEditing && (
        <Button onClick={onEdit} variant="outline" className="gap-2 w-full sm:w-auto">
          <Edit2 className="h-4 w-4" />
          <span>Редактировать</span>
        </Button>
      )}
    </div>
  );
}
