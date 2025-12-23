import { Header } from '@/components/layout/Header';
import { useLeads } from '@/hooks/useLeads';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line,
} from 'recharts';

export default function Analytics() {
  const { leads } = useLeads();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { team } = useTeam();

  // Leads by source
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadsBySourceData = Object.entries(leadsBySource).map(([name, value]) => ({ name, value }));

  // Conversion funnel
  const conversionData = [
    { stage: 'New', count: leads.filter(l => l.status === 'new').length, fill: 'hsl(217, 91%, 60%)' },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, fill: 'hsl(38, 92%, 50%)' },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, fill: 'hsl(260, 85%, 65%)' },
    { stage: 'Converted', count: leads.filter(l => l.status === 'converted').length, fill: 'hsl(142, 76%, 45%)' },
  ];

  // Revenue trends (mock data based on projects)
  const revenueData = [
    { month: 'Jan', revenue: 25000 },
    { month: 'Feb', revenue: 32000 },
    { month: 'Mar', revenue: 28000 },
    { month: 'Apr', revenue: 38000 },
    { month: 'May', revenue: 42000 },
    { month: 'Jun', revenue: 48000 },
    { month: 'Jul', revenue: 52000 },
    { month: 'Aug', revenue: 54350 },
  ];

  // Team performance
  const teamPerformance = team.map(member => ({
    name: member.name.split(' ')[0],
    utilization: member.utilization,
    tasks: tasks.filter(t => t.assignee_id === member.id).length,
  }));

  // Task status distribution
  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'hsl(215, 20%, 65%)' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: 'hsl(260, 85%, 65%)' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'hsl(142, 76%, 45%)' },
  ];

  const chartColors = ['hsl(190, 100%, 50%)', 'hsl(260, 85%, 65%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <div className="min-h-screen">
      <Header 
        title="Analytics" 
        subtitle="Business insights and performance metrics"
      />
      
      <div className="p-6 space-y-6">
        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 animate-fade-in-up">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">{leads.length}</p>
            <p className="text-sm text-success mt-2">
              {leads.filter(l => l.status === 'converted').length} converted
            </p>
          </div>
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">
              {projects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              of {projects.length} total
            </p>
          </div>
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">
              {tasks.filter(t => t.status === 'done').length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              of {tasks.length} total
            </p>
          </div>
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-muted-foreground">Team Utilization</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">
              {team.length > 0 ? Math.round(team.reduce((acc, m) => acc + m.utilization, 0) / team.length) : 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {team.length} members
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="font-display font-semibold text-lg mb-4">Revenue Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 10%, 8%)',
                      border: '1px solid hsl(240, 10%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(190, 100%, 50%)" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads by Source */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="font-display font-semibold text-lg mb-4">Leads by Source</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsBySourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadsBySourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 10%, 8%)',
                      border: '1px solid hsl(240, 10%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h3 className="font-display font-semibold text-lg mb-4">Conversion Funnel</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
                  <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                  <YAxis dataKey="stage" type="category" stroke="hsl(215, 20%, 65%)" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 10%, 8%)',
                      border: '1px solid hsl(240, 10%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Performance */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            <h3 className="font-display font-semibold text-lg mb-4">Team Performance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 20%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 10%, 8%)',
                      border: '1px solid hsl(240, 10%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="utilization" name="Utilization %" fill="hsl(190, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" name="Tasks" fill="hsl(260, 85%, 65%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Status */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <h3 className="font-display font-semibold text-lg mb-4">Task Status Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {taskStatusData.map((status) => (
              <div key={status.name} className="text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: `${status.color}20`, color: status.color }}
                >
                  {status.value}
                </div>
                <p className="text-sm text-muted-foreground">{status.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
