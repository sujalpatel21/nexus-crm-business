import { useState, useEffect } from 'react';
import { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSendEmail, useBulkSendEmail } from '@/hooks/useSendEmail';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { Mail, Loader2, Send } from 'lucide-react';

interface SendEmailDialogProps {
    lead: Lead | null;
    leads?: Lead[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SendEmailDialog({ lead, leads, open, onOpenChange }: SendEmailDialogProps) {
    const isBulk = !!leads && leads.length > 0;
    const targetLeads = isBulk ? leads : lead ? [lead] : [];

    const { data: templates } = useEmailTemplates(lead?.status);
    const sendEmail = useSendEmail();
    const bulkSendEmail = useBulkSendEmail();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    // Load default template on open
    useEffect(() => {
        if (open && templates && templates.length > 0) {
            const defaultTemplate = templates.find((t) => t.is_default) || templates[0];
            setSelectedTemplateId(defaultTemplate.id);
            setSubject(defaultTemplate.subject);
            setBody(defaultTemplate.body);
        }
    }, [open, templates]);

    // Update email content when template changes
    useEffect(() => {
        if (selectedTemplateId && templates) {
            const template = templates.find((t) => t.id === selectedTemplateId);
            if (template) {
                setSubject(template.subject);
                setBody(template.body);
            }
        }
    }, [selectedTemplateId, templates]);

    const handleSend = async () => {
        if (isBulk && leads) {
            await bulkSendEmail.mutateAsync({
                leads,
                templateId: selectedTemplateId,
                customSubject: subject,
                customBody: body,
            });
        } else if (lead) {
            await sendEmail.mutateAsync({
                lead,
                templateId: selectedTemplateId,
                customSubject: subject,
                customBody: body,
            });
        }
        onOpenChange(false);
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setSelectedTemplateId('');
            setSubject('');
            setBody('');
        }
        onOpenChange(open);
    };

    const isSending = sendEmail.isPending || bulkSendEmail.isPending;
    const leadsWithoutEmail = targetLeads.filter((l) => !l.email);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border-border max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        {isBulk ? `Send Email to ${leads?.length} Leads` : `Send Email to ${lead?.name}`}
                    </DialogTitle>
                    <DialogDescription>
                        {isBulk
                            ? `Compose and send emails to ${leads?.length} selected lead${leads?.length > 1 ? 's' : ''}`
                            : `Compose and send an email to ${lead?.name} (${lead?.email})`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {leadsWithoutEmail.length > 0 && (
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
                            <strong>Warning:</strong> {leadsWithoutEmail.length} lead{leadsWithoutEmail.length > 1 ? 's' : ''} without email addresses will be skipped.
                        </div>
                    )}

                    {/* Template Selection */}
                    {templates && templates.length > 0 && (
                        <div className="space-y-2">
                            <Label>Email Template</Label>
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger className="bg-muted/50 border-border">
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name} {template.is_default && '(Default)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject"
                            className="bg-muted/50 border-border"
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Email body"
                            className="min-h-[300px] bg-muted/50 border-border font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Use {'{'}{'{'}}leadName{'}'}{'}'}  for personalization
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={isSending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={isSending || !subject || !body}
                            className="bg-gradient-neon text-primary-foreground hover:opacity-90"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email{isBulk && 's'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
