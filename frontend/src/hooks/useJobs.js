import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

export const useJobs = (filters = {}) =>
    useQuery({
        queryKey: ['jobs', filters],
        queryFn:  () => api.getJobs(filters),
        staleTime: 30_000,
    });

export const useMyJobs = (userId) =>
    useQuery({
        queryKey: ['jobs', 'user', userId],
        queryFn:  () => api.getJobsByUser(userId),
        enabled:  !!userId,
        staleTime: 30_000,
    });

export const useJob = (id) =>
    useQuery({
        queryKey: queryKeys.job(id),
        queryFn:  () => api.getJob(id),
        enabled:  !!id,
        staleTime: 30_000,
    });

export const useUpdateJobStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => api.updateJobStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteJob(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, job }) => api.updateJob(id, job),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (job) => api.createJob(job),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    });
};
