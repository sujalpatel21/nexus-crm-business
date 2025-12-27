import { useState } from 'react';
import { Plus, MoreHorizontal, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { LeadSheet } from '@/types/database';
import { useLeadSheets } from '@/hooks/useLeadSheets';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SheetTabsProps {
  activeSheetId: string | null;
  onSheetChange: (sheetId: string | null) => void;
  leadCounts: Record<string, number>;
}

const SHEET_COLORS = [
  '#00d4ff', // cyan
  '#a855f7', // purple
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#3b82f6', // blue
];

export function SheetTabs({ activeSheetId, onSheetChange, leadCounts }: SheetTabsProps) {
  const { sheets, createSheet, updateSheet, deleteSheet } = useLeadSheets();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<LeadSheet | null>(null);
  const [deleteConfirmSheet, setDeleteConfirmSheet] = useState<LeadSheet | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: SHEET_COLORS[0] });

  const totalLeads = Object.values(leadCounts).reduce((sum, count) => sum + count, 0);

  const handleCreate = async () => {
    await createSheet.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({ name: '', description: '', color: SHEET_COLORS[0] });
  };

  const handleUpdate = async () => {
    if (!editingSheet) return;
    await updateSheet.mutateAsync({ id: editingSheet.id, ...formData });
    setEditingSheet(null);
    setFormData({ name: '', description: '', color: SHEET_COLORS[0] });
  };

  const handleDelete = async () => {
    if (!deleteConfirmSheet) return;
    await deleteSheet.mutateAsync(deleteConfirmSheet.id);
    if (activeSheetId === deleteConfirmSheet.id) {
      onSheetChange(null);
    }
    setDeleteConfirmSheet(null);
  };

  const openEdit = (sheet: LeadSheet) => {
    setEditingSheet(sheet);
    setFormData({ name: sheet.name, description: sheet.description || '', color: sheet.color });
  };

  return (
    <>
      <div className="border-b border-border bg-muted/20">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-2">
            {/* All Leads Tab */}
            <button
              onClick={() => onSheetChange(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeSheetId === null
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <FileSpreadsheet className="w-4 h-4" />
              All Leads
              <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs">
                {totalLeads}
              </span>
            </button>

            {/* Sheet Tabs */}
            {sheets.map((sheet) => (
              <div key={sheet.id} className="relative group flex items-center">
                <button
                  onClick={() => onSheetChange(sheet.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    activeSheetId === sheet.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sheet.color }}
                  />
                  {sheet.name}
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-background/20 text-xs">
                    {leadCounts[sheet.id] || 0}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => openEdit(sheet)} className="cursor-pointer">
                      <Edit2 className="w-4 h-4 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirmSheet(sheet)}
                      className="cursor-pointer text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Add Sheet Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Sheet
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Create Sheet Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Sheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sheet Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 Campaign, Website Leads"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this sheet"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {SHEET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      formData.color === color && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name}
              className="bg-gradient-neon text-primary-foreground"
            >
              Create Sheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet Dialog */}
      <Dialog open={!!editingSheet} onOpenChange={() => setEditingSheet(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Sheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sheet Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {SHEET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      formData.color === color && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSheet(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name}
              className="bg-gradient-neon text-primary-foreground"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmSheet} onOpenChange={() => setDeleteConfirmSheet(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sheet "{deleteConfirmSheet?.name}" and all {leadCounts[deleteConfirmSheet?.id || ''] || 0} leads within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
