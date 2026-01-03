import React from "react";
import DayCard from "./DayCard";

export default function WeeklyPlan({ days, activeDay, onSelectDay }) {
  return (
    <div className="weekly-plan">
      {days.map((day, index) => (
        <DayCard
          key={day.day}
          day={day}
          active={index === activeDay}
          onClick={() => onSelectDay(index)}
        />
      ))}
    </div>
  );
}
