import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    status_filter: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export function useEmailTemplates(statusFilter?: string) {
    return useQuery({
        queryKey: ['email-templates', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('email_templates')
                .select('*')
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (statusFilter) {
                query = query.or(`status_filter.eq.${statusFilter},status_filter.is.null`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as EmailTemplate[];
        },
    });
}

export function useCreateEmailTemplate() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('email_templates')
                .insert(template)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            toast({ title: 'Template created successfully' });
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to create template',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
