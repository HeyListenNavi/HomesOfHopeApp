import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyMemberService } from '@/services/services'; 
import { FamilyMember } from '@/types/api';

export const useCreateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMember: Partial<FamilyMember>) => familyMemberService.create(newMember),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['family', variables.family_profile_id] });
            queryClient.invalidateQueries({ queryKey: ['family-members', variables.family_profile_id] });
        },
    });
};