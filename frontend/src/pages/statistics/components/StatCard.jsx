// frontend/src/pages/statistics/components/StatCard.jsx
import React from "react";

export default function StatCard({
  title,
  value,
  subtext,
  iconComponent: Icon = null,
  iconBgColor = "bg-transparent",
  valueColor = "text-gray-900",
  windowWidth = 1024, // Add windowWidth prop
}) {
  const hideIcon = windowWidth <= 500; // Hide icon when width is 500px or less

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 flex justify-around items-center border border-gray-100">
      <div className="flex flex-col justify-between items-centermb-2 max-w-70">
        <div className="flex flex-col">
          <h3 className="font-bold-label">{title}</h3>
          <p className={`main-logo-text-nav text-center mt-1 ${valueColor}`}>{value}</p>
        </div>
        {subtext && <p className="body-sm text-center">{subtext}</p>}
      </div>

      {Icon && !hideIcon && <Icon className="h-[6rem] w-[6rem]" />}
    </div>
  );
}