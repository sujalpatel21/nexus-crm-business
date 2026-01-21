import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    Target,
    DollarSign,
    Filter,
    Download,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

// Sample Data
const funnelData = [
    { name: 'Impressions', value: 45000, fill: '#8884d8' },
    { name: 'Clicks', value: 2800, fill: '#83a6ed' },
    { name: 'Leads', value: 950, fill: '#8dd1e1' },
    { name: 'Opportunities', value: 420, fill: '#82ca9d' },
    { name: 'Wins', value: 180, fill: '#a4de6c' },
];

const performanceData = [
    { date: 'Mon', spend: 4000, revenue: 2400 },
    { date: 'Tue', spend: 3000, revenue: 1398 },
    { date: 'Wed', spend: 2000, revenue: 9800 },
    { date: 'Thu', spend: 2780, revenue: 3908 },
    { date: 'Fri', spend: 1890, revenue: 4800 },
    { date: 'Sat', spend: 2390, revenue: 3800 },
    { date: 'Sun', spend: 3490, revenue: 4300 },
];

const trafficSourceData = [
    { name: 'Facebook Ads', value: 400 },
    { name: 'Google Ads', value: 300 },
    { name: 'Direct', value: 300 },
    { name: 'Referral', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FunnelPerformance = () => {
    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Funnel Performance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your marketing funnels and ad campaigns in real-time.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                        <CalendarIcon className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Total Spend", value: "$12,450", change: "+12.5%", icon: DollarSign, trend: "up" },
                    { title: "Total Revenue", value: "$48,200", change: "+23.1%", icon: TrendingUp, trend: "up" },
                    { title: "Conversion Rate", value: "3.2%", change: "-0.4%", icon: Target, trend: "down" },
                    { title: "Total Leads", value: "1,240", change: "+8.2%", icon: Users, trend: "up" }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-xl border border-border/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                                }`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Funnel Chart */}
                <div className="glass-card p-6 rounded-xl border border-border/50 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Conversion Funnel</h2>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={funnelData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="glass-card p-6 rounded-xl border border-border/50">
                    <h2 className="text-lg font-semibold mb-6">Traffic Sources</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trafficSourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {trafficSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {trafficSourceData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-medium">{Math.round((item.value / 1200) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Performance */}
            <div className="glass-card p-6 rounded-xl border border-border/50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Weekly Spend vs Revenue</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={performanceData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                            <Area type="monotone" dataKey="spend" stroke="#8884d8" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default FunnelPerformance;
