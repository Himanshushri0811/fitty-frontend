import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', calories: 2400, steps: 4000 },
    { name: 'Tue', calories: 1398, steps: 3000 },
    { name: 'Wed', calories: 9800, steps: 2000 },
    { name: 'Thu', calories: 3908, steps: 2780 },
    { name: 'Fri', calories: 4800, steps: 1890 },
    { name: 'Sat', calories: 3800, steps: 2390 },
    { name: 'Sun', calories: 4300, steps: 3490 },
];

const StatsChart = ({ theme = 'light' }) => {
    return (
        <div className="stats-chart-wrapper" style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)'
                        }}
                        itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="var(--primary)"
                        fillOpacity={1}
                        fill="url(#colorCalories)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatsChart;
