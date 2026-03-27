import React, { useEffect, useState } from 'react';
import API from './axiosConfig';

const Recommendation = () => {
  const [data, setData] = useState({ workouts: [], diet: [] });

  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get('/api/recommendations/');
      setData(res.data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>🏋️‍♂️ Workout Recommendations</h2>
      {data.workouts.map((w, i) => <p key={i}>{w}</p>)}

      <h2>🥗 Diet Recommendations</h2>
      {data.diet.map((d, i) => <p key={i}>{d}</p>)}
    </div>
  );
};

export default Recommendation;
