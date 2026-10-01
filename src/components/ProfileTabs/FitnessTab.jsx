import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const FitnessTab = () => {
    const { user } = useAuth();
    // BMI = weight / (height/100)^2
    const h = user?.height || 175;
    const w = user?.weight || 75;
    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);

    const data = [
        { name: 'BMI', value: parseFloat(bmi) },
        { name: 'Remaining', value: 40 - parseFloat(bmi) } // Arbitrary max 40
    ];

    let status = "Normal";
    let color = "#22c55e";
    if (bmi < 18.5) { status = "Underweight"; color = "#f59e0b"; }
    else if (bmi >= 25 && bmi < 30) { status = "Overweight"; color = "#f59e0b"; }
    else if (bmi >= 30) { status = "Obese"; color = "#ef4444"; }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="glass-card">
                <h3>Body Mass Index (BMI)</h3>
                <div style={{ height: '200px', position: 'relative', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={180}
                                endAngle={0}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell key="val" fill={color} />
                                <Cell key="bg" fill="var(--bg-main)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: color }}>{bmi}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{status}</div>
                    </div>
                </div>
                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Based on your height ({h}cm) and weight ({w}kg).
                </div>
            </div>

            <div className="glass-card">
                <h3>My Goals</h3>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Target Weight</span>
                            <span>70kg</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px' }}>
                            <div style={{ width: '80%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Weekly Activity</span>
                            <span>4/5 Days</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px' }}>
                            <div style={{ width: '80%', height: '100%', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FitnessTab;
