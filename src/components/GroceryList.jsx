import React from 'react';

const GroceryList = ({ plan }) => {
  return (
    <div className="grocery-section">
      <h3>🛒 ग्रॉसरी लिस्ट</h3>
      <ul>
        {plan.grocery_list.map((item, index) => (
          <li key={index}>
            <input type="checkbox" id={`item-${index}`} />
            <label htmlFor={`item-${index}`}>{item}</label>
          </li>
        ))}
      </ul>
      <button onClick={() => window.print()} className="print-btn">
        🖨️ प्रिंट करें
      </button>
    </div>
  );
};

export default GroceryList;