import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { taskService } from "@/services/services";
import { Task } from "@/types/api";

export const useTaskList = (params: Record<string, any> = {}) => {
    return useInfiniteQuery({
        queryKey: ['tasks', 'infinite', params],
        queryFn: ({ pageParam = 1 }) => taskService.getAll(pageParam, params),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newTask: Partial<Task>) => taskService.create(newTask),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            if (variables.visit_id) {
                queryClient.invalidateQueries({ queryKey: ['visit', variables.visit_id] });
            }
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
            taskService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visit"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};
