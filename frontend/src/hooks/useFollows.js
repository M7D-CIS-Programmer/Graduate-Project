import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const useFollowedCompanies = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['followedCompanies', user?.id],
        queryFn: () => api.getFollowedCompanies(user.id),
        enabled: !!user?.id && user?.role === 'Job Seeker',
    });
};

export const useFollowCompany = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (companyId) => api.followCompany(user.id, companyId),
        onSuccess: (_, companyId) => {
            queryClient.invalidateQueries({ queryKey: ['followedCompanies', user?.id] });
            // Refresh the company profile so its follower count updates immediately
            queryClient.invalidateQueries({ queryKey: ['company', String(companyId)] });
            addToast(t('companyFollowed') || 'Company followed successfully', 'success');
        },
        onError: (error) => {
            addToast(error.message || t('actionFailed'), 'error');
        }
    });
};

export const useUnfollowCompany = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (companyId) => api.unfollowCompany(user.id, companyId),
        onSuccess: (_, companyId) => {
            queryClient.invalidateQueries({ queryKey: ['followedCompanies', user?.id] });
            // Refresh the company profile so its follower count updates immediately
            queryClient.invalidateQueries({ queryKey: ['company', String(companyId)] });
            addToast(t('companyUnfollowed') || 'Company unfollowed successfully', 'success');
        },
        onError: (error) => {
            addToast(error.message || t('actionFailed'), 'error');
        }
    });
};

export const useCompanyFollowers = (companyId) => {
    return useQuery({
        queryKey: ['company-followers', companyId],
        queryFn: () => api.getCompanyFollowers(companyId),
        enabled: !!companyId,
    });
};
