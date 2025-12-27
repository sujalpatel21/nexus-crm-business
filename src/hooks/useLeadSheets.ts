import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadSheet } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function useLeadSheets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sheetsQuery = useQuery({
    queryKey: ['lead-sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_sheets')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as LeadSheet[];
    },
  });

  // Real-time subscription for lead sheets
  useEffect(() => {
    const channel = supabase
      .channel('lead-sheets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_sheets',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lead-sheets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createSheet = useMutation({
    mutationFn: async (sheet: Omit<LeadSheet, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lead_sheets')
        .insert([sheet])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sheets'] });
      toast({ title: 'Sheet created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating sheet', description: error.message, variant: 'destructive' });
    },
  });

  const updateSheet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadSheet> & { id: string }) => {
      const { data, error } = await supabase
        .from('lead_sheets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sheets'] });
      toast({ title: 'Sheet updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating sheet', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSheet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_sheets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Sheet deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting sheet', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sheets: sheetsQuery.data ?? [],
    isLoading: sheetsQuery.isLoading,
    error: sheetsQuery.error,
    createSheet,
    updateSheet,
    deleteSheet,
  };
}
