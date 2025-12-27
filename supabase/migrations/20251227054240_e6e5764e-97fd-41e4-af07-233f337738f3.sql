-- Create lead_sheets table
CREATE TABLE public.lead_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#00d4ff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_sheets ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (matching existing pattern)
CREATE POLICY "Public access for lead_sheets" 
ON public.lead_sheets 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add sheet_id to leads table
ALTER TABLE public.leads ADD COLUMN sheet_id UUID REFERENCES public.lead_sheets(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_leads_sheet_id ON public.leads(sheet_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lead_sheets_updated_at
BEFORE UPDATE ON public.lead_sheets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default sheet
INSERT INTO public.lead_sheets (name, description, color) 
VALUES ('All Leads', 'Default lead sheet', '#00d4ff');

-- Enable realtime for lead_sheets
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_sheets;