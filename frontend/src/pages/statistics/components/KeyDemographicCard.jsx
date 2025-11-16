// frontend/src/pages/statistics/components/KeyDemographicCard.jsx
import React from 'react';

export default function KeyDemographicCard({ title, subtitle, value, color = "bg-teal-500" }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4 relative overflow-hidden">
      {/* Decorative Color Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color}`}></div>
      
      <div className="pl-2">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="ml-auto text-right">
        <p className={`text-2xl font-bold text-gray-800`}>{value}</p>
      </div>
    </div>
  );
}
