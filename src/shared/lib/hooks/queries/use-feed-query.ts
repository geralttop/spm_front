import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "@/shared/api";

export function useFeedQuery(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) => feedApi.getFeed(pageParam, limit),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
