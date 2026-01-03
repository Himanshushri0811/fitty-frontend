import React from "react";

// ✅ Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div className="text-white">{children}</div>;
};

// ✅ New CardHeader Component
const CardHeader = ({ children }) => {
  return <div className="text-lg font-bold text-white mb-2">{children}</div>;
};

// ✅ New CardTitle Component
const CardTitle = ({ children }) => {
  return <h2 className="text-xl font-bold text-gray-300">{children}</h2>;
};

// ✅ Button Component
const Button = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
    >
      {children}
    </button>
  );
};

// ✅ Progress Component
const Progress = ({ value, max }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
      <div
        className="bg-green-500 h-full text-center text-white text-sm"
        style={{ width: `${percentage}%` }}
      >
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

// ✅ Export All Components
export { Card, CardContent, CardHeader, CardTitle, Button, Progress };
