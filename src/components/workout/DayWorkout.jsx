import React from "react";
import ExerciseSection from "./ExerciseSection";

const MOCK_EXERCISES = [
  { name: "Bench Press", sets: 4, reps: "8–10" },
  { name: "Incline Dumbbell Press", sets: 3, reps: "10–12" },
  { name: "Cable Fly", sets: 3, reps: "12–15" },
];

export default function DayWorkout({ day }) {
  const isRestDay = day.focus.toLowerCase() === "rest";

  return (
    <div className="day-workout">
      <h2>{day.focus}</h2>

      {isRestDay ? (
        <p className="rest-day-text">
          Recovery day. Focus on mobility and rest.
        </p>
      ) : (
        <ExerciseSection exercises={MOCK_EXERCISES} />
      )}
    </div>
  );
}
