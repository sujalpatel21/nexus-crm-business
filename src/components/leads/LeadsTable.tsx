import { useState } from 'react';
import { Lead, LeadStatus, LeadSheet } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeam } from '@/hooks/useTeam';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  sheets: LeadSheet[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onEmail: (lead: Lead) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

type SortField = 'name' | 'created_at' | 'status' | 'city';
type SortDirection = 'asc' | 'desc';

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export function LeadsTable({
  leads,
  isLoading,
  sheets,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  onEmail,
  selectedIds,
  onSelectionChange,
}: LeadsTableProps) {
  const { team } = useTeam();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const filteredAndSortedLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getSheetColor = (sheetId?: string) => {
    if (!sheetId) return null;
    return sheets.find((s) => s.id === sheetId)?.color;
  };

  const allFilteredSelected = filteredAndSortedLeads.length > 0 && 
    filteredAndSortedLeads.every((lead) => selectedIds.includes(lead.id));

  const someSelected = selectedIds.length > 0 && !allFilteredSelected;

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAndSortedLeads.map((lead) => lead.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-muted/50 border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th className="w-12">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    {...(someSelected ? { "data-state": "indeterminate" } : {})}
                  />
                </th>
                <th>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th>Contact</th>
                <th>
                  <button
                    onClick={() => handleSort('city')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    City <SortIcon field="city" />
                  </button>
                </th>
                <th>Source</th>
                <th>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th>Assigned To</th>
                <th>
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Created <SortIcon field="created_at" />
                  </button>
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedLeads.map((lead) => {
                const sheetColor = getSheetColor(lead.sheet_id);
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <tr key={lead.id} className={cn("animate-fade-in-up", isSelected && "bg-primary/10")}>
                    <td>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectOne(lead.id)}
                        aria-label={`Select ${lead.name}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground font-semibold text-xs"
                          style={sheetColor ? { background: sheetColor } : undefined}
                        >
                          {lead.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p>{lead.email || '-'}</p>
                        <p className="text-muted-foreground">{lead.phone || '-'}</p>
                      </div>
                    </td>
                    <td>{lead.city || '-'}</td>
                    <td>{lead.source || '-'}</td>
                    <td>
                      <Select
                        value={lead.status}
                        onValueChange={(v) => onStatusChange(lead.id, v as LeadStatus)}
                      >
                        <SelectTrigger className={cn('w-28 h-7 text-xs', `status-${lead.status}`)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>{lead.assignee?.name || '-'}</td>
                    <td className="text-muted-foreground text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem onClick={() => onView(lead)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEmail(lead)} className="cursor-pointer">
                            <Mail className="w-4 h-4 mr-2" /> Generate Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(lead.id)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedLeads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {isLoading ? 'Loading...' : 'No leads found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
