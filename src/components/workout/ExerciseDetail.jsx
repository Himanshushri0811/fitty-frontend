import React, { useState } from "react";
import RestTimer from "./RestTimer";
import "../styles/workout.css";

const exerciseData = {
  name: "Barbell Bench Press",
  target: "Chest, Triceps",
  instructions: [
    "Lie flat on the bench and grip the bar slightly wider than shoulders.",
    "Lower the bar slowly to your chest.",
    "Push the bar up explosively while exhaling.",
  ],
  totalSets: 4,
  reps: "8–10",
  restTime: 90,
};

const ExerciseDetail = () => {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);

  const completeSet = () => {
    if (currentSet < exerciseData.totalSets) {
      setIsResting(true);
    }
  };

  const onRestComplete = () => {
    setIsResting(false);
    setCurrentSet((prev) => prev + 1);
  };

  return (
    <div className="exercise-detail">
      <h1>{exerciseData.name}</h1>
      <p className="target-text">Target: {exerciseData.target}</p>

      <div className="instruction-box">
        <h4>How to Perform</h4>
        <ul>
          {exerciseData.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="set-info">
        <p>
          Set {currentSet} of {exerciseData.totalSets}
        </p>
        <p>Reps: {exerciseData.reps}</p>
      </div>

      {!isResting ? (
        <button className="complete-set-btn" onClick={completeSet}>
          Complete Set
        </button>
      ) : (
        <RestTimer
          seconds={exerciseData.restTime}
          onComplete={onRestComplete}
        />
      )}
    </div>
  );
};

export default ExerciseDetail;
