// frontend/src/pages/statistics/components/Header.jsx
import React from "react";
// No icons needed directly in this header design based on Image 1

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12"> {/* Adjusted height for better spacing */}
          {/* Logo and Title Section (Left) */}
          <div className="flex items-center space-x-3">
            <img
              className="h-7 w-auto" // Slightly adjusted size to match visual
              src="/favicon.png" // Still using the favicon
              alt="Unbound Manila Foundation Inc. Logo"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500">
                Unbound Manila Foundation Inc.
              </span>
              <span className="text-base font-semibold text-gray-800">
                Case Management System
              </span>
            </div>
          </div>

          {/* Dropdowns Section (Right) */}
          <div className="flex items-center space-x-4">
            {/* Select SPU Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="select-spu" className="text-sm text-gray-600 sr-only">
                Select SPU:
              </label>
              <select
                id="select-spu"
                name="select-spu"
                className="block w-full rounded-md border-gray-300 shadow-sm
                           focus:border-teal-500 focus:ring-teal-500 text-sm py-1.5 pl-3 pr-8" // Added py, pl, pr for styling
              >
                <option>Select SPU:</option>
                <option>SPU North</option>
                <option>SPU South</option>
                <option>SPU East</option>
                <option>SPU West</option>
              </select>
            </div>

            {/* Last 30 Days Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="time-period" className="text-sm text-gray-600 sr-only">
                Time Period:
              </label>
              <select
                id="time-period"
                name="time-period"
                className="block w-full rounded-md border-gray-300 shadow-sm
                           focus:border-teal-500 focus:ring-teal-500 text-sm py-1.5 pl-3 pr-8" // Added py, pl, pr for styling
              >
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}