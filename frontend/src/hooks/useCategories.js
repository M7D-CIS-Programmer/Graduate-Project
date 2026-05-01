import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

// ── Public: all categories (global seed + all company departments) ─────────────
export const useCategories = () =>
    useQuery({
        queryKey: queryKeys.categories,
        queryFn:  api.getCategories,
        staleTime: Infinity,
    });

// ── Employer: only this company's departments ─────────────────────────────────
export const useMyCategories = () =>
    useQuery({
        queryKey: queryKeys.myCategories,
        queryFn:  api.getMyCategories,
        staleTime: 30_000,
    });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name) => api.createCategory(name),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myCategories }),
    });
};

export const useUpdateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }) => api.updateCategory(id, name),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myCategories }),
    });
};

export const useDeleteCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteCategory(id),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myCategories }),
    });
};
