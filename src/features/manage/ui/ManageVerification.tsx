"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Textarea, Loading } from "@/shared/ui";
import { useProfileQuery } from "@/shared/lib/hooks";
import { verificationApi, type VerificationRequest } from "@/shared/api";

type FormState = {
  reason: string;
  links: string;
};

export function ManageVerification() {
  const { t } = useTranslation();
  const { data: profile } = useProfileQuery();
  const isVerified = Boolean(profile?.isVerified);

  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState<VerificationRequest | null>(null);
  const [form, setForm] = useState<FormState>({ reason: "", links: "" });
  const [submitting, setSubmitting] = useState(false);

  const statusText = useMemo(() => {
    if (isVerified) return t("manage.verification.verified");
    if (!req) return t("manage.verification.notVerified");
    if (req.status === "pending") return t("manage.verification.pending");
    if (req.status === "approved") return t("manage.verification.approved");
    return t("manage.verification.rejected");
  }, [isVerified, req, t]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await verificationApi.getMy();
        if (!cancelled) {
          setReq(data);
          setForm({
            reason: data?.reason ?? "",
            links: data?.links ?? "",
          });
        }
      } catch (e) {
        console.error("Failed to load verification request", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = !isVerified && form.reason.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const data = await verificationApi.request({
        reason: form.reason.trim(),
        links: form.links.trim() || undefined,
      });
      setReq(data);
    } catch (e) {
      console.error("Failed to submit verification request", e);
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async () => {
    try {
      setSubmitting(true);
      await verificationApi.revokeMy();
      setReq(null);
    } catch (e) {
      console.error("Failed to revoke verification request", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-text-main">
          {t("manage.verification.title")}
        </h3>
        <p className="text-sm text-text-muted mt-1">{statusText}</p>
        {req?.status === "rejected" && req.adminNote ? (
          <p className="text-sm text-text-muted mt-1">{req.adminNote}</p>
        ) : null}
      </div>

      {isVerified ? null : (
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">
              {t("manage.verification.reasonLabel")}
            </label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              rows={4}
              className="text-base touch-target min-h-[110px]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">
              {t("manage.verification.linksLabel")}
            </label>
            <Input
              value={form.links}
              onChange={(e) => setForm((p) => ({ ...p, links: e.target.value }))}
              placeholder={t("manage.verification.linksPlaceholder")}
              className="text-base touch-target"
            />
          </div>

          <div className="flex flex-col xs:flex-row gap-2">
            <Button
              onClick={submit}
              disabled={!canSubmit || submitting}
              className="gap-2"
            >
              {req?.status === "pending"
                ? t("manage.verification.update")
                : t("manage.verification.submit")}
            </Button>

            {req?.status === "pending" ? (
              <Button
                variant="outline"
                onClick={revoke}
                disabled={submitting}
                className="gap-2"
              >
                {t("manage.verification.revoke")}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

