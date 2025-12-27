import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ProjectDistributionChart } from '@/components/dashboard/ProjectDistributionChart';
import { LeadsBySheetChart } from '@/components/dashboard/LeadsBySheetChart';
import { useAllLeads } from '@/hooks/useLeads';
import { useLeadSheets } from '@/hooks/useLeadSheets';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { DollarSign, FolderKanban, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const { leads } = useAllLeads();
  const { sheets } = useLeadSheets();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { team } = useTeam();
  const [selectedSheetFilter, setSelectedSheetFilter] = useState<string>('all');

  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  // Filter leads based on sheet selection
  const filteredLeads = selectedSheetFilter === 'all' 
    ? leads 
    : leads.filter(l => l.sheet_id === selectedSheetFilter);
  
  const newLeads = filteredLeads.filter(l => l.status === 'new').length;
  const avgUtilization = team.length > 0 
    ? Math.round(team.reduce((acc, m) => acc + m.utilization, 0) / team.length)
    : 0;

  const recentTasks = tasks.slice(0, 5);
  const recentLeads = filteredLeads.slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your business."
      />
      
      <div className="p-6 space-y-6">
        {/* Sheet Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">View analytics for:</span>
          <Select value={selectedSheetFilter} onValueChange={setSelectedSheetFilter}>
            <SelectTrigger className="w-48 bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Sheets (Global)</SelectItem>
              {sheets.map((sheet) => (
                <SelectItem key={sheet.id} value={sheet.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sheet.color }} />
                    {sheet.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          <StatCard
            title="Total Revenue"
            value="$54,350"
            change="+12% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-neon-cyan"
            delay={0}
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            change={`${projects.length} total projects`}
            changeType="neutral"
            icon={FolderKanban}
            iconColor="text-neon-purple"
            delay={100}
          />
          <StatCard
            title="New Leads"
            value={newLeads}
            change={`${filteredLeads.length} total leads`}
            changeType="positive"
            icon={Users}
            iconColor="text-neon-blue"
            delay={200}
          />
          <StatCard
            title="Team Utilization"
            value={`${avgUtilization}%`}
            change={`${team.length} team members`}
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-neon-green"
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <ProjectDistributionChart />
        </div>

        {/* Leads by Sheet Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadsBySheetChart leads={leads} sheets={sheets} />
          
          {/* Recent Leads */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Recent Leads</h3>
              <a href="/leads" className="text-sm text-primary hover:underline">View all</a>
            </div>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.city || 'No location'} • {lead.source || 'Unknown source'}</p>
                  </div>
                  <span className={cn('status-badge text-xs', `status-${lead.status}`)}>
                    {lead.status}
                  </span>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No leads yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Tasks</h3>
            <a href="/tasks" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  task.status === 'done' && 'bg-success',
                  task.status === 'in_progress' && 'bg-warning',
                  task.status === 'review' && 'bg-secondary',
                  task.status === 'todo' && 'bg-muted-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4 col-span-full">No tasks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
