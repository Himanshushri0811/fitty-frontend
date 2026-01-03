import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Recommendation = () => {
  const [data, setData] = useState({ workouts: [], diet: [] });

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('http://localhost:8000/api/recommendations/');
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
