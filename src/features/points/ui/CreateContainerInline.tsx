"use client";

import { useTranslation as useI18n } from "react-i18next";
import { Button, Input, Textarea } from "@/shared/ui";
import { Plus } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

interface CreateContainerInlineProps {
  show: boolean;
  onToggle: () => void;
  containerTitle: string;
  onContainerTitleChange: (value: string) => void;
  containerDescription: string;
  onContainerDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  mutation: UseMutationResult<any, any, any, any>;
}

export function CreateContainerInline({
  show,
  onToggle,
  containerTitle,
  onContainerTitleChange,
  containerDescription,
  onContainerDescriptionChange,
  onSubmit,
  onCancel,
  mutation,
}: CreateContainerInlineProps) {
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
          {t("createPoint.createNewContainer")}
        </Button>
      </div>

      {show && (
        <div className="border border-border rounded-lg p-2 bg-muted/50 sm:p-4">
          <h3 className="font-medium text-text-main mb-3">
            {t("createPoint.newContainer")}
          </h3>
          <div className="space-y-3">
            <Input
              type="text"
              value={containerTitle}
              onChange={(e) => onContainerTitleChange(e.target.value)}
              placeholder={t("createPoint.containerTitlePlaceholder")}
              maxLength={100}
              className="text-base sm:text-sm"
            />
            <Textarea
              value={containerDescription}
              onChange={(e) => onContainerDescriptionChange(e.target.value)}
              placeholder={t("createPoint.containerDescriptionPlaceholder")}
              maxLength={500}
              rows={2}
              className="text-base sm:text-sm"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={mutation.isPending || !containerTitle.trim()}
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
