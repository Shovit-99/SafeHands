import api from './axios';
import type {
  Item,
  ItemsResponse,
  ItemFilters,
  ItemCategory,
  ItemStatus,
} from '../types';

// ─── Fetch All Items (filtered + paginated) ───────────────────────────────────
export const fetchItems = async (
  filters: ItemFilters = {}
): Promise<ItemsResponse> => {
  const params: Record<string, string | number> = {};
  if (filters.q) params.q = filters.q;
  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 12;

  const { data } = await api.get<ItemsResponse>('/items', { params });
  return data;
};

// ─── Fetch Single Item ────────────────────────────────────────────────────────
export const fetchItemById = async (id: string): Promise<Item> => {
  const { data } = await api.get<{ success: boolean; item: Item }>(
    `/items/${id}`
  );
  return data.item;
};

// ─── Create Item (multipart/form-data) ───────────────────────────────────────
export interface CreateItemPayload {
  title: string;
  description: string;
  category: ItemCategory;
  status: ItemStatus;
  locationName: string;
  coordinates: { lat: number; lng: number };
  images?: File[];
}

export const createItem = async (
  payload: CreateItemPayload
): Promise<Item> => {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('description', payload.description);
  form.append('category', payload.category);
  form.append('status', payload.status);
  form.append('locationName', payload.locationName);
  form.append('coordinates', JSON.stringify(payload.coordinates));
  if (payload.images) {
    payload.images.forEach((file) => form.append('images', file));
  }

  const { data } = await api.post<{ success: boolean; item: Item }>(
    '/items',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.item;
};

// ─── Update Item ──────────────────────────────────────────────────────────────
export interface UpdateItemPayload {
  title?: string;
  description?: string;
  category?: ItemCategory;
  status?: ItemStatus;
  locationName?: string;
}

export const updateItem = async (
  id: string,
  payload: UpdateItemPayload
): Promise<Item> => {
  const { data } = await api.patch<{ success: boolean; item: Item }>(
    `/items/${id}`,
    payload
  );
  return data.item;
};

// ─── Delete Item (admin only) ─────────────────────────────────────────────────
export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};

// ─── Fetch Items by Reporter ──────────────────────────────────────────────────
export const fetchMyItems = async (): Promise<Item[]> => {
  // Backend filters by authenticated user's ID via reporterId
  // We use a large limit to fetch all personal items
  const { data } = await api.get<ItemsResponse>('/items/mine');
  return data.data;
};
