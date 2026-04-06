import { apiClient } from "./client";

export interface ChatPeer {
  id: number;
  username: string;
  avatar: string | null;
  role: string;
  createdPointsCount: number;
}

export interface ChatListItem {
  conversationId: number;
  peer: ChatPeer;
  lastMessage: {
    id: number;
    body: string;
    senderId: number;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface ChatMessageDto {
  id: number;
  senderId: number;
  body: string;
  createdAt: string;
}

export interface ChatMessagesPage {
  messages: ChatMessageDto[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface SendMessageResult {
  conversationId: number;
  message: ChatMessageDto;
}

export interface ChatConversationMeta {
  conversationId: number;
  peer: ChatPeer;
}

export const chatsApi = {
  list: async (): Promise<ChatListItem[]> => {
    const { data } = await apiClient.get<ChatListItem[]>("/chats");
    return data;
  },

  unreadCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>("/chats/unread-count");
    return data;
  },

  conversationMeta: async (conversationId: number): Promise<ChatConversationMeta> => {
    const { data } = await apiClient.get<ChatConversationMeta>(
      `/chats/${conversationId}/meta`,
    );
    return data;
  },

  byPeer: async (peerUserId: number): Promise<{ conversationId: number | null }> => {
    const { data } = await apiClient.get<{ conversationId: number | null }>(
      `/chats/peer/${peerUserId}`,
    );
    return data;
  },

  messages: async (
    conversationId: number,
    before?: number,
  ): Promise<ChatMessagesPage> => {
    const { data } = await apiClient.get<ChatMessagesPage>(
      `/chats/${conversationId}/messages`,
      { params: before ? { before } : {} },
    );
    return data;
  },

  markRead: async (conversationId: number): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.patch<{ ok: boolean }>(
      `/chats/${conversationId}/read`,
    );
    return data;
  },

  send: async (peerUserId: number, text: string): Promise<SendMessageResult> => {
    const { data } = await apiClient.post<SendMessageResult>("/chats/messages", {
      peerUserId,
      text,
    });
    return data;
  },
};
