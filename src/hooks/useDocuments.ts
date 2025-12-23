import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useDocuments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          project:projects!documents_project_id_fkey(*),
          uploader:team_members!documents_uploaded_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (doc: Omit<Document, 'id' | 'created_at' | 'project' | 'uploader'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert([doc])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document uploaded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error uploading document', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting document', description: error.message, variant: 'destructive' });
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    createDocument,
    deleteDocument,
  };
}
