import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

export const useConversations = (userId) =>
    useQuery({
        queryKey: ['conversations', userId],
        queryFn: () => api.getConversations(userId),
        enabled: !!userId,
        refetchInterval: 10000,
    });

export const useMessages = (applicationId, userId) =>
    useQuery({
        queryKey: ['messages', applicationId],
        queryFn: () => api.getMessages(applicationId, userId),
        enabled: !!applicationId && !!userId,
        refetchInterval: 5000,
    });

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ applicationId, senderId, content }) =>
            api.sendMessage(applicationId, senderId, content),
        onSuccess: (_, { applicationId, senderId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', applicationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations', senderId] });
        },
    });
};

export const useMarkMessagesRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ applicationId, userId }) =>
            api.markMessagesRead(applicationId, userId),
        onSuccess: (_, { applicationId, userId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', applicationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        },
    });
};
