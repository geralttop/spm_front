"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Trash2, Upload } from "lucide-react";
import { useAuthStore } from "@/shared/lib/store";
import { useProfileQuery } from "@/shared/lib/hooks/queries/use-profile-query";
import { useZlataAssetsQuery, useZlataTagsQuery, useUploadZlataAssetMutation, useAttachZlataTagMutation, useDetachZlataTagMutation, useDeleteZlataAssetMutation, useDeleteZlataTagMutation, useCreateZlataTagMutation, } from "@/shared/lib/hooks/queries/use-zlata-queries";
import { zlataImageUrl } from "@/shared/api/zlata";
import { Button, Input, ErrorMessage, Loading } from "@/shared/ui";
export default function ZlataPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const { data: profile, isLoading: profileLoading } = useProfileQuery();
    const [filterDraft, setFilterDraft] = useState("");
    const [appliedTags, setAppliedTags] = useState<string | undefined>(undefined);
    const { data: assets, isLoading, error, refetch } = useZlataAssetsQuery(appliedTags);
    const { data: allTags = [] } = useZlataTagsQuery();
    const uploadMutation = useUploadZlataAssetMutation();
    const attachMutation = useAttachZlataTagMutation();
    const detachMutation = useDetachZlataTagMutation();
    const deleteAssetMutation = useDeleteZlataAssetMutation();
    const deleteTagMutation = useDeleteZlataTagMutation();
    const createTagMutation = useCreateZlataTagMutation();
    const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
    const [newCatalogTag, setNewCatalogTag] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const run = async () => {
            const ok = await checkAuth();
            if (!ok) {
                router.push("/auth");
            }
        };
        void run();
    }, [checkAuth, router]);
    const isAdmin = profile?.role === "admin";
    const applyFilter = () => {
        const v = filterDraft.trim();
        setAppliedTags(v.length ? v : undefined);
    };
    const clearFilter = () => {
        setFilterDraft("");
        setAppliedTags(undefined);
    };
    const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list?.length)
            return;
        const files = Array.from(list);
        uploadMutation.mutate(files, {
            onSettled: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
        });
    };
    const addTagToAsset = (assetId: string) => {
        const name = (tagInputs[assetId] ?? "").trim();
        if (!name)
            return;
        attachMutation.mutate({ assetId, body: { name } }, {
            onSuccess: () => {
                setTagInputs((prev) => ({ ...prev, [assetId]: "" }));
            },
        });
    };
    if (profileLoading) {
        return (<div className="flex min-h-screen items-center justify-center bg-background">
        <Loading />
      </div>);
    }
    if (!profile) {
        return null;
    }
    return (<div className="min-h-screen bg-background text-text-main">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-text-main sm:text-2xl">{t("zlata.title")}</h1>
          <Link href="/profile" className="text-sm text-text-muted underline decoration-border underline-offset-4 hover:text-text-main">
            {t("zlata.backToProfile")}
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 dark:border-border dark:bg-surface">
          <label className="text-sm font-medium text-text-main">{t("zlata.filterLabel")}</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={filterDraft} onChange={(e) => setFilterDraft(e.target.value)} placeholder={t("zlata.filterPlaceholder")} className="sm:max-w-md"/>
            <div className="flex gap-2">
              <Button type="button" variant="default" onClick={applyFilter}>
                {t("zlata.applyFilter")}
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilter}>
                {t("zlata.clearFilter")}
              </Button>
            </div>
          </div>
        </div>

        {isAdmin && (<div className="mb-6 rounded-xl border border-border bg-surface p-4 dark:border-border dark:bg-surface">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={handleUploadChange}/>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button type="button" variant="default" disabled={uploadMutation.isPending} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2">
                <Upload className="h-4 w-4"/>
                {uploadMutation.isPending ? t("zlata.uploading") : t("zlata.upload")}
              </Button>
              <p className="text-sm text-text-muted">{t("zlata.uploadHint")}</p>
            </div>
          </div>)}

        <div className="mb-8 rounded-xl border border-border bg-surface p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-semibold text-text-main">{t("zlata.tagsCatalog")}</h2>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 sm:max-w-xs">
              <Input value={newCatalogTag} onChange={(e) => setNewCatalogTag(e.target.value)} placeholder={t("zlata.addTagPlaceholder")}/>
            </div>
            <Button type="button" variant="secondary" disabled={!newCatalogTag.trim() || createTagMutation.isPending} onClick={() => {
            const n = newCatalogTag.trim();
            if (!n)
                return;
            createTagMutation.mutate(n, {
                onSuccess: () => setNewCatalogTag(""),
            });
        }}>
              {t("zlata.createTag")}
            </Button>
          </div>
          {allTags.length === 0 ? (<p className="text-sm text-text-muted">{t("zlata.tagsEmpty")}</p>) : (<ul className="flex flex-wrap gap-2">
              {allTags.map((tag) => (<li key={tag.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-sm text-text-main dark:border-border dark:bg-background">
                  <span>{tag.name}</span>
                  <button type="button" className="rounded p-0.5 text-text-muted hover:bg-accent hover:text-text-main" aria-label={t("zlata.deleteTag")} onClick={() => deleteTagMutation.mutate(tag.id)} disabled={deleteTagMutation.isPending}>
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </li>))}
            </ul>)}
        </div>

        {error && (<div className="mb-6">
            <ErrorMessage message={t("zlata.loadError")} onRetry={() => refetch()}/>
          </div>)}

        {isLoading ? (<div className="flex justify-center py-12">
            <Loading />
          </div>) : !assets?.length ? (<p className="py-12 text-center text-text-muted">{t("zlata.empty")}</p>) : (<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (<article key={asset.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm dark:border-border dark:bg-surface">
                <div className="relative aspect-square w-full bg-background dark:bg-background">
                  
                  <img src={zlataImageUrl(asset.url)} alt="" className="h-full w-full object-contain"/>
                </div>
                <div className="space-y-3 p-3">
                  {isAdmin && (<Button type="button" variant="secondary" className="w-full text-destructive hover:bg-destructive/10" disabled={deleteAssetMutation.isPending} onClick={() => {
                        if (window.confirm(t("zlata.deleteImage"))) {
                            deleteAssetMutation.mutate(asset.id);
                        }
                    }}>
                      {t("zlata.deleteImage")}
                    </Button>)}
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (<span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-text-main">
                        {tag.name}
                        <button type="button" className="rounded p-0.5 hover:bg-background/50" aria-label={t("zlata.detachTag")} onClick={() => detachMutation.mutate({ assetId: asset.id, tagId: tag.id })} disabled={detachMutation.isPending}>
                          ×
                        </button>
                      </span>))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={tagInputs[asset.id] ?? ""} onChange={(e) => setTagInputs((prev) => ({ ...prev, [asset.id]: e.target.value }))} placeholder={t("zlata.addTagPlaceholder")} className="flex-1 text-sm" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addTagToAsset(asset.id);
                    }
                }}/>
                    <Button type="button" variant="secondary" size="sm" disabled={attachMutation.isPending} onClick={() => addTagToAsset(asset.id)}>
                      {t("zlata.addTag")}
                    </Button>
                  </div>
                </div>
              </article>))}
          </div>)}
      </div>
    </div>);
}
