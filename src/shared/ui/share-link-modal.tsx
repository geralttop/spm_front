"use client";

import { useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { copyTextToClipboard, getPublicUrl } from "@/shared/lib/share-url";
import { cn } from "@/shared/lib/utils";

export type ShareLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
};

export function ShareLinkModal({ isOpen, onClose, url }: ShareLinkModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = useCallback(async () => {
    setCopyError(false);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      return;
    }
    setCopyError(true);
  }, [url]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("share.title")}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="break-all text-xs text-text-main sm:text-sm">{url}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => void handleCopy()}
        >
          <Copy className="size-4 shrink-0" aria-hidden />
          {copied ? t("share.copied") : t("share.copy")}
        </Button>

        {copyError ? (
          <p className="text-center text-xs text-destructive" role="alert">
            {t("share.copyFailed")}
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-text-muted">{t("share.qrHint")}</p>
          <div
            className="rounded-lg border border-border bg-white p-3 shadow-sm"
            aria-hidden
          >
            <QRCodeSVG
              value={url}
              size={200}
              level="M"
              marginSize={2}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export type ShareLinkButtonProps = {
  /** Путь приложения с ведущим слэшем, например `/points/id` или из userProfilePath */
  path: string;
  className?: string;
  /** Подпись кнопки (title и aria-label); иначе — общие ключи share.openTitle / share.openLabel */
  buttonTitle?: string;
};

export function ShareLinkButton({
  path,
  className,
  buttonTitle,
}: ShareLinkButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [modalKey, setModalKey] = useState(0);

  const handleOpen = () => {
    setUrl(getPublicUrl(path));
    setModalKey((k) => k + 1);
    setOpen(true);
  };

  const label = buttonTitle ?? t("share.openLabel");
  const titleAttr = buttonTitle ?? t("share.openTitle");

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "p-1.5 sm:p-2 rounded-lg transition-colors bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        title={titleAttr}
        aria-label={label}
      >
        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
      </button>
      <ShareLinkModal
        key={modalKey}
        isOpen={open}
        onClose={() => setOpen(false)}
        url={url}
      />
    </>
  );
}
