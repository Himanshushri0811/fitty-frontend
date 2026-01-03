import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './HealthTracking.css';

const HealthTracking = () => {
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);  // ✅ लोडिंग स्टेट

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/health/?user_id=4');
        const apiData = response.data.map(item => ({
          date: item.date,
          steps: item.steps,
          calories: item.calories,
          heartRate: item.heart_rate,
          workoutDuration: item.workout_duration
        }));

        setData(apiData);
        setLoading(false);  // ✅ डेटा लोड होने के बाद लोडिंग बंद कर दो

        if (apiData.length > 0) {
          const totalCalories = apiData.reduce((acc, curr) => acc + curr.calories, 0);
          const goalCalories = 5000;  // Example goal
          const progressPercent = Math.min((totalCalories / goalCalories) * 100, 100);
          setProgress(progressPercent.toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = data.map((item, index) => ({
    day: `Day ${index + 1}`,
    calories: item.calories,
    steps: item.steps,
    workoutDuration: item.workoutDuration,
  }));

  return (
    <motion.div
      className="health-tracking-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="title">Health Tracking Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-container">
        <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
          <h3>Calories Burned</h3>
          <p>{data.reduce((acc, item) => acc + item.calories, 0)} kcal</p>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
          <h3>Steps Walked</h3>
          <p>{data.reduce((acc, item) => acc + item.steps, 0)} steps</p>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
          <h3>Workout Time</h3>
          <p>{data.reduce((acc, item) => acc + item.workoutDuration, 0)} hours</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h2>Weekly Progress</h2>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          >
            {progress}%
          </motion.div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          {/* Graph Section */}
          <div className="graph-section">
            <h2>Calories & Steps Over the Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#82ca9d" />
                <Bar dataKey="steps" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>

            <h2 className="mt-4">Workout Duration Over the Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="workoutDuration" stroke="#FF5733" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default HealthTracking;
