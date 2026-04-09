"use client";
import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { chatsApi } from "@/shared/api";
import { userProfilePath } from "@/shared/lib/user-profile-path";
import { userAvatarSrc } from "@/shared/lib/user-avatar-url";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { Button, Loading } from "@/shared/ui";
import { UserBadges } from "@/shared/ui/user-badges";
import { ConversationComposer } from "../_components/conversation-composer";
import { useAuthStore } from "@/shared/lib/store";
import { useChatWebSocket, useProfileQuery, } from "@/shared/lib/hooks";
import { chatsQueryKeys, mergeChatMessagePages, useChatConversationMetaQuery, useChatMessagesInfiniteQuery, useSendChatMessageMutation, } from "@/shared/lib/hooks/queries/use-chats-queries";
export default function ChatConversationPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const raw = params.conversationId;
    const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
    const conversationId = parseInt(segment, 10);
    const checkAuth = useAuthStore((s) => s.checkAuth);
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { data: profile } = useProfileQuery();
    const currentUserId = profile ? Number(profile.userId) : null;
    const enabled = Number.isFinite(conversationId) && conversationId > 0;
    const metaQuery = useChatConversationMetaQuery(enabled ? conversationId : undefined, Boolean(currentUserId));
    const messagesQuery = useChatMessagesInfiniteQuery(enabled ? conversationId : undefined, Boolean(currentUserId));
    const sendMutation = useSendChatMessageMutation();
    const pages = messagesQuery.data?.pages ?? [];
    const messages = mergeChatMessagePages(pages);
    const onWs = useCallback((event: string, data: unknown) => {
        if (event !== "message:new" || !data || typeof data !== "object")
            return;
        const d = data as {
            conversationId?: number;
            message?: {
                senderId?: number;
            };
        };
        if (d.conversationId !== conversationId)
            return;
        void (async () => {
            const fromPeer = currentUserId != null &&
                d.message != null &&
                typeof d.message.senderId === "number" &&
                d.message.senderId !== currentUserId;
            if (fromPeer) {
                try {
                    await chatsApi.markRead(conversationId);
                }
                catch {
                }
            }
            await queryClient.invalidateQueries({
                queryKey: chatsQueryKeys.messages(conversationId),
            });
            await queryClient.invalidateQueries({ queryKey: chatsQueryKeys.list });
            await queryClient.invalidateQueries({ queryKey: chatsQueryKeys.unread });
        })();
    }, [conversationId, currentUserId, queryClient]);
    useChatWebSocket(accessToken, onWs);
    useEffect(() => {
        void (async () => {
            const ok = await checkAuth();
            if (!ok)
                router.replace("/auth");
        })();
    }, [checkAuth, router]);
    useEffect(() => {
        if (!enabled || !currentUserId)
            return;
        let cancelled = false;
        void chatsApi.markRead(conversationId).then(() => {
            if (!cancelled) {
                void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.list });
                void queryClient.invalidateQueries({ queryKey: chatsQueryKeys.unread });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [conversationId, currentUserId, enabled, queryClient]);
    useEffect(() => {
        if (messagesQuery.isLoading)
            return;
        const el = scrollRef.current;
        if (!el)
            return;
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }, [messages.length, messagesQuery.isLoading, conversationId]);
    if (!enabled) {
        return (<div className="w-full py-8 text-center text-text-muted">
        {t("common.error")}
      </div>);
    }
    if (metaQuery.isLoading || !currentUserId) {
        return <Loading />;
    }
    if (metaQuery.isError || !metaQuery.data) {
        return (<div className="mx-auto w-full max-w-3xl py-8 text-center md:max-w-4xl xl:max-w-5xl">
        <p className="text-text-muted">{t("chats.loadError")}</p>
        <Link href="/chats" className="mt-4 inline-block text-primary underline">
          {t("chats.backToList")}
        </Link>
      </div>);
    }
    const { peer } = metaQuery.data;
    const avatarUrl = userAvatarSrc(peer.avatar);
    const handleSend = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed)
            return;
        sendMutation.mutate({ peerUserId: peer.id, text: trimmed });
    };
    return (<div className="mx-auto flex h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] w-full min-h-0 max-w-3xl flex-col overflow-hidden sm:h-[calc(100dvh-7rem)] sm:max-h-[calc(100dvh-7rem)] md:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-0 py-3">
        <Link href="/chats" className="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent hover:text-text-main" aria-label={t("chats.backToList")}>
          <ArrowLeft className="h-5 w-5"/>
        </Link>
        <Link href={userProfilePath(peer.username)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t("search.viewProfile")}>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:h-11 sm:w-11">
            {avatarUrl ? (<img src={avatarUrl} alt="" className="h-full w-full object-cover"/>) : (<div className="flex h-full w-full items-center justify-center">
                <User className="h-5 w-5 text-text-muted sm:h-6 sm:w-6" aria-hidden/>
              </div>)}
          </div>
          <span className="flex min-w-0 items-center gap-1.5 truncate text-base font-semibold text-text-main sm:text-lg">
            <span className="truncate">{peer.username}</span>
            <UserBadges role={peer.role} createdPointsCount={peer.createdPointsCount} className="shrink-0"/>
          </span>
        </Link>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
        {messagesQuery.hasNextPage ? (<div className="flex justify-center pb-2">
            <Button type="button" variant="outline" size="sm" disabled={messagesQuery.isFetchingNextPage} onClick={() => messagesQuery.fetchNextPage()}>
              {messagesQuery.isFetchingNextPage ? (<Loader2 className="h-4 w-4 animate-spin" aria-hidden/>) : (t("chats.loadOlder"))}
            </Button>
          </div>) : null}

        {messagesQuery.isLoading ? (<Loading />) : (messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (<div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[min(92%,36rem)] rounded-2xl px-3 py-2 text-sm sm:max-w-[min(78%,40rem)] md:max-w-[min(72%,44rem)] lg:text-base ${mine
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-text-main"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <time className={`mt-1 block text-[10px] opacity-70 ${mine ? "text-right" : ""}`} dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </div>
              </div>);
        }))}
      </div>

      <footer className="shrink-0 border-t border-border bg-background pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-4">
        <ConversationComposer onSendMessage={handleSend} sending={sendMutation.isPending} placeholder={t("chats.placeholder")} sendAriaLabel={t("chats.send")}/>
      </footer>
    </div>);
}
