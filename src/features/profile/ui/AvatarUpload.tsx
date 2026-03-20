'use client';

import { useState, useRef } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import { authApi } from '@/shared/api';
import { AvatarCropModal } from './AvatarCropModal';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: () => void;
}

export function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    // Создаем URL для предпросмотра и открываем кроппер
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    setImageToCrop(null);
    
    try {
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      await authApi.uploadAvatar(croppedFile);
      onAvatarChange();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;

    setIsUploading(true);
    try {
      await authApi.deleteAvatar();
      onAvatarChange();
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = currentAvatar 
    ? `${process.env.NEXT_PUBLIC_API_URL}${currentAvatar}`
    : null;

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-muted border-2 sm:border-4 border-border">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-primary/50" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2 touch-target w-full sm:w-auto"
          >
            <Camera className="h-4 w-4" />
            {currentAvatar ? t('profile.avatar.change') : t('profile.avatar.upload')}
          </Button>

          {currentAvatar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isUploading}
              className="gap-2 text-red-600 hover:text-red-700 touch-target w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {t('profile.avatar.delete')}
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {imageToCrop && (
        <AvatarCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setImageToCrop(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      )}
    </>
  );
}
