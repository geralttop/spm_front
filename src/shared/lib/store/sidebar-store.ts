import { create } from 'zustand';
import { authApi } from '@/shared/api';

interface SidebarState {
  sidebarOrder: string[];
  isLoading: boolean;
  isInitialized: boolean;
  
  loadSidebarOrder: () => Promise<void>;
  setSidebarOrder: (order: string[]) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_ORDER = [
  "feed",
  "favorites",
  "profile",
  "my-comments",
  "search",
  "create-point",
  "settings",
];

export const useSidebarStore = create<SidebarState>((set, get) => ({
  sidebarOrder: DEFAULT_ORDER,
  isLoading: false,
  isInitialized: false,

  loadSidebarOrder: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      const profile = await authApi.getProfile();
      
      if (profile.sidebarOrder && Array.isArray(profile.sidebarOrder) && profile.sidebarOrder.length > 0) {
        const order = profile.sidebarOrder;
        // Убедимся, что "settings" есть в списке
        if (!order.includes("settings")) {
          order.push("settings");
        }
        set({ sidebarOrder: order, isInitialized: true });
      } else {
        set({ sidebarOrder: DEFAULT_ORDER, isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to load sidebar order:', error);
      set({ sidebarOrder: DEFAULT_ORDER, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  setSidebarOrder: async (order: string[]) => {
    // Оптимистичное обновление
    set({ sidebarOrder: order, isLoading: true });
    
    try {
      await authApi.updateSidebarOrder(order);
    } catch (error) {
      console.error('Failed to save sidebar order:', error);
      // Откатываем изменения при ошибке
      await get().loadSidebarOrder();
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetToDefaults: async () => {
    set({ isLoading: true });
    try {
      await authApi.updateSidebarOrder(DEFAULT_ORDER);
      set({ sidebarOrder: DEFAULT_ORDER });
    } catch (error) {
      console.error('Failed to reset sidebar order:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
