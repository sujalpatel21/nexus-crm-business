import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/database';

interface SendEmailParams {
    lead: Lead;
    templateId?: string;
    customSubject?: string;
    customBody?: string;
}

interface BulkSendEmailParams {
    leads: Lead[];
    templateId?: string;
    customSubject?: string;
    customBody?: string;
}

export function useSendEmail() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ lead, templateId, customSubject, customBody }: SendEmailParams) => {
            if (!lead.email) {
                throw new Error('Lead does not have an email address');
            }

            // Call the Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('send-email-gmail', {
                body: {
                    leadId: lead.id,
                    leadName: lead.name,
                    leadEmail: lead.email,
                    templateId,
                    customSubject,
                    customBody,
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Log the email send
            const { error: logError } = await supabase.from('email_logs').insert({
                lead_id: lead.id,
                template_id: templateId || null,
                recipient_email: lead.email,
                subject: customSubject || data.subject || 'Email sent',
                body_preview: (customBody || '').substring(0, 200),
                status: 'sent',
                sent_at: new Date().toISOString(),
            });

            if (logError) console.error('Failed to log email:', logError);

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['email-logs'] });
            toast({
                title: 'Email sent successfully!',
                description: `Email sent to ${variables.lead.name}`,
            });
        },
        onError: (error: Error, variables) => {
            // Log failed attempt
            supabase.from('email_logs').insert({
                lead_id: variables.lead.id,
                template_id: variables.templateId || null,
                recipient_email: variables.lead.email || '',
                subject: variables.customSubject || 'Email failed',
                body_preview: (variables.customBody || '').substring(0, 200),
                status: 'failed',
                error_message: error.message,
            });

            toast({
                title: 'Failed to send email',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

export function useBulkSendEmail() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ leads, templateId, customSubject, customBody }: BulkSendEmailParams) => {
            const results = [];
            const errors = [];

            for (const lead of leads) {
                if (!lead.email) {
                    errors.push({ lead: lead.name, error: 'No email address' });
                    continue;
                }

                try {
                    const { data, error } = await supabase.functions.invoke('send-email-gmail', {
                        body: {
                            leadId: lead.id,
                            leadName: lead.name,
                            leadEmail: lead.email,
                            templateId,
                            customSubject,
                            customBody,
                        },
                    });

                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);

                    // Log successful send
                    await supabase.from('email_logs').insert({
                        lead_id: lead.id,
                        template_id: templateId || null,
                        recipient_email: lead.email,
                        subject: customSubject || 'Bulk email sent',
                        body_preview: (customBody || '').substring(0, 200),
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                    });

                    results.push({ lead: lead.name, success: true });
                } catch (error: any) {
                    // Log failed attempt
                    await supabase.from('email_logs').insert({
                        lead_id: lead.id,
                        template_id: templateId || null,
                        recipient_email: lead.email,
                        subject: customSubject || 'Bulk email failed',
                        body_preview: (customBody || '').substring(0, 200),
                        status: 'failed',
                        error_message: error.message,
                    });

                    errors.push({ lead: lead.name, error: error.message });
                }
            }

            return { results, errors };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['email-logs'] });
            const successCount = data.results.length;
            const errorCount = data.errors.length;

            if (errorCount === 0) {
                toast({
                    title: 'All emails sent successfully!',
                    description: `${successCount} email${successCount > 1 ? 's' : ''} sent`,
                });
            } else {
                toast({
                    title: 'Bulk email completed with errors',
                    description: `${successCount} sent, ${errorCount} failed`,
                    variant: 'destructive',
                });
            }
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to send bulk emails',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
