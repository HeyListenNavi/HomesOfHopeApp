import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/services';

interface UploadParams {
    formData: FormData;
    documentable: string; 
    id: number;
}

export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ formData }: UploadParams) => documentService.upload(formData),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [variables.documentable] });
            queryClient.invalidateQueries({ queryKey: [variables.documentable, variables.id] });
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => documentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['family'] });
        },
    });
};