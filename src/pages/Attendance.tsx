import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Header } from "@/components/layout/Header";
import { useZoomAttendance } from "@/hooks/useZoomAttendance";
import { useTeam } from "@/hooks/useTeam";
import { AttendanceStatus } from "@/types/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MonthlyAttendanceView } from "@/components/attendance/MonthlyAttendanceView";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500/20 text-green-400 border-green-500/30",
  absent: "bg-red-500/20 text-red-400 border-red-500/30",
  late: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const statusIcons: Record<AttendanceStatus, React.ReactNode> = {
  present: <CheckCircle2 className="h-4 w-4" />,
  absent: <XCircle className="h-4 w-4" />,
  late: <AlertCircle className="h-4 w-4" />,
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("daily");

  const { team, isLoading: teamLoading } = useTeam();
  const {
    meetingDays,
    allAttendance,
    isLoading: attendanceLoading,
    useAttendanceByDate,
    initializeAttendance,
    updateAttendance,
    calculateKPIs,
    getEmployeeSummaries,
    getDateSummaries,
  } = useZoomAttendance();

  const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const { data: dateAttendance, isLoading: dateAttendanceLoading } = useAttendanceByDate(dateString);

  const activeEmployees = useMemo(() => team.filter((m) => m.utilization >= 0), [team]);

  const kpis = useMemo(
    () => calculateKPIs(allAttendance, activeEmployees.length),
    [allAttendance, activeEmployees.length, calculateKPIs]
  );

  const employeeSummaries = useMemo(
    () => getEmployeeSummaries(allAttendance, activeEmployees),
    [allAttendance, activeEmployees, getEmployeeSummaries]
  );

  const dateSummaries = useMemo(
    () => getDateSummaries(allAttendance, activeEmployees.length),
    [allAttendance, activeEmployees.length, getDateSummaries]
  );

  const meetingDates = useMemo(
    () => new Set(meetingDays.map((d) => d.meeting_date)),
    [meetingDays]
  );

  const handleInitializeDay = async () => {
    if (!dateString) return;
    await initializeAttendance.mutateAsync({ date: dateString, employees: activeEmployees });
  };

  const handleStatusChange = async (attendanceId: string, status: AttendanceStatus) => {
    await updateAttendance.mutateAsync({ id: attendanceId, status });
  };

  const isLoading = teamLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      <Header
        title="Zoom Meeting Attendance"
        subtitle="Track daily meeting attendance and view KPIs"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days Tracked
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalDaysTracked}</div>
            <p className="text-xs text-muted-foreground">Total meeting days</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {kpis.attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalPresent} present / {kpis.totalAbsent} absent
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
            <div className="text-2xl font-bold text-yellow-400">{kpis.totalLate}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.latePercentage}% of present
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="employees">By Employee</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="monthly">Month-Wise</TabsTrigger>
        </TabsList>

        {/* Daily Attendance Tab */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  modifiers={{
                    hasMeeting: (date) =>
                      meetingDates.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersStyles={{
                    hasMeeting: {
                      backgroundColor: "hsl(var(--primary) / 0.2)",
                      borderRadius: "50%",
                    },
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Highlighted dates have recorded meetings
                </p>
              </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d, yyyy")
                    : "Select a date"}
                </CardTitle>
                {selectedDate && (
                  <Button
                    onClick={handleInitializeDay}
                    disabled={initializeAttendance.isPending}
                    size="sm"
                  >
                    {initializeAttendance.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {meetingDates.has(dateString || "") ? "Refresh" : "Initialize Day"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {dateAttendanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !dateAttendance || dateAttendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No attendance records for this date.</p>
                    <p className="text-sm">Click "Initialize Day" to start tracking.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateAttendance.map((attendance) => (
                        <TableRow key={attendance.id}>
                          <TableCell className="font-medium">
                            {attendance.employee?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {attendance.employee?.role || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[attendance.status]}
                            >
                              {statusIcons[attendance.status]}
                              <span className="ml-1 capitalize">{attendance.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={attendance.status}
                              onValueChange={(value: AttendanceStatus) =>
                                handleStatusChange(attendance.id, value)
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Employee Tab */}
        <TabsContent value="employees">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Employee Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Attendance %</TableHead>
                      <TableHead className="text-center">Late %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSummaries.map((summary) => (
                      <TableRow key={summary.employee.id}>
                        <TableCell className="font-medium">
                          {summary.employee.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {summary.employee.role}
                        </TableCell>
                        <TableCell className="text-center text-green-400">
                          {summary.totalPresent}
                        </TableCell>
                        <TableCell className="text-center text-red-400">
                          {summary.totalAbsent}
                        </TableCell>
                        <TableCell className="text-center text-yellow-400">
                          {summary.totalLate}
                        </TableCell>
                        <TableCell className="text-center">
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
                        <TableCell className="text-center text-muted-foreground">
                          {summary.latePercentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Meeting History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dateSummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No meeting history yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateSummaries.map((summary) => (
                      <TableRow
                        key={summary.date}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedDate(parseISO(summary.date));
                          setActiveTab("daily");
                        }}
                      >
                        <TableCell className="font-medium">
                          {format(parseISO(summary.date), "EEEE, MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-center text-green-400">
                          {summary.totalPresent}
                        </TableCell>
                        <TableCell className="text-center text-red-400">
                          {summary.totalAbsent}
                        </TableCell>
                        <TableCell className="text-center text-yellow-400">
                          {summary.totalLate}
                        </TableCell>
                        <TableCell className="text-center">
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Month-Wise Tab */}
        <TabsContent value="monthly">
          <MonthlyAttendanceView employees={activeEmployees} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
