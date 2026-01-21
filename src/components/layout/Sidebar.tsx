import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCircle,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  CheckSquare,
  Settings,
  HelpCircle,
  Sparkles,
  Video,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Lead Management', path: '/leads' },
  { icon: FolderKanban, label: 'Project Management', path: '/projects' },
  { icon: UserCircle, label: 'Team', path: '/team' },
  { icon: Video, label: 'Zoom Attendance', path: '/attendance' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: TrendingUp, label: 'Funnel Performance', path: '/funnel-performance' },
  { icon: CheckSquare, label: 'Task Management', path: '/tasks' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-gradient-neon opacity-50 blur-lg" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-foreground">NexusCRM</h1>
          <p className="text-xs text-muted-foreground">Business Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'sidebar-item',
                    isActive && 'active'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive && 'text-primary'
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary shadow-neon-cyan" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-semibold">
              PS
            </div>
            <div>
              <p className="font-medium text-sm">Priyanka S.</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-neon transition-all duration-500"
              style={{ width: '92%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">92% Utilization</p>
        </div>
      </div>
    </aside>
  );
}
