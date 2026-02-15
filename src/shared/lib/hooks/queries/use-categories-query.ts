import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type Category, type CreateCategoryRequest } from '@/shared/api';

export const useCategoriesQuery = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(['categories'], (old) => 
        old ? [...old, newCategory] : [newCategory]
      );
    },
  });
};
