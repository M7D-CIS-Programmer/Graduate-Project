import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

export const useApplications = () =>
    useQuery({
        queryKey: queryKeys.applications,
        queryFn:  api.getApplications,
        staleTime: 30_000,
    });

export const useApplyForJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.applyForJob(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications }),
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => api.updateApplicationStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications }),
    });
};
