'use client';

import { useState, useRef } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import { authApi } from '@/shared/api';
import { useToast } from '@/shared/lib/hooks';
import { AvatarCropModal } from './AvatarCropModal';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: () => void;
}

export function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatar.invalidType'));
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.avatar.tooLarge'));
      return;
    }

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
      // Создаем File из Blob
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      await authApi.uploadAvatar(croppedFile);
      toast.success(t('profile.avatar.uploadSuccess'));
      onAvatarChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profile.avatar.uploadError'));
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
      toast.success(t('profile.avatar.deleteSuccess'));
      onAvatarChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profile.avatar.deleteError'));
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
          <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-border">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                <User className="h-16 w-16 text-primary/50" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
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
              className="gap-2 text-red-600 hover:text-red-700"
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
