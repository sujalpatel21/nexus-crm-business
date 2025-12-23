import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useMessages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:team_members!messages_sender_id_fkey(*),
          project:projects!messages_project_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });

  const createMessage = useMutation({
    mutationFn: async (message: Omit<Message, 'id' | 'created_at' | 'sender' | 'project' | 'replies'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({ title: 'Message sent' });
    },
    onError: (error) => {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({ title: 'Message deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    createMessage,
    deleteMessage,
  };
}
