import { useState } from 'react';
import { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Copy, Check } from 'lucide-react';

interface GenerateEmailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateEmailDialog({ lead, open, onOpenChange }: GenerateEmailDialogProps) {
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateEmail = async () => {
    if (!lead) return;
    
    setIsGenerating(true);
    setEmail('');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-email', {
        body: { lead },
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setEmail(data.email);
      toast({ title: 'Email draft generated!' });
    } catch (error: any) {
      console.error('Error generating email:', error);
      toast({
        title: 'Failed to generate email',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setEmail('');
      setCopied(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Generate Follow-up Email for {lead?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded bg-muted capitalize">{lead?.status}</span>
            {lead?.email && <span>• {lead.email}</span>}
            {lead?.city && <span>• {lead.city}</span>}
          </div>

          {!email && (
            <Button 
              onClick={generateEmail} 
              disabled={isGenerating}
              className="w-full bg-gradient-neon text-primary-foreground hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating personalized email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Email Draft
                </>
              )}
            </Button>
          )}

          {email && (
            <div className="space-y-3">
              <Textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[300px] bg-muted/50 font-mono text-sm"
              />
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={generateEmail}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Regenerate
                </Button>
                <Button onClick={copyToClipboard} className="bg-gradient-neon text-primary-foreground">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
