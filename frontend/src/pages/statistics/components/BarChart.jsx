import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Custom rounded bar plugin
const roundedBarPlugin = {
  id: "roundedBar",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const radius = 8; // adjust for more/less rounding
        const { x, y, base } = bar;
        const barWidth = bar.width;
        const barHeight = base - y;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - barWidth / 2, base);
        ctx.lineTo(x - barWidth / 2, y + radius);
        ctx.quadraticCurveTo(x - barWidth / 2, y, x - barWidth / 2 + radius, y);
        ctx.lineTo(x + barWidth / 2 - radius, y);
        ctx.quadraticCurveTo(x + barWidth / 2, y, x + barWidth / 2, y + radius);
        ctx.lineTo(x + barWidth / 2, base);
        ctx.closePath();
        ctx.fillStyle = dataset.backgroundColor[index] || dataset.backgroundColor;
        ctx.fill();
        ctx.restore();
      });
    });
  }
};

ChartJS.register(roundedBarPlugin);

export default function BarChart({ data, colors = [], height = 200 }) {
  // data: [{ label, value, color }]
  const chartData = {
    labels: data.map(d => d.label || d.type),
    datasets: [
      {
        label: "Value",
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.color || "#06B6D4"),
        borderRadius: 8, // Chart.js v4 supports borderRadius natively
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {},
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true }, beginAtZero: true },
    },
  };

  return <Bar data={chartData} options={options} height={height} />;
}
