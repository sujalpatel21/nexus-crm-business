import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/database';
import { cn } from '@/lib/utils';
import { User, Mail, Phone, MapPin, FileText, Calendar, Tag } from 'lucide-react';

interface LeadViewDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadViewDialog({ lead, open, onOpenChange }: LeadViewDialogProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-bold">
              {lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="text-lg">{lead.name}</div>
              <Badge className={cn('text-xs mt-1', `status-${lead.status}`)}>
                {lead.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            {lead.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.city && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{lead.city}</span>
              </div>
            )}
            {lead.source && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span>Source: {lead.source}</span>
              </div>
            )}
            {lead.assignee && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Assigned to: {lead.assignee.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {lead.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="w-4 h-4" />
                Notes
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap">
                {lead.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
