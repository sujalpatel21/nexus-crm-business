import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useTeam } from '@/hooks/useTeam';
import { TeamMember } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Mail, Briefcase, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function Team() {
  const { team, isLoading, createMember, updateMember, deleteMember } = useTeam();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    utilization: 0,
  });

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    await createMember.mutateAsync(formData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingMember) return;
    await updateMember.mutateAsync({ id: editingMember.id, ...formData });
    setEditingMember(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteMember.mutateAsync(id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      utilization: 0,
    });
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      utilization: member.utilization,
    });
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Team" 
        subtitle={`${team.length} team members`}
        onSearch={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-end mb-6">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-neon text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-muted/50"
                    placeholder="e.g. Developer, Designer, Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Utilization: {formData.utilization}%</Label>
                  <Slider
                    value={[formData.utilization]}
                    max={100}
                    step={5}
                    onValueChange={([value]) => setFormData({ ...formData, utilization: value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!formData.name || !formData.email || !formData.role} 
                  className="bg-gradient-neon text-primary-foreground"
                >
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeam.map((member, index) => (
            <div 
              key={member.id}
              className="glass-card p-6 text-center animate-fade-in-up hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-success flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
              </div>
              
              <h3 className="font-display font-semibold text-lg mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className={cn(
                    'font-medium',
                    member.utilization >= 80 && 'text-success',
                    member.utilization >= 50 && member.utilization < 80 && 'text-warning',
                    member.utilization < 50 && 'text-muted-foreground'
                  )}>
                    {member.utilization}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${member.utilization}%` }} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => openEdit(member)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12 text-muted-foreground glass-card">
            {isLoading ? 'Loading...' : 'No team members found'}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Utilization: {formData.utilization}%</Label>
              <Slider
                value={[formData.utilization]}
                max={100}
                step={5}
                onValueChange={([value]) => setFormData({ ...formData, utilization: value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!formData.name || !formData.email || !formData.role} 
              className="bg-gradient-neon text-primary-foreground"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
