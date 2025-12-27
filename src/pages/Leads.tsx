import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useLeads, useAllLeads } from '@/hooks/useLeads';
import { useLeadSheets } from '@/hooks/useLeadSheets';
import { useTeam } from '@/hooks/useTeam';
import { Lead, LeadStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { SheetTabs } from '@/components/leads/SheetTabs';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadFormDialog, LeadFormData } from '@/components/leads/LeadFormDialog';
import { BulkUploadModal } from '@/components/leads/BulkUploadModal';
import { GenerateEmailDialog } from '@/components/leads/GenerateEmailDialog';
import { LeadViewDialog } from '@/components/leads/LeadViewDialog';

export default function Leads() {
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const { sheets } = useLeadSheets();
  const { leads: allLeads } = useAllLeads();
  const { leads: filteredLeads, isLoading, createLead, updateLead, deleteLead, updateLeadStatus } = useLeads(activeSheetId);
  const { team } = useTeam();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);

  // Calculate lead counts per sheet
  const leadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allLeads.forEach((lead) => {
      if (lead.sheet_id) {
        counts[lead.sheet_id] = (counts[lead.sheet_id] || 0) + 1;
      }
    });
    return counts;
  }, [allLeads]);

  // Leads to display based on active sheet
  const displayLeads = activeSheetId === null ? allLeads : filteredLeads;

  const handleCreate = async (data: LeadFormData) => {
    await createLead.mutateAsync({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      source: data.source || null,
      status: data.status,
      assigned_to: data.assigned_to || null,
      notes: data.notes || null,
      sheet_id: data.sheet_id || null,
    });
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editingLead) return;
    await updateLead.mutateAsync({
      id: editingLead.id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      source: data.source || null,
      status: data.status,
      assigned_to: data.assigned_to || null,
      notes: data.notes || null,
      sheet_id: data.sheet_id || null,
    });
    setEditingLead(null);
  };

  const handleDelete = async (id: string) => {
    await deleteLead.mutateAsync(id);
  };

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateLeadStatus.mutate({ id, status });
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Lead Management"
        subtitle={`${allLeads.length} total leads across ${sheets.length} sheets`}
      />

      {/* Sheet Tabs */}
      <SheetTabs
        activeSheetId={activeSheetId}
        onSheetChange={setActiveSheetId}
        leadCounts={leadCounts}
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {activeSheetId === null
              ? `Viewing all ${allLeads.length} leads`
              : `Viewing ${displayLeads.length} leads in this sheet`}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-neon text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <LeadsTable
          leads={displayLeads}
          isLoading={isLoading}
          sheets={sheets}
          onStatusChange={handleStatusChange}
          onView={setSelectedLead}
          onEdit={setEditingLead}
          onDelete={handleDelete}
          onEmail={setEmailLead}
        />
      </div>

      {/* Create Lead Dialog */}
      <LeadFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        sheets={sheets}
        team={team}
        activeSheetId={activeSheetId}
        onSubmit={handleCreate}
      />

      {/* Edit Lead Dialog */}
      <LeadFormDialog
        open={!!editingLead}
        onOpenChange={() => setEditingLead(null)}
        lead={editingLead}
        sheets={sheets}
        team={team}
        activeSheetId={activeSheetId}
        onSubmit={handleUpdate}
      />

      {/* View Lead Dialog */}
      <LeadViewDialog
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={() => setSelectedLead(null)}
      />

      {/* Generate Email Dialog */}
      <GenerateEmailDialog
        lead={emailLead}
        open={!!emailLead}
        onOpenChange={() => setEmailLead(null)}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        sheets={sheets}
        activeSheetId={activeSheetId}
      />
    </div>
  );
}
