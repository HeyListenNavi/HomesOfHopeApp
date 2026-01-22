import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { visitService } from '@/services/services';
import { Visit } from '@/types/api';

export const useVisitList = (search = '') => {
    return useInfiniteQuery({
        queryKey: ['visits', 'infinite', search],

        queryFn: ({ pageParam = 1 }) => visitService.getAll(pageParam, search),
        
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined; 
        },
    });
};

export const useVisit = (id: number) => {
    return useQuery({
        queryKey: ['visit', id],

        queryFn: () => visitService.getById(id),

        enabled: !!id,
    });
};

export const useCreateVisit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newVisit: Partial<Visit>) => visitService.create(newVisit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
        },
    });
};