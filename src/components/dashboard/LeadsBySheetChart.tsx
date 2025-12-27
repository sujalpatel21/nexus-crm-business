import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Lead, LeadSheet, LeadStatus } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeadsBySheetChartProps {
  leads: Lead[];
  sheets: LeadSheet[];
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#00d4ff',
  contacted: '#a855f7',
  qualified: '#22c55e',
  converted: '#f59e0b',
  lost: '#ef4444',
};

export function LeadsBySheetChart({ leads, sheets }: LeadsBySheetChartProps) {
  const pieData = useMemo(() => {
    const unassigned = leads.filter((l) => !l.sheet_id).length;
    const sheetData = sheets.map((sheet) => ({
      name: sheet.name,
      value: leads.filter((l) => l.sheet_id === sheet.id).length,
      color: sheet.color,
    }));

    if (unassigned > 0) {
      sheetData.push({ name: 'Unassigned', value: unassigned, color: '#6b7280' });
    }

    return sheetData.filter((d) => d.value > 0);
  }, [leads, sheets]);

  const stackedData = useMemo(() => {
    const allSheets = [
      ...sheets.map((s) => ({ id: s.id, name: s.name, color: s.color })),
      { id: null, name: 'Unassigned', color: '#6b7280' },
    ];

    return allSheets.map((sheet) => {
      const sheetLeads = leads.filter((l) =>
        sheet.id ? l.sheet_id === sheet.id : !l.sheet_id
      );
      return {
        name: sheet.name,
        color: sheet.color,
        new: sheetLeads.filter((l) => l.status === 'new').length,
        contacted: sheetLeads.filter((l) => l.status === 'contacted').length,
        qualified: sheetLeads.filter((l) => l.status === 'qualified').length,
        converted: sheetLeads.filter((l) => l.status === 'converted').length,
        lost: sheetLeads.filter((l) => l.status === 'lost').length,
      };
    }).filter((d) => d.new + d.contacted + d.qualified + d.converted + d.lost > 0);
  }, [leads, sheets]);

  if (leads.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in-up">
        <h3 className="font-display font-semibold text-lg mb-4">Leads by Sheet</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No leads data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="font-display font-semibold text-lg mb-4">Leads by Sheet</h3>
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="status" className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="new" stackId="a" fill={STATUS_COLORS.new} name="New" />
              <Bar dataKey="contacted" stackId="a" fill={STATUS_COLORS.contacted} name="Contacted" />
              <Bar dataKey="qualified" stackId="a" fill={STATUS_COLORS.qualified} name="Qualified" />
              <Bar dataKey="converted" stackId="a" fill={STATUS_COLORS.converted} name="Converted" />
              <Bar dataKey="lost" stackId="a" fill={STATUS_COLORS.lost} name="Lost" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
