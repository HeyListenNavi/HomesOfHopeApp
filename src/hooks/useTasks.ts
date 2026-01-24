import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/services";
import { Task } from "@/types/api";

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
            taskService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visit"] });
        },
    });
};
