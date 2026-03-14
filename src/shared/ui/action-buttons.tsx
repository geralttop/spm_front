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
          ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-muted text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 ${className}`}
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
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 ${className}`}
      title={rest.title ?? t("common.edit")}
    >
      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );
}

