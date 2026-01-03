import React from "react";

export default function DayCard({ day, active, onClick }) {
  return (
    <div className={`day-card ${active ? "active" : ""}`} onClick={onClick}>
      <h4>{day.day}</h4>
      <p>{day.focus}</p>
    </div>
  );
}
