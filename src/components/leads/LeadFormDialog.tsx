import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead, LeadStatus, LeadSheet, TeamMember } from '@/types/database';

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  sheets: LeadSheet[];
  team: TeamMember[];
  activeSheetId: string | null;
  onSubmit: (data: LeadFormData) => void;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  status: LeadStatus;
  assigned_to: string;
  notes: string;
  sheet_id: string;
}

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  sheets,
  team,
  activeSheetId,
  onSubmit,
}: LeadFormDialogProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    source: '',
    status: 'new',
    assigned_to: '',
    notes: '',
    sheet_id: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        city: lead.city || '',
        source: lead.source || '',
        status: lead.status,
        assigned_to: lead.assigned_to || '',
        notes: lead.notes || '',
        sheet_id: lead.sheet_id || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        source: '',
        status: 'new',
        assigned_to: '',
        notes: '',
        sheet_id: activeSheetId || '',
      });
    }
  }, [lead, activeSheetId, open]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  const isEdit = !!lead;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? 'Edit Lead' : 'Create New Lead'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Sheet Selection */}
          <div className="space-y-2">
            <Label>Sheet</Label>
            <Select
              value={formData.sheet_id || '__none__'}
              onValueChange={(v) => setFormData({ ...formData, sheet_id: v === '__none__' ? '' : v })}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select sheet (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="__none__">No Sheet</SelectItem>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sheet.color }}
                      />
                      {sheet.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select
              value={formData.assigned_to || '__none__'}
              onValueChange={(v) => setFormData({ ...formData, assigned_to: v === '__none__' ? '' : v })}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="__none__">Unassigned</SelectItem>
                {team.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-muted/50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="bg-gradient-neon text-primary-foreground"
          >
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
