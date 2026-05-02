import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { queryKeys } from './queryKeys';

// ── Public: all departments (global seed + all company departments) ─────────────
export const useDepartments = () =>
    useQuery({
        queryKey: queryKeys.departments,
        queryFn:  api.getDepartments,
        staleTime: Infinity,
    });

// ── Employer: only this company's departments ─────────────────────────────────
export const useMyDepartments = () =>
    useQuery({
        queryKey: queryKeys.myDepartments,
        queryFn:  api.getMyDepartments,
        staleTime: 30_000,
    });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateDepartment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name) => api.createDepartment(name),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myDepartments }),
    });
};

export const useUpdateDepartment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }) => api.updateDepartment(id, name),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myDepartments }),
    });
};

export const useDeleteDepartment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteDepartment(id),
        onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.myDepartments }),
    });
};
