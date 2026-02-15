import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containersApi, type Container, type CreateContainerRequest } from '@/shared/api';

export const useContainersQuery = () => {
  return useQuery<Container[]>({
    queryKey: ['containers'],
    queryFn: () => containersApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateContainerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateContainerRequest) => containersApi.create(data),
    onSuccess: (newContainer) => {
      queryClient.setQueryData<Container[]>(['containers'], (old) => 
        old ? [...old, newContainer] : [newContainer]
      );
    },
  });
};
