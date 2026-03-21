"use client";

import { useTranslation as useI18n } from "react-i18next";
import { Button, Input } from "@/shared/ui";
import { Plus } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

interface CreateCategoryInlineProps {
  show: boolean;
  onToggle: () => void;
  categoryName: string;
  onCategoryNameChange: (value: string) => void;
  categoryColor: string;
  onCategoryColorChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  mutation: UseMutationResult<any, any, any, any>;
}

export function CreateCategoryInline({
  show,
  onToggle,
  categoryName,
  onCategoryNameChange,
  categoryColor,
  onCategoryColorChange,
  onSubmit,
  onCancel,
  mutation,
}: CreateCategoryInlineProps) {
  const { t } = useI18n();

  return (
    <>
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={onToggle}
          className="gap-2 w-full touch-target sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("createPoint.createNewCategory")}
        </Button>
      </div>

      {show && (
        <div className="border border-border rounded-lg p-2 bg-muted/50 sm:p-4">
          <h3 className="font-medium text-text-main mb-3">
            {t("createPoint.newCategory")}
          </h3>
          <div className="space-y-3">
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => onCategoryNameChange(e.target.value)}
              placeholder={t("createPoint.categoryNamePlaceholder")}
              maxLength={50}
              className="text-base sm:text-sm"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-text-muted">
                {t("createPoint.color")}
              </label>
              <input
                type="color"
                value={categoryColor}
                onChange={(e) => onCategoryColorChange(e.target.value)}
                className="w-12 h-8 rounded border border-border cursor-pointer"
              />
              <span className="text-sm text-text-muted">{categoryColor}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={mutation.isPending || !categoryName.trim()}
                size="sm"
                className="w-full touch-target sm:w-auto sm:min-h-0"
              >
                {mutation.isPending
                  ? t("createPoint.creating")
                  : t("createPoint.create")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                size="sm"
                className="w-full touch-target sm:w-auto sm:min-h-0"
              >
                {t("createPoint.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
