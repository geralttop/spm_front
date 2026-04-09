import { useQuery } from '@tanstack/react-query';
import { authApi, type SearchUserResult } from '@/shared/api';
export const useSearchUsersQuery = (query: string, enabled: boolean = true) => {
    return useQuery<SearchUserResult[]>({
        queryKey: ['users', 'search', query],
        queryFn: () => authApi.searchUsers(query),
        enabled: enabled && query.trim().length > 0,
        staleTime: 30000,
    });
};
