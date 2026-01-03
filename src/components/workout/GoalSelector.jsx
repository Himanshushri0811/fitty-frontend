import React from "react";

const goals = [
  { id: "muscle", label: "Muscle Gain" },
  { id: "fat", label: "Fat Loss" },
  { id: "strength", label: "Strength" },
];

export default function GoalSelector({ selected, onSelect }) {
  return (
    <div className="goal-selector">
      {goals.map((g) => (
        <button
          key={g.id}
          className={`goal-btn ${selected === g.id ? "active" : ""}`}
          onClick={() => onSelect(g.id)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
