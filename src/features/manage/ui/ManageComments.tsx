"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { commentsApi, type Comment } from "@/shared/api";
import { Button, Loading } from "@/shared/ui";
import { Pencil, Trash2, MapPin, X, Check } from "lucide-react";

export function ManageComments() {
  const { t } = useTranslation();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await commentsApi.getMyComments();
        if (!cancelled) {
          setComments(data);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedComments = useMemo(() => comments, [comments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const goToPoint = (pointId: string) => {
    router.push(`/points/${pointId}`);
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (comment: Comment) => {
    if (!editContent.trim()) return;
    try {
      const updated = await commentsApi.update(comment.pointId, comment.id, {
        content: editContent,
      });
      setComments((prev) => prev.map((c) => (c.id === comment.id ? updated : c)));
      cancelEdit();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const deleteComment = async (comment: Comment) => {
    if (!confirm(t("comments.confirmDelete"))) return;
    try {
      await commentsApi.delete(comment.pointId, comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg sm:text-xl font-semibold text-text-main">
          {t("myComments.title")}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">{t("myComments.subtitle")}</p>
      </div>

      {sortedComments.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-6">
          <p className="text-sm text-text-muted">{t("myComments.noComments")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedComments.map((comment) => {
            const isEditing = editingId === comment.id;
            return (
              <div
                key={comment.id}
                className="rounded-lg border border-border bg-card p-3 sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <button
                      onClick={() => goToPoint(comment.pointId)}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-text-main hover:text-primary transition-colors"
                      type="button"
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {comment.point?.name || t("myComments.unknownPoint")}
                      </span>
                    </button>
                  </div>

                  <div className="text-xs text-text-muted shrink-0">
                    <span>{formatDate(comment.createdAt)}</span>
                    {comment.createdAt !== comment.updatedAt ? (
                      <span> ({t("comments.edited")})</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[84px]"
                        rows={3}
                      />
                      <div className="flex flex-col gap-2 xs:flex-row xs:items-center">
                        <Button
                          onClick={() => saveEdit(comment)}
                          size="sm"
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          {t("comments.save")}
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          {t("comments.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm sm:text-base text-text-main whitespace-pre-wrap wrap-break-word">
                        {comment.content}
                      </p>
                      <div className="flex flex-col gap-2 xs:flex-row xs:items-center">
                        <Button
                          onClick={() => startEdit(comment)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("comments.edit")}
                        </Button>
                        <Button
                          onClick={() => deleteComment(comment)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("comments.delete")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

