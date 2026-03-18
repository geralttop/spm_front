'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';

interface AvatarCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}

export function AvatarCropModal({ imageSrc, onCropComplete, onClose }: AvatarCropModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const croppedImage = await createCroppedImage();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-card rounded-t-2xl sm:rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-text-main">
            {t('profile.avatar.crop')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors touch-target"
            aria-label={t('profile.profileForm.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Область кроппера */}
        <div className="relative h-64 sm:h-96 bg-black min-h-[200px] flex-1">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Зум слайдер */}
        <div className="p-4 border-t border-border shrink-0">
          <label className="block text-sm font-medium text-text-muted mb-2">
            {t('profile.avatar.zoom')}
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-10 py-2 touch-target"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 p-4 border-t border-border shrink-0 safe-area-bottom">
          <Button
            onClick={handleSave}
            className="flex-1 gap-2 touch-target"
          >
            <Check className="h-4 w-4" />
            {t('profile.avatar.apply')}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 gap-2 touch-target"
          >
            <X className="h-4 w-4" />
            {t('profile.profileForm.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Вспомогательная функция для создания Image из URL
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
