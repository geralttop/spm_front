"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User } from "lucide-react";
import { Loading } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { authApi, chatsApi } from "@/shared/api";
import type { SearchUserResult } from "@/shared/api";
import { userProfilePath } from "@/shared/lib/user-profile-path";
import { userAvatarSrc } from "@/shared/lib/user-avatar-url";
import { useProfileQuery } from "@/shared/lib/hooks";
import { useSendChatMessageMutation } from "@/shared/lib/hooks/queries/use-chats-queries";
import { ConversationComposer } from "../_components/conversation-composer";
import { UserBadges } from "@/shared/ui/user-badges";

function ChatComposeInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const withParam = searchParams.get("with");
  const peerId = withParam ? parseInt(withParam, 10) : NaN;
  const validPeer = Number.isFinite(peerId) && peerId > 0;

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [authReady, setAuthReady] = useState(false);
  const [peer, setPeer] = useState<SearchUserResult | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [checking, setChecking] = useState(true);

  const { data: profile } = useProfileQuery();
  const currentUserId = profile ? Number(profile.userId) : null;
  const sendMutation = useSendChatMessageMutation();

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
    if (!authReady || !validPeer) {
      setChecking(false);
      return;
    }
    if (currentUserId != null && peerId === currentUserId) {
      router.replace("/chats");
      return;
    }
    let cancelled = false;
    setChecking(true);
    setLoadError(false);
    void (async () => {
      try {
        const { conversationId } = await chatsApi.byPeer(peerId);
        if (cancelled) return;
        if (conversationId !== null) {
          router.replace(`/chats/${conversationId}`);
          return;
        }
        const user = await authApi.getUserById(peerId);
        if (!cancelled) {
          setPeer(user);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setPeer(null);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, validPeer, peerId, currentUserId, router]);

  const handleSend = useCallback(
    (text: string) => {
      if (!validPeer) return;
      sendMutation.mutate(
        { peerUserId: peerId, text },
        {
          onSuccess: (data) => {
            router.replace(`/chats/${data.conversationId}`);
          },
        },
      );
    },
    [validPeer, peerId, sendMutation, router],
  );

  if (!authReady) {
    return <Loading />;
  }

  if (!validPeer) {
    return (
      <div className="mx-auto w-full max-w-3xl py-8 text-center text-text-muted md:max-w-4xl">
        <p>{t("common.error")}</p>
        <Link href="/chats" className="mt-4 inline-block text-primary underline">
          {t("chats.backToList")}
        </Link>
      </div>
    );
  }

  if (checking || !currentUserId) {
    return <Loading />;
  }

  if (loadError || !peer) {
    return (
      <div className="mx-auto w-full max-w-3xl py-8 text-center md:max-w-4xl">
        <p className="text-text-muted">{t("profile.userNotFound")}</p>
        <Link href="/chats" className="mt-4 inline-block text-primary underline">
          {t("chats.backToList")}
        </Link>
      </div>
    );
  }

  const avatarUrl = userAvatarSrc(peer.avatar);

  return (
    <div className="mx-auto flex h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] w-full min-h-0 max-w-3xl flex-col overflow-hidden sm:h-[calc(100dvh-7rem)] sm:max-h-[calc(100dvh-7rem)] md:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-0 py-3">
        <Link
          href="/chats"
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent hover:text-text-main"
          aria-label={t("chats.backToList")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link
          href={userProfilePath(peer.username)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("search.viewProfile")}
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:h-11 sm:w-11">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-5 w-5 text-text-muted sm:h-6 sm:w-6" aria-hidden />
              </div>
            )}
          </div>
          <span className="flex min-w-0 items-center gap-1.5 truncate text-base font-semibold text-text-main sm:text-lg">
            <span className="truncate">{peer.username}</span>
            <UserBadges
              role={peer.role}
              createdPointsCount={peer.createdPointsCount}
              className="shrink-0"
            />
          </span>
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
        <div className="m-auto flex max-w-md flex-col items-center justify-center px-4 py-8 text-center">
          <p className="text-sm text-text-muted sm:text-base">
            {t("chats.emptyThreadHint")}
          </p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-background pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-4">
        <ConversationComposer
          onSendMessage={handleSend}
          sending={sendMutation.isPending}
          placeholder={t("chats.placeholder")}
          sendAriaLabel={t("chats.send")}
        />
      </footer>
    </div>
  );
}

export default function ChatComposePage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <ChatComposeInner />
      </div>
    </Suspense>
  );
}
