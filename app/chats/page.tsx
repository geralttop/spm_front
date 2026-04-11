"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import { getApiUrl } from "@/shared/lib/utils/api-url";
import { userAvatarSrc } from "@/shared/lib/user-avatar-url";
import { Button, Loading } from "@/shared/ui";
import { UserBadges } from "@/shared/ui/user-badges";
import { useAuthStore } from "@/shared/lib/store";
import { useChatWebSocket } from "@/shared/lib/hooks";
import { chatsQueryKeys, useChatsListQuery, } from "@/shared/lib/hooks/queries/use-chats-queries";
function ChatsPageInner() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkAuth = useAuthStore((s) => s.checkAuth);
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();
    const [authReady, setAuthReady] = useState(false);
    const { data: list, isLoading, error, refetch } = useChatsListQuery(authReady);
    const onChatSocket = useCallback((event: string, _data: unknown) => {
        if (event !== "message:new")
            return;
        void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.list });
        void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.unread });
    }, [queryClient]);
    useChatWebSocket(authReady ? accessToken : null, onChatSocket);
    useEffect(() => {
        void (async () => {
            const ok = await checkAuth();
            if (!ok) {
                router.replace("/auth");
                return;
            }
            setAuthReady(true);
        })();
    }, [checkAuth, router]);
    useEffect(() => {
        if (!authReady)
            return;
        const withParam = searchParams.get("with");
        if (!withParam)
            return;
        const id = parseInt(withParam, 10);
        if (Number.isFinite(id) && id > 0) {
            router.replace(`/chats/compose?with=${id}`);
        }
    }, [authReady, searchParams, router]);
    if (!authReady) {
        return <Loading />;
    }
    if (error) {
        return (<div className="mx-auto w-full max-w-3xl py-8 text-center text-text-muted md:max-w-4xl xl:max-w-5xl">
        <p>{t("chats.loadError")}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
      </div>);
    }
    const apiBase = getApiUrl();
    return (<div className="mx-auto w-full min-w-0 max-w-3xl flex-1 pb-8 md:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
      <h1 className="mb-4 text-xl font-semibold text-text-main sm:text-2xl">
        {t("chats.title")}
      </h1>

      {isLoading ? (<Loading />) : !list?.length ? (<p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-text-muted">
          {t("chats.noConversations")}
        </p>) : (<ul className="min-w-0 space-y-2">
          {list.map((item) => {
                const avatarUrl = userAvatarSrc(item.peer.avatar, apiBase);
                return (<li key={item.conversationId} className="min-w-0">
              <Link href={`/chats/${item.conversationId}`} className="flex min-w-0 w-full max-w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent">
                <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {avatarUrl ? (<img src={avatarUrl} alt="" className="h-full w-full object-cover"/>) : (<div className="flex h-full w-full items-center justify-center">
                      <User className="h-6 w-6 text-text-muted" aria-hidden/>
                    </div>)}
                  {item.unreadCount > 0 ? (<span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-card" aria-label={t("chats.unreadBadge")}/>) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1 truncate font-medium text-text-main">
                      <span className="truncate">{item.peer.username}</span>
                      <UserBadges role={item.peer.role} createdPointsCount={item.peer.createdPointsCount} className="shrink-0"/>
                    </span>
                    {item.unreadCount > 0 ? (<span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                        {item.unreadCount > 99 ? "99+" : item.unreadCount}
                      </span>) : null}
                  </div>
                  {item.lastMessage ? (<p className="mt-0.5 min-w-0 break-words text-sm text-text-muted line-clamp-1">
                      {item.lastMessage.body}
                    </p>) : null}
                </div>
              </Link>
            </li>);
            })}
        </ul>)}
    </div>);
}
export default function ChatsPage() {
    return (<Suspense fallback={<Loading />}>
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <ChatsPageInner />
      </div>
    </Suspense>);
}
