"use client";

import type { ButtonHTMLAttributes } from "react";
import { Heart, Flag, Edit2 } from "lucide-react";
import { useTranslation } from "@/shared/lib/hooks";

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface FavoriteButtonProps extends Omit<BaseButtonProps, "type"> {
  isFavorite: boolean;
  loading?: boolean;
}

export function FavoriteButton({
  isFavorite,
  loading,
  className = "",
  title,
  disabled,
  ...rest
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      {...rest}
      disabled={isDisabled}
      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
        isFavorite
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      } disabled:opacity-50 ${className}`}
      title={
        title ??
        (isFavorite
          ? t("favorites.removeFromFavorites")
          : t("favorites.addToFavorites"))
      }
    >
      <Heart
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          isFavorite ? "fill-current" : ""
        }`}
      />
    </button>
  );
}

export interface ReportButtonProps extends Omit<BaseButtonProps, "type"> {}

export function ReportButton({
  className = "",
  ...rest
}: ReportButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 ${className}`}
    >
      <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );
}

export interface EditButtonProps extends Omit<BaseButtonProps, "type"> {}

export function EditButton({ className = "", ...rest }: EditButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      {...rest}
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 ${className}`}
      title={rest.title ?? t("common.edit")}
    >
      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );
}

