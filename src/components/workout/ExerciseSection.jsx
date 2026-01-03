import React from "react";
import ExerciseCard from "./ExerciseCard";

export default function ExerciseSection({ exercises }) {
  if (!exercises) return null;   // ⭐ IMPORTANT LINE

  return (
    <div className="exercise-section">
      {exercises.map((ex, i) => (
        <ExerciseCard key={i} exercise={ex} />
      ))}
    </div>
  );
}
