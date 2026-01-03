-- Create zoom_meeting_days table (one meeting per date)
CREATE TABLE public.zoom_meeting_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_date DATE NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance status enum
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');

-- Create zoom_meeting_attendance table
CREATE TABLE public.zoom_meeting_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_date DATE NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  status public.attendance_status NOT NULL DEFAULT 'absent',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate attendance records for same employee + date
  UNIQUE(meeting_date, employee_id)
);

-- Enable RLS
ALTER TABLE public.zoom_meeting_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_meeting_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zoom_meeting_days
CREATE POLICY "Public access for zoom_meeting_days" 
ON public.zoom_meeting_days 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for zoom_meeting_attendance
CREATE POLICY "Public access for zoom_meeting_attendance" 
ON public.zoom_meeting_attendance 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_zoom_meeting_days_updated_at
BEFORE UPDATE ON public.zoom_meeting_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zoom_meeting_attendance_updated_at
BEFORE UPDATE ON public.zoom_meeting_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_zoom_attendance_date ON public.zoom_meeting_attendance(meeting_date);
CREATE INDEX idx_zoom_attendance_employee ON public.zoom_meeting_attendance(employee_id);
CREATE INDEX idx_zoom_meeting_days_date ON public.zoom_meeting_days(meeting_date);