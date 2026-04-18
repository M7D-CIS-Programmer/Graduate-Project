import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

export const useUsers = () =>
    useQuery({
        queryKey: queryKeys.users,
        queryFn:  api.getUsers,
        staleTime: 30_000,
    });

export const useUser = (id) =>
    useQuery({
        queryKey: queryKeys.user(id),
        queryFn:  () => api.getUser(id),
        enabled:  !!id,
        staleTime: 30_000,
    });

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => api.updateUserStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    });
};
