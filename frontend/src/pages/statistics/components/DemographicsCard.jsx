// frontend/src/pages/statistics/components/DemographicsCard.jsx
import React from 'react';

export default function DemographicsCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-teal-100 text-teal-600">
        {Icon && <Icon size={20} />} {/* Render the icon if it's provided */}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

