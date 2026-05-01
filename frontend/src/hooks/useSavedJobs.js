import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

const QUERY_KEY = ['savedJobs'];

export const useSavedJobs = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn:  api.getSavedJobs,
        enabled:  !!user,
        staleTime: 30_000,
    });
};

export const useSaveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => api.saveJob(jobId),
        onSuccess:  () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    });
};

export const useUnsaveJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedJobId) => api.unsaveJob(savedJobId),
        onSuccess:  () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    });
};

export const useCheckSavedJob = (jobId) =>
    useQuery({
        queryKey: [...QUERY_KEY, 'check', jobId],
        queryFn:  () => api.checkSavedJob(jobId),
        enabled:  !!jobId,
        staleTime: 30_000,
    });
