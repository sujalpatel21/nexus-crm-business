import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { useLeads, useAllLeads } from '@/hooks/useLeads';
import { useLeadSheets } from '@/hooks/useLeadSheets';
import { useTeam } from '@/hooks/useTeam';
import { Lead, LeadStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Trash2, Edit, X } from 'lucide-react';
import { SheetTabs } from '@/components/leads/SheetTabs';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadFormDialog, LeadFormData } from '@/components/leads/LeadFormDialog';
import { BulkUploadModal } from '@/components/leads/BulkUploadModal';
import { GenerateEmailDialog } from '@/components/leads/GenerateEmailDialog';
import { LeadViewDialog } from '@/components/leads/LeadViewDialog';
import { BulkEditDialog } from '@/components/leads/BulkEditDialog';

export default function Leads() {
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const { sheets } = useLeadSheets();
  const { leads: allLeads } = useAllLeads();
  const { leads: filteredLeads, isLoading, createLead, updateLead, deleteLead, deleteLeads, updateLeads, updateLeadStatus } = useLeads(activeSheetId);
  const { team } = useTeam();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteLeads.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkEdit = async (updates: Partial<Lead>) => {
    if (selectedIds.length === 0) return;
    await updateLeads.mutateAsync({ ids: selectedIds, updates });
    setSelectedIds([]);
    setIsBulkEditOpen(false);
  };

  const clearSelection = () => {
    setSelectedIds([]);
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
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in-up">
            <span className="text-sm font-medium">
              {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkEditOpen(true)}
              className="border-primary/30"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

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
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        selectedCount={selectedIds.length}
        sheets={sheets}
        team={team}
        onSubmit={handleBulkEdit}
      />
    </div>
  );
}
