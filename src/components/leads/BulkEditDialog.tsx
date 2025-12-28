import { useState } from 'react';
import { Lead, LeadStatus, LeadSheet, TeamMember } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  sheets: LeadSheet[];
  team: TeamMember[];
  onSubmit: (updates: Partial<Lead>) => void;
}

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export function BulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  sheets,
  team,
  onSubmit,
}: BulkEditDialogProps) {
  const [status, setStatus] = useState<string>('');
  const [sheetId, setSheetId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');

  const handleSubmit = () => {
    const updates: Partial<Lead> = {};
    
    if (status && status !== 'no-change') {
      updates.status = status as LeadStatus;
    }
    if (sheetId && sheetId !== 'no-change') {
      updates.sheet_id = sheetId === 'none' ? null : sheetId;
    }
    if (assignedTo && assignedTo !== 'no-change') {
      updates.assigned_to = assignedTo === 'none' ? null : assignedTo;
    }

    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStatus('');
      setSheetId('');
      setAssignedTo('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {selectedCount} Lead{selectedCount > 1 ? 's' : ''}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Only fields you select will be updated. Leave as "No change" to keep existing values.
          </p>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="no-change">No change</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Move to Sheet</Label>
            <Select value={sheetId} onValueChange={setSheetId}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="no-change">No change</SelectItem>
                <SelectItem value="none">No sheet</SelectItem>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: sheet.color || '#00d4ff' }}
                      />
                      {sheet.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="no-change">No change</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                {team.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-neon text-primary-foreground"
            disabled={!status && !sheetId && !assignedTo}
          >
            Update {selectedCount} Lead{selectedCount > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}