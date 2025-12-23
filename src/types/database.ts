export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  utilization: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  source?: string;
  status: LeadStatus;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  assignee?: TeamMember;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: ProjectStatus;
  budget?: number;
  start_date?: string;
  end_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  client?: Lead;
  team_members?: TeamMember[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assignee_id?: string;
  project_id?: string;
  lead_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
  assignee?: TeamMember;
  project?: Project;
  lead?: Lead;
}

export interface Message {
  id: string;
  project_id?: string;
  sender_id?: string;
  content: string;
  parent_id?: string;
  created_at: string;
  sender?: TeamMember;
  project?: Project;
  replies?: Message[];
}

export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  project_id?: string;
  uploaded_by?: string;
  created_at: string;
  project?: Project;
  uploader?: TeamMember;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  project_id?: string;
  task_id?: string;
  color: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  task?: Task;
}

export interface AppSettings {
  id: string;
  glow_intensity: number;
  theme: string;
  created_at: string;
  updated_at: string;
}
