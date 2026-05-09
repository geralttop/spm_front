import { apiClient } from './client';

export type MyStatsResponse = {
  pointsCreated: number;
  commentsCreated: number;
  favoritesCount: number;
  categoriesCreated: number;
  containersCreated: number;
};

export const statsApi = {
  getMyStats: async (): Promise<MyStatsResponse> => {
    const response = await apiClient.get('/users/me/stats');
    return response.data;
  },
};

