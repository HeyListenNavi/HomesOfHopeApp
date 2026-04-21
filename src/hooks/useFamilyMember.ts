import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyMemberService } from '@/services/services'; 
import { FamilyMember } from '@/types/api';

export const useCreateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newMember: Partial<FamilyMember>) =>
            familyMemberService.create(newMember),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['family', variables.family_profile_id] });
            queryClient.invalidateQueries({ queryKey: ['family-members', variables.family_profile_id] });
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FamilyMember> }) =>
            familyMemberService.update(id, data),
        onSuccess: (updatedMember) => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['family', updatedMember.family_profile_id] });
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => familyMemberService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
};