// frontend/src/pages/statistics/components/DoughnutChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// The `options` prop has been removed. The component now handles its own styling.
export default function DoughnutChart({ data }) {
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // This creates the doughnut hole
    plugins: {
      legend: {
        display: false, // This is the critical line that removes the broken default legend.
      },
      tooltip: {
        enabled: true, // Keep the hover tooltips
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

