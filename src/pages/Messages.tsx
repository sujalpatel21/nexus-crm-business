import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useMessages } from '@/hooks/useMessages';
import { useProjects } from '@/hooks/useProjects';
import { useTeam } from '@/hooks/useTeam';
import { Message } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { messages, isLoading, createMessage, deleteMessage } = useMessages();
  const { projects } = useProjects();
  const { team } = useTeam();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [selectedSender, setSelectedSender] = useState<string>('');

  const filteredMessages = messages.filter(msg => 
    selectedProject === 'all' || msg.project_id === selectedProject
  );

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    await createMessage.mutateAsync({
      content: newMessage,
      project_id: selectedProject !== 'all' ? selectedProject : undefined,
      sender_id: selectedSender || undefined,
    });
    setNewMessage('');
  };

  const handleDelete = async (id: string) => {
    await deleteMessage.mutateAsync(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        title="Messages" 
        subtitle={`${messages.length} messages`}
      />
      
      <div className="flex-1 flex flex-col p-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-60 bg-muted/50 border-border">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        <div className="flex-1 glass-card p-6 mb-6 overflow-y-auto custom-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message, index) => (
                <div 
                  key={message.id}
                  className="group flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                    {message.sender?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium">{message.sender?.name || 'Unknown'}</span>
                        {message.project && (
                          <span className="ml-2 text-xs text-primary">
                            in {message.project.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4 mb-3">
            <Select value={selectedSender} onValueChange={setSelectedSender}>
              <SelectTrigger className="w-48 bg-muted/50 border-border">
                <SelectValue placeholder="Send as..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {team.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject === 'all' && (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48 bg-muted/50 border-border">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="bg-muted/50 border-border resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-gradient-neon text-primary-foreground hover:opacity-90 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
