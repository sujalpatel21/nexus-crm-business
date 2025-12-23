import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Active', value: 10, color: 'hsl(190, 100%, 50%)' },
  { name: 'Completed', value: 4, color: 'hsl(142, 76%, 45%)' },
  { name: 'On Hold', value: 2, color: 'hsl(38, 92%, 50%)' },
];

export function ProjectDistributionChart() {
  return (
    <div className="chart-container animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">Project Distribution</h3>
        <p className="text-sm text-muted-foreground">Current project status breakdown</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 10%, 8%)',
                border: '1px solid hsl(240, 10%, 20%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 212, 255, 0.2)',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '14px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-2xl font-display font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
