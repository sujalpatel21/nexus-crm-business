import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useTeam } from '@/hooks/useTeam';
import { Document } from '@/types/database';
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
import { Plus, FileText, Image, FileSpreadsheet, File, Trash2, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';

const getFileIcon = (type?: string) => {
  if (!type) return File;
  if (type.includes('image')) return Image;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Documents() {
  const { documents, isLoading, createDocument, deleteDocument } = useDocuments();
  const { projects } = useProjects();
  const { team } = useTeam();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    file_url: '',
    file_type: '',
    file_size: 0,
    project_id: '',
    uploaded_by: '',
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || doc.project_id === projectFilter;
    return matchesSearch && matchesProject;
  });

  const handleCreate = async () => {
    await createDocument.mutateAsync({
      ...formData,
      file_size: formData.file_size || undefined,
      project_id: formData.project_id || undefined,
      uploaded_by: formData.uploaded_by || undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteDocument.mutateAsync(id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      file_url: '',
      file_type: '',
      file_size: 0,
      project_id: '',
      uploaded_by: '',
    });
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Documents" 
        subtitle={`${documents.length} documents`}
        onSearch={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48 bg-muted/50 border-border">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-neon text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Add Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50"
                    placeholder="e.g. Project Proposal.pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL *</Label>
                  <Input 
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="bg-muted/50"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>File Type</Label>
                    <Input 
                      value={formData.file_type}
                      onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                      className="bg-muted/50"
                      placeholder="application/pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>File Size (bytes)</Label>
                    <Input 
                      type="number"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
                      className="bg-muted/50"
                    />
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
                <div className="space-y-2">
                  <Label>Uploaded By</Label>
                  <Select value={formData.uploaded_by} onValueChange={(v) => setFormData({ ...formData, uploaded_by: v })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select uploader" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {team.map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!formData.name || !formData.file_url} 
                  className="bg-gradient-neon text-primary-foreground"
                >
                  Add Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, index) => {
            const FileIcon = getFileIcon(doc.file_type);
            
            return (
              <div 
                key={doc.id}
                className="glass-card p-6 group animate-fade-in-up hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-medium mb-1 truncate">{doc.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatFileSize(doc.file_size)}
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  {doc.project && (
                    <p className="truncate">
                      <span className="text-primary">{doc.project.name}</span>
                    </p>
                  )}
                  <p>
                    Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </p>
                  {doc.uploader && (
                    <p>by {doc.uploader.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground glass-card">
            {isLoading ? 'Loading...' : 'No documents found'}
          </div>
        )}
      </div>
    </div>
  );
}
