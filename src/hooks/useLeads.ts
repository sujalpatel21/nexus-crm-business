import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const BULK_CHUNK_SIZE = 50;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function useLeads(sheetId?: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const leadsQuery = useQuery({
    queryKey: ['leads', sheetId],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assignee:team_members!leads_assigned_to_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Filter by sheet if sheetId is provided and not null
      if (sheetId !== undefined) {
        if (sheetId === null) {
          // When sheetId is explicitly null, return all leads (no filter)
        } else {
          // Filter by specific sheet
          query = query.eq('sheet_id', sheetId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lead[];
    },
  });

  // Real-time subscription for leads
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createLead = useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'sheet'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating lead', description: error.message, variant: 'destructive' });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating lead', description: error.message, variant: 'destructive' });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting lead', description: error.message, variant: 'destructive' });
    },
  });

  const deleteLeads = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;

      // Avoid URL-length issues by deleting in chunks
      for (const chunk of chunkArray(ids, BULK_CHUNK_SIZE)) {
        const { error } = await supabase
          .from('leads')
          .delete()
          .in('id', chunk);

        if (error) throw error;
      }
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: `${ids.length} leads deleted successfully` });
    },
    onError: (error) => {
      toast({ title: 'Error deleting leads', description: error.message, variant: 'destructive' });
    },
  });

  const updateLeads = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Lead> }) => {
      if (!ids.length) return;

      // Avoid URL-length issues by updating in chunks
      for (const chunk of chunkArray(ids, BULK_CHUNK_SIZE)) {
        const { error } = await supabase
          .from('leads')
          .update(updates)
          .in('id', chunk);

        if (error) throw error;
      }
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: `${ids.length} leads updated successfully` });
    },
    onError: (error) => {
      toast({ title: 'Error updating leads', description: error.message, variant: 'destructive' });
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    },
  });

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    createLead,
    updateLead,
    deleteLead,
    deleteLeads,
    updateLeads,
    updateLeadStatus,
  };
}

// Hook to get all leads for analytics (no sheet filter)
export function useAllLeads() {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assignee:team_members!leads_assigned_to_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('leads-all-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
  };
}
