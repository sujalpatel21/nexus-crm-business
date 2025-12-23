import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useProjects } from '@/hooks/useProjects';
import { Task, TaskStatus, TaskPriority } from '@/types/database';
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
import { Plus, GripVertical, Calendar, User, Flag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'border-muted-foreground' },
  { status: 'in_progress', title: 'In Progress', color: 'border-warning' },
  { status: 'review', title: 'Review', color: 'border-secondary' },
  { status: 'done', title: 'Done', color: 'border-success' },
];

const priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

export default function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks();
  const { team } = useTeam();
  const { projects } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
    assignee_id: '',
    project_id: '',
    position: 0,
  });

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status).sort((a, b) => a.position - b.position);

  const handleCreate = async () => {
    await createTask.mutateAsync({
      ...formData,
      due_date: formData.due_date || undefined,
      assignee_id: formData.assignee_id || undefined,
      project_id: formData.project_id || undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    await updateTask.mutateAsync({
      id: editingTask.id,
      ...formData,
      due_date: formData.due_date || undefined,
      assignee_id: formData.assignee_id || undefined,
      project_id: formData.project_id || undefined,
    });
    setEditingTask(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      assignee_id: '',
      project_id: '',
      position: 0,
    });
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      assignee_id: task.assignee_id || '',
      project_id: task.project_id || '',
      position: task.position,
    });
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus.mutate({ id: draggedTask.id, status });
    }
    setDraggedTask(null);
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    return (
      <Flag className={cn(
        'w-3.5 h-3.5',
        priority === 'high' && 'text-destructive fill-destructive',
        priority === 'medium' && 'text-warning fill-warning',
        priority === 'low' && 'text-success'
      )} />
    );
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Task Management" 
        subtitle={`${tasks.length} tasks`}
      />
      
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks between columns to update their status
          </p>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-neon text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-muted/50"
                    placeholder="Enter task title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/50 min-h-[100px]"
                    placeholder="Add a description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {columns.map(col => (
                          <SelectItem key={col.status} value={col.status}>{col.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {priorityOptions.map(p => (
                          <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select value={formData.assignee_id} onValueChange={(v) => setFormData({ ...formData, assignee_id: v })}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {team.map(member => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Link to project" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!formData.title} className="bg-gradient-neon text-primary-foreground">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
          {columns.map((column) => (
            <div
              key={column.status}
              className={cn(
                'kanban-column border-t-2',
                column.color
              )}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">{column.title}</h3>
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {getTasksByStatus(column.status).length}
                </span>
              </div>

              <div className="space-y-3 flex-1 min-h-[200px]">
                {getTasksByStatus(column.status).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'kanban-card group',
                      draggedTask?.id === task.id && 'opacity-50'
                    )}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => openEdit(task)}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {getPriorityIcon(task.priority)}
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-neon flex items-center justify-center text-[10px] text-primary-foreground font-semibold">
                                {task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            </div>
                          )}
                          {task.project && (
                            <span className="text-primary truncate max-w-[100px]">{task.project.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
        )}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center justify-between">
              Edit Task
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive"
                onClick={() => {
                  if (editingTask) {
                    deleteTask.mutate(editingTask.id);
                    setEditingTask(null);
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-muted/50 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {columns.map(col => (
                      <SelectItem key={col.status} value={col.status}>{col.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {priorityOptions.map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={formData.assignee_id} onValueChange={(v) => setFormData({ ...formData, assignee_id: v })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {team.map(member => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Link to project" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formData.title} className="bg-gradient-neon text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
