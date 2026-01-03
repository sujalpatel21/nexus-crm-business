import { TeamMember } from './database';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface ZoomMeetingDay {
  id: string;
  meeting_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ZoomMeetingAttendance {
  id: string;
  meeting_date: string;
  employee_id: string;
  status: AttendanceStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
  employee?: TeamMember;
}

export interface AttendanceKPIs {
  totalDaysTracked: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
  latePercentage: number;
}

export interface EmployeeAttendanceSummary {
  employee: TeamMember;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
  latePercentage: number;
}

export interface DateAttendanceSummary {
  date: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
}
