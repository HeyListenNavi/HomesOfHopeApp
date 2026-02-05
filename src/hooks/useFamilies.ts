import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { familyService } from '@/services/services';
import { FamilyProfile } from '@/types/api';

export const useFamilyList = (params: Record<string, any>) => {
    return useInfiniteQuery({
        queryKey: ['families', 'infinite', params],

        queryFn: ({ pageParam = 1 }) => familyService.getAll(pageParam, params),
        
        initialPageParam: 1,
        
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
    });
};

export const useFamily = (id: number) => {
    return useQuery({
        queryKey: ['family', id],

        queryFn: () => familyService.getById(id),

        enabled: !!id,
    });
};

export const useCreateFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newFamily: Partial<FamilyProfile>) => familyService.create(newFamily),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
};