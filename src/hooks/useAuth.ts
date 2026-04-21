import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { User } from '@/types/api';

export const useCurrentUser = (enabled = true) => {
    return useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await api.get<User>('/user');
            return response.data;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
