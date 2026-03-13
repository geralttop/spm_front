import { create } from 'zustand';
import { authApi } from '@/shared/api';

interface SidebarState {
  sidebarOrder: string[];
  isLoading: boolean;
  isInitialized: boolean;
  
  loadSidebarOrder: (profileData?: { sidebarOrder?: string[] }) => Promise<void>;
  setSidebarOrder: (order: string[]) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_ORDER = [
  "feed",
  "map",
  "favorites",
  "profile",
  "my-comments",
  "search",
  "create-point",
  "manage",
  "settings",
];

export const useSidebarStore = create<SidebarState>((set, get) => ({
  sidebarOrder: DEFAULT_ORDER,
  isLoading: false,
  isInitialized: false,

  loadSidebarOrder: async (profileData?: { sidebarOrder?: string[] }) => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      // Если данные профиля переданы, используем их
      let sidebarOrderData = profileData?.sidebarOrder;
      
      // Если данные не переданы, запрашиваем их (fallback)
      if (!sidebarOrderData) {
        const profile = await authApi.getProfile();
        sidebarOrderData = profile.sidebarOrder;
      }
      
      if (sidebarOrderData && Array.isArray(sidebarOrderData) && sidebarOrderData.length > 0) {
        let order = [...sidebarOrderData];
        
        // Добавляем новые пункты, которых нет в сохраненном порядке
        const newItems = DEFAULT_ORDER.filter(item => !order.includes(item));
        order = [...order, ...newItems];
        
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
