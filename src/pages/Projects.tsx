import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useProjects } from '@/hooks/useProjects';
import { useLeads } from '@/hooks/useLeads';
import { Project, ProjectStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

const statusOptions: ProjectStatus[] = ['active', 'completed', 'on_hold', 'cancelled'];

export default function Projects() {
  const { projects, isLoading, createProject, updateProject, updateProjectProgress, updateProjectStatus } = useProjects();
  const { leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active' as ProjectStatus,
    budget: 0,
    start_date: '',
    end_date: '',
    progress: 0,
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    await createProject.mutateAsync({
      ...formData,
      budget: formData.budget || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      client_id: formData.client_id || undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client_id: '',
      status: 'active',
      budget: 0,
      start_date: '',
      end_date: '',
      progress: 0,
    });
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan';
      case 'completed': return 'bg-success/20 border-success/50 text-success';
      case 'on_hold': return 'bg-warning/20 border-warning/50 text-warning';
      case 'cancelled': return 'bg-destructive/20 border-destructive/50 text-destructive';
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Project Management" 
        subtitle={`${projects.length} projects`}
        onSearch={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-muted/50 border-border">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-neon text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input 
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!formData.name} className="bg-gradient-neon text-primary-foreground">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.client?.name || 'No client'}</p>
                </div>
                <span className={cn('status-badge', getStatusColor(project.status))}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{project.budget ? `$${(project.budget / 1000).toFixed(0)}k` : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>{project.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground glass-card">
            {isLoading ? 'Loading...' : 'No projects found'}
          </div>
        )}
      </div>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <span className={cn('status-badge', getStatusColor(selectedProject.status))}>
                  {selectedProject.status.replace('_', ' ')}
                </span>
                <Select 
                  value={selectedProject.status} 
                  onValueChange={(v) => {
                    updateProjectStatus.mutate({ id: selectedProject.id, status: v as ProjectStatus });
                    setSelectedProject({ ...selectedProject, status: v as ProjectStatus });
                  }}
                >
                  <SelectTrigger className="w-40 bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProject.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedProject.description}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="font-medium">{selectedProject.progress}%</span>
                </div>
                <Slider
                  value={[selectedProject.progress]}
                  max={100}
                  step={5}
                  onValueChange={([value]) => {
                    updateProjectProgress.mutate({ id: selectedProject.id, progress: value });
                    setSelectedProject({ ...selectedProject, progress: value });
                  }}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="glass-card p-4">
                  <p className="text-muted-foreground mb-1">Client</p>
                  <p className="font-medium">{selectedProject.client?.name || '-'}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium">{selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : '-'}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">{selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '-'}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-muted-foreground mb-1">End Date</p>
                  <p className="font-medium">{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
