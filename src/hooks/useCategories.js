import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

export const useCategories = () =>
    useQuery({
        queryKey: queryKeys.categories,
        queryFn:  api.getCategories,
        staleTime: Infinity, // categories rarely change
    });
