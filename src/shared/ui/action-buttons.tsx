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
          ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
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

export type ReportButtonProps = Omit<BaseButtonProps, "type">;

export function ReportButton({
  className = "",
  ...rest
}: ReportButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive ${className}`}
    >
      <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );
}

export type EditButtonProps = Omit<BaseButtonProps, "type">;

export function EditButton({ className = "", ...rest }: EditButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      {...rest}
      className={`p-1.5 sm:p-2 rounded-lg transition-colors bg-primary/10 text-primary hover:bg-primary/20 ${className}`}
      title={rest.title ?? t("common.edit")}
    >
      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );
}

