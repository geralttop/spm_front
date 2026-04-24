import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { chatsApi, type ChatMessageDto } from "@/shared/api/chats";

export const chatsQueryKeys = {
  list: ["chats", "list"] as const,
  unread: ["chats", "unread-count"] as const,
  messages: (conversationId: number) => ["chats", conversationId, "messages"] as const,
  meta: (conversationId: number) => ["chats", conversationId, "meta"] as const,
};

export function useChatsListQuery(enabled: boolean) {
  return useQuery({
    queryKey: chatsQueryKeys.list,
    queryFn: () => chatsApi.list(),
    enabled,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useChatUnreadCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: chatsQueryKeys.unread,
    queryFn: () => chatsApi.unreadCount(),
    enabled,
    staleTime: 15_000,
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? 25_000
        : false,
  });
}

export function useChatConversationMetaQuery(
  conversationId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: chatsQueryKeys.meta(conversationId ?? 0),
    queryFn: () => chatsApi.conversationMeta(conversationId!),
    enabled: Boolean(conversationId) && enabled,
    staleTime: 60_000,
  });
}

export function useChatMessagesInfiniteQuery(
  conversationId: number | undefined,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: chatsQueryKeys.messages(conversationId ?? 0),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      chatsApi.messages(conversationId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor != null
        ? lastPage.nextCursor
        : undefined,
    enabled: Boolean(conversationId) && enabled,
    staleTime: 10_000,
    refetchOnMount: "always",
  });
}

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ peerUserId, text }: { peerUserId: number; text: string }) =>
      chatsApi.send(peerUserId, text),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: chatsQueryKeys.unread });
      queryClient.invalidateQueries({
        queryKey: chatsQueryKeys.messages(data.conversationId),
      });
    },
  });
}

export function useMarkChatReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => chatsApi.markRead(conversationId),
    onSuccess: (_d, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: chatsQueryKeys.unread });
      queryClient.invalidateQueries({
        queryKey: chatsQueryKeys.messages(conversationId),
      });
    },
  });
}

export function mergeChatMessagePages(
  pages: { messages: ChatMessageDto[] }[],
): ChatMessageDto[] {
  return pages.reduceRight<ChatMessageDto[]>(
    (acc, p) => [...p.messages, ...acc],
    [],
  );
}
