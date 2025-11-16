// frontend/src/pages/statistics/components/SectionCard.jsx
import React from "react";

// Update to accept a 'headerAction' prop for icons or buttons
export default function SectionCard({ title, children, headerAction }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 space-y-4 border border-gray-100">
      {/* Header section that now includes an optional action item */}
      {title && (
        <div className="flex justify-between items-center">
          <h3 className="header-sm">{title}</h3>
          {/* Render the action item (e.g., an icon) if it's provided */}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}