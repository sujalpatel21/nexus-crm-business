import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ZoomMeetingDay, 
  ZoomMeetingAttendance, 
  AttendanceStatus,
  AttendanceKPIs,
  EmployeeAttendanceSummary,
  DateAttendanceSummary
} from '@/types/attendance';
import { TeamMember } from '@/types/database';

export function useZoomAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all meeting days
  const meetingDaysQuery = useQuery({
    queryKey: ['zoom-meeting-days'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zoom_meeting_days')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      return data as ZoomMeetingDay[];
    },
  });

  // Fetch attendance for a specific date
  const useAttendanceByDate = (date: string | null) => {
    return useQuery({
      queryKey: ['zoom-attendance', date],
      queryFn: async () => {
        if (!date) return [];
        
        const { data, error } = await supabase
          .from('zoom_meeting_attendance')
          .select(`
            *,
            employee:team_members(*)
          `)
          .eq('meeting_date', date);

        if (error) throw error;
        return data as ZoomMeetingAttendance[];
      },
      enabled: !!date,
    });
  };

  // Fetch all attendance records (for KPI calculations)
  const allAttendanceQuery = useQuery({
    queryKey: ['zoom-attendance-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zoom_meeting_attendance')
        .select(`
          *,
          employee:team_members(*)
        `)
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      return data as ZoomMeetingAttendance[];
    },
  });

  // Fetch attendance by employee
  const useAttendanceByEmployee = (employeeId: string | null) => {
    return useQuery({
      queryKey: ['zoom-attendance-employee', employeeId],
      queryFn: async () => {
        if (!employeeId) return [];
        
        const { data, error } = await supabase
          .from('zoom_meeting_attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .order('meeting_date', { ascending: false });

        if (error) throw error;
        return data as ZoomMeetingAttendance[];
      },
      enabled: !!employeeId,
    });
  };

  // Fetch attendance by date range
  const useAttendanceByDateRange = (startDate: string | null, endDate: string | null) => {
    return useQuery({
      queryKey: ['zoom-attendance-range', startDate, endDate],
      queryFn: async () => {
        if (!startDate || !endDate) return [];
        
        const { data, error } = await supabase
          .from('zoom_meeting_attendance')
          .select(`
            *,
            employee:team_members(*)
          `)
          .gte('meeting_date', startDate)
          .lte('meeting_date', endDate)
          .order('meeting_date', { ascending: false });

        if (error) throw error;
        return data as ZoomMeetingAttendance[];
      },
      enabled: !!startDate && !!endDate,
    });
  };

  // Create or get meeting day
  const createMeetingDay = useMutation({
    mutationFn: async (date: string) => {
      // First check if meeting day exists
      const { data: existing } = await supabase
        .from('zoom_meeting_days')
        .select('*')
        .eq('meeting_date', date)
        .maybeSingle();

      if (existing) {
        return existing as ZoomMeetingDay;
      }

      // Create new meeting day
      const { data, error } = await supabase
        .from('zoom_meeting_days')
        .insert([{ meeting_date: date }])
        .select()
        .single();

      if (error) throw error;
      return data as ZoomMeetingDay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zoom-meeting-days'] });
    },
    onError: (error) => {
      toast({ title: 'Error creating meeting day', description: error.message, variant: 'destructive' });
    },
  });

  // Initialize attendance for all employees on a date
  const initializeAttendance = useMutation({
    mutationFn: async ({ date, employees }: { date: string; employees: TeamMember[] }) => {
      // First ensure meeting day exists
      await createMeetingDay.mutateAsync(date);

      // Get existing attendance for this date
      const { data: existingAttendance } = await supabase
        .from('zoom_meeting_attendance')
        .select('employee_id')
        .eq('meeting_date', date);

      const existingEmployeeIds = new Set(existingAttendance?.map(a => a.employee_id) || []);

      // Only create records for employees without attendance
      const newRecords = employees
        .filter(emp => !existingEmployeeIds.has(emp.id))
        .map(emp => ({
          meeting_date: date,
          employee_id: emp.id,
          status: 'absent' as AttendanceStatus,
        }));

      if (newRecords.length > 0) {
        const { error } = await supabase
          .from('zoom_meeting_attendance')
          .insert(newRecords);

        if (error) throw error;
      }

      return true;
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance', date] });
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance-all'] });
    },
    onError: (error) => {
      toast({ title: 'Error initializing attendance', description: error.message, variant: 'destructive' });
    },
  });

  // Update attendance status
  const updateAttendance = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      remarks 
    }: { 
      id: string; 
      status: AttendanceStatus; 
      remarks?: string;
    }) => {
      const { data, error } = await supabase
        .from('zoom_meeting_attendance')
        .update({ status, remarks })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance-all'] });
      toast({ title: 'Attendance updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating attendance', description: error.message, variant: 'destructive' });
    },
  });

  // Bulk update attendance
  const bulkUpdateAttendance = useMutation({
    mutationFn: async (updates: { id: string; status: AttendanceStatus; remarks?: string }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('zoom_meeting_attendance')
          .update({ status: update.status, remarks: update.remarks })
          .eq('id', update.id);

        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance-all'] });
      toast({ title: 'Attendance updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating attendance', description: error.message, variant: 'destructive' });
    },
  });

  // Delete meeting day (and cascade delete attendance)
  const deleteMeetingDay = useMutation({
    mutationFn: async (date: string) => {
      // First delete all attendance for this date
      await supabase
        .from('zoom_meeting_attendance')
        .delete()
        .eq('meeting_date', date);

      // Then delete the meeting day
      const { error } = await supabase
        .from('zoom_meeting_days')
        .delete()
        .eq('meeting_date', date);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zoom-meeting-days'] });
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['zoom-attendance-all'] });
      toast({ title: 'Meeting day deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting meeting day', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate KPIs
  const calculateKPIs = (
    attendance: ZoomMeetingAttendance[],
    totalEmployees: number
  ): AttendanceKPIs => {
    const uniqueDates = new Set(attendance.map(a => a.meeting_date));
    const totalDaysTracked = uniqueDates.size;

    const totalPresent = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalAbsent = attendance.filter(a => a.status === 'absent').length;
    const totalLate = attendance.filter(a => a.status === 'late').length;

    const totalPossibleAttendance = totalEmployees * totalDaysTracked;
    const attendancePercentage = totalPossibleAttendance > 0 
      ? (totalPresent / totalPossibleAttendance) * 100 
      : 0;

    const latePercentage = totalPresent > 0 
      ? (totalLate / totalPresent) * 100 
      : 0;

    return {
      totalDaysTracked,
      totalPresent,
      totalAbsent,
      totalLate,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      latePercentage: Math.round(latePercentage * 100) / 100,
    };
  };

  // Get summary per employee
  const getEmployeeSummaries = (
    attendance: ZoomMeetingAttendance[],
    employees: TeamMember[]
  ): EmployeeAttendanceSummary[] => {
    const uniqueDates = new Set(attendance.map(a => a.meeting_date));
    const totalDays = uniqueDates.size;

    return employees.map(employee => {
      const empAttendance = attendance.filter(a => a.employee_id === employee.id);
      const present = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absent = empAttendance.filter(a => a.status === 'absent').length;
      const late = empAttendance.filter(a => a.status === 'late').length;

      return {
        employee,
        totalPresent: present,
        totalAbsent: absent,
        totalLate: late,
        attendancePercentage: totalDays > 0 ? Math.round((present / totalDays) * 10000) / 100 : 0,
        latePercentage: present > 0 ? Math.round((late / present) * 10000) / 100 : 0,
      };
    });
  };

  // Get summary per date
  const getDateSummaries = (
    attendance: ZoomMeetingAttendance[],
    totalEmployees: number
  ): DateAttendanceSummary[] => {
    const byDate = new Map<string, ZoomMeetingAttendance[]>();
    
    attendance.forEach(a => {
      const existing = byDate.get(a.meeting_date) || [];
      existing.push(a);
      byDate.set(a.meeting_date, existing);
    });

    return Array.from(byDate.entries()).map(([date, records]) => {
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;

      return {
        date,
        totalPresent: present,
        totalAbsent: absent,
        totalLate: late,
        attendancePercentage: totalEmployees > 0 
          ? Math.round((present / totalEmployees) * 10000) / 100 
          : 0,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    meetingDays: meetingDaysQuery.data ?? [],
    allAttendance: allAttendanceQuery.data ?? [],
    isLoading: meetingDaysQuery.isLoading || allAttendanceQuery.isLoading,
    error: meetingDaysQuery.error || allAttendanceQuery.error,
    useAttendanceByDate,
    useAttendanceByEmployee,
    useAttendanceByDateRange,
    createMeetingDay,
    initializeAttendance,
    updateAttendance,
    bulkUpdateAttendance,
    deleteMeetingDay,
    calculateKPIs,
    getEmployeeSummaries,
    getDateSummaries,
  };
}
