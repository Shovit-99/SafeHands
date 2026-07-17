import api from './axios';
import type { Message } from '../types';

// ─── Build Chat ID (mirrors backend logic) ────────────────────────────────────
// Deterministic, order-independent: sort both IDs alphabetically then join.
export const buildChatId = (userAId: string, userBId: string): string =>
  [userAId, userBId].sort().join('_');

// ─── Chat History Response ────────────────────────────────────────────────────
export interface ChatHistoryResponse {
  success: boolean;
  data: Message[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ─── Fetch Chat History ───────────────────────────────────────────────────────
export const fetchChatHistory = async (
  chatId: string,
  page = 1,
  limit = 50
): Promise<Message[]> => {
  const { data } = await api.get<ChatHistoryResponse>(
    `/messages/${chatId}`,
    { params: { page, limit } }
  );
  return data.data;
};
