"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, Check } from "lucide-react";
import { useTranslation } from "@/shared/lib/hooks";
import { Button } from "@/shared/ui";
import {
  POINT_CROP_OUTPUT_HEIGHT,
  POINT_CROP_OUTPUT_WIDTH,
  POINT_MEDIA_RATIO_W,
  POINT_MEDIA_RATIO_H,
} from "@/shared/lib/point-media-aspect";

interface PointPhotoCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}

export function PointPhotoCropModal({
  imageSrc,
  onCropComplete,
  onClose,
}: PointPhotoCropModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageSrc]);

  const onCropCompleteCallback = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return undefined;
    const image = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = POINT_CROP_OUTPUT_WIDTH;
    canvas.height = POINT_CROP_OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      POINT_CROP_OUTPUT_WIDTH,
      POINT_CROP_OUTPUT_HEIGHT
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("toBlob failed"));
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleSave = async () => {
    const croppedImage = await createCroppedImage();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  const aspect = POINT_MEDIA_RATIO_W / POINT_MEDIA_RATIO_H;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:max-h-[90vh] sm:rounded-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-text-main">
            {t("pointPhoto.cropTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 touch-target rounded-lg p-2 hover:bg-muted"
            aria-label={t("pointPhoto.cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-[220px] flex-1 bg-black sm:min-h-[320px] sm:h-96">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="shrink-0 border-t border-border p-4">
          <label className="mb-2 block text-sm font-medium text-text-muted">
            {t("pointPhoto.zoom")}
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-10 w-full touch-target py-2"
          />
        </div>

        <div className="shrink-0 flex gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={handleSave}
            disabled={!croppedAreaPixels}
            className="flex-1 touch-target gap-2"
          >
            <Check className="h-4 w-4" />
            {t("pointPhoto.apply")}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 touch-target gap-2">
            <X className="h-4 w-4" />
            {t("pointPhoto.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (e) => reject(e));
    image.src = url;
  });
}
