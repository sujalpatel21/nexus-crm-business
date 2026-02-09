-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status_filter TEXT, -- 'new', 'contacted', 'qualified', 'converted', 'lost', or NULL for all
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_preview TEXT, -- First 200 chars of email body
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default template for new leads
INSERT INTO email_templates (name, subject, body, status_filter, is_default)
VALUES (
  'New Lead Introduction',
  'Exploring AI Business Assistant Solutions for Your Business',
  'Hello {{leadName}},

I am Sujal, and I specialize in building custom AI Business Assistant Platforms tailored to business needs.

I''d love to learn more about what type of AI Business Assistant you''re looking for and how I can help build the perfect solution for your business.

Looking forward to hearing from you!

Best regards,
Sujal',
  'new',
  true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_status_filter ON email_templates(status_filter);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates (all authenticated users can read)
CREATE POLICY "Anyone can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert email templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for email_logs (all authenticated users can read/write)
CREATE POLICY "Anyone can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (true);
