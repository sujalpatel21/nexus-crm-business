import { useState, useMemo } from "react";
import { format, getDaysInMonth, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, CalendarDays, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { AttendanceStatus, ZoomMeetingAttendance } from "@/types/attendance";
import { TeamMember } from "@/types/database";
import { useZoomAttendance } from "@/hooks/useZoomAttendance";

interface MonthlyAttendanceViewProps {
  employees: TeamMember[];
  isLoading: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const statusCellColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500/30 text-green-400",
  absent: "bg-red-500/30 text-red-400",
  late: "bg-yellow-500/30 text-yellow-400",
};

const statusLetters: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  late: "L",
};

interface MonthlyEmployeeSummary {
  employee: TeamMember;
  attendance: Map<number, AttendanceStatus>; // day -> status
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
}

interface MonthlyKPIs {
  totalMeetingDays: number;
  overallAttendancePercentage: number;
  overallLatePercentage: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export function MonthlyAttendanceView({ employees, isLoading: teamLoading }: MonthlyAttendanceViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { useAttendanceByDateRange, meetingDays } = useZoomAttendance();

  // Calculate date range for selected month
  const dateRange = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const start = format(startOfMonth(date), "yyyy-MM-dd");
    const end = format(endOfMonth(date), "yyyy-MM-dd");
    return { start, end };
  }, [selectedMonth, selectedYear]);

  const { data: monthAttendance, isLoading: attendanceLoading } = useAttendanceByDateRange(
    dateRange.start,
    dateRange.end
  );

  const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth, 1));

  // Get meeting days within the selected month
  const meetingDaysInMonth = useMemo(() => {
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = endOfMonth(monthStart);
    
    return new Set(
      meetingDays
        .filter(d => {
          const date = new Date(d.meeting_date);
          return date >= monthStart && date <= monthEnd;
        })
        .map(d => new Date(d.meeting_date).getDate())
    );
  }, [meetingDays, selectedMonth, selectedYear]);

  // Calculate employee summaries with attendance matrix
  const employeeSummaries: MonthlyEmployeeSummary[] = useMemo(() => {
    if (!monthAttendance) return [];

    return employees.map(employee => {
      const empAttendance = monthAttendance.filter(a => a.employee_id === employee.id);
      const attendanceMap = new Map<number, AttendanceStatus>();

      // Populate attendance map
      empAttendance.forEach(a => {
        const day = new Date(a.meeting_date).getDate();
        attendanceMap.set(day, a.status);
      });

      // For days with meetings but no record, treat as absent
      meetingDaysInMonth.forEach(day => {
        if (!attendanceMap.has(day)) {
          attendanceMap.set(day, 'absent');
        }
      });

      const present = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absent = meetingDaysInMonth.size - present; // Total meeting days minus present
      const late = empAttendance.filter(a => a.status === 'late').length;

      return {
        employee,
        attendance: attendanceMap,
        totalPresent: present,
        totalAbsent: absent,
        totalLate: late,
        attendancePercentage: meetingDaysInMonth.size > 0 
          ? Math.round((present / meetingDaysInMonth.size) * 10000) / 100 
          : 0,
      };
    });
  }, [monthAttendance, employees, meetingDaysInMonth]);

  // Calculate monthly KPIs
  const monthlyKPIs: MonthlyKPIs = useMemo(() => {
    const totalMeetingDays = meetingDaysInMonth.size;
    const totalEmployees = employees.length;
    const totalPossible = totalMeetingDays * totalEmployees;

    const totals = employeeSummaries.reduce(
      (acc, s) => ({
        present: acc.present + s.totalPresent,
        absent: acc.absent + s.totalAbsent,
        late: acc.late + s.totalLate,
      }),
      { present: 0, absent: 0, late: 0 }
    );

    return {
      totalMeetingDays,
      overallAttendancePercentage: totalPossible > 0 
        ? Math.round((totals.present / totalPossible) * 10000) / 100 
        : 0,
      overallLatePercentage: totals.present > 0 
        ? Math.round((totals.late / totals.present) * 10000) / 100 
        : 0,
      totalPresent: totals.present,
      totalAbsent: totals.absent,
      totalLate: totals.late,
    };
  }, [employeeSummaries, meetingDaysInMonth.size, employees.length]);

  const isLoading = teamLoading || attendanceLoading;

  return (
    <div className="space-y-4">
      {/* Month/Year Selector */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Select Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Monthly KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meeting Days
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyKPIs.totalMeetingDays}</div>
            <p className="text-xs text-muted-foreground">Days with meetings in {MONTHS[selectedMonth]}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {monthlyKPIs.overallAttendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyKPIs.totalPresent} present / {monthlyKPIs.totalAbsent} absent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Late Arrivals
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{monthlyKPIs.totalLate}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyKPIs.overallLatePercentage}% of present
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employees
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Matrix */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>{MONTHS[selectedMonth]} {selectedYear} - Attendance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : meetingDaysInMonth.size === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No meetings recorded for {MONTHS[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10 min-w-[150px]">Employee</TableHead>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <TableHead 
                          key={day} 
                          className={`text-center w-10 px-1 ${
                            meetingDaysInMonth.has(day) ? '' : 'text-muted-foreground/30'
                          }`}
                        >
                          {day}
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-card sticky right-[180px] z-10">P</TableHead>
                      <TableHead className="text-center bg-card sticky right-[135px] z-10">A</TableHead>
                      <TableHead className="text-center bg-card sticky right-[90px] z-10">L</TableHead>
                      <TableHead className="text-center bg-card sticky right-0 z-10 min-w-[80px]">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSummaries.map((summary) => (
                      <TableRow key={summary.employee.id}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">
                          {summary.employee.name}
                        </TableCell>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const status = summary.attendance.get(day);
                          const hasMeeting = meetingDaysInMonth.has(day);
                          
                          return (
                            <TableCell 
                              key={day} 
                              className={`text-center p-1 ${
                                hasMeeting && status 
                                  ? statusCellColors[status] 
                                  : hasMeeting 
                                    ? 'bg-muted/20' 
                                    : ''
                              }`}
                            >
                              {hasMeeting && status ? (
                                <span className="text-xs font-medium">{statusLetters[status]}</span>
                              ) : (
                                <span className="text-muted-foreground/20">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center text-green-400 sticky right-[180px] bg-card z-10 font-medium">
                          {summary.totalPresent}
                        </TableCell>
                        <TableCell className="text-center text-red-400 sticky right-[135px] bg-card z-10 font-medium">
                          {summary.totalAbsent}
                        </TableCell>
                        <TableCell className="text-center text-yellow-400 sticky right-[90px] bg-card z-10 font-medium">
                          {summary.totalLate}
                        </TableCell>
                        <TableCell className="text-center sticky right-0 bg-card z-10">
                          <Badge
                            variant="outline"
                            className={
                              summary.attendancePercentage >= 80
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : summary.attendancePercentage >= 60
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {summary.attendancePercentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-green-500/30 flex items-center justify-center text-green-400 text-xs font-medium">P</div>
              <span className="text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-red-400 text-xs font-medium">A</div>
              <span className="text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-yellow-500/30 flex items-center justify-center text-yellow-400 text-xs font-medium">L</div>
              <span className="text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded bg-muted/20 flex items-center justify-center text-muted-foreground/20 text-xs">-</div>
              <span className="text-muted-foreground">No Meeting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
