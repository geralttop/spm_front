'use client';

import { ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import type { PointHistoryEntry } from '@/shared/api';

interface PointHistoryTimelineProps {
  entries: PointHistoryEntry[];
  isLoading: boolean;
  error?: Error | null;
  canDelete: boolean;
  onDelete?: (historyId: string) => void;
  deletePendingId?: string | null;
}

export function PointHistoryTimeline({
  entries,
  isLoading,
  error,
  canDelete,
  onDelete,
  deletePendingId,
}: PointHistoryTimelineProps) {
  const { t, i18n } = useTranslation();
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

  return (
    <details className="group rounded-xl border border-border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-left font-medium text-text-main touch-target sm:px-4 sm:py-3.5 [&::-webkit-details-marker]:hidden">
        <span>{t('profile.pointHistory.toggle')}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
        {isLoading && (
          <p className="text-sm text-text-muted">{t('profile.pointHistory.loading')}</p>
        )}
        {error && !isLoading && (
          <p className="text-sm text-destructive">{t('profile.pointHistory.error')}</p>
        )}
        {!isLoading && !error && entries.length === 0 && (
          <p className="text-sm text-text-muted">{t('profile.pointHistory.empty')}</p>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <ol className="relative ml-2 space-y-0 border-l border-border pl-4">
            {entries.map((entry) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background ring-2 ring-background"
                  aria-hidden
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap break-words text-sm text-text-main">
                      {entry.description || '—'}
                    </p>

                    {entry.photos?.length > 0 && (
                      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {entry.photos
                          .slice()
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((ph) => (
                            <li
                              key={ph.id}
                              className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30"
                            >
                              <img
                                src={`${apiBase}${ph.url}`}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </li>
                          ))}
                      </ul>
                    )}

                    <time
                      className="mt-2 block text-xs text-text-muted"
                      dateTime={entry.createdAt}
                    >
                      {new Date(entry.createdAt).toLocaleString(i18n.language, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                  </div>

                  {canDelete && onDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 self-start text-destructive hover:text-destructive"
                      disabled={deletePendingId === entry.id}
                      onClick={() => {
                        if (window.confirm(t('profile.pointHistory.confirmDelete'))) {
                          onDelete(entry.id);
                        }
                      }}
                      aria-label={t('profile.pointHistory.deleteAria')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}

