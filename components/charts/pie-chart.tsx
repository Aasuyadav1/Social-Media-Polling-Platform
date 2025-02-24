"use client"

import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

interface PieChartProps {
  data: {
    labels: string[]
    values: number[]
  }
}

export default function PieChart({ data }: PieChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          "rgba(147, 51, 234, 0.7)",  // Purple
          "rgba(59, 130, 246, 0.7)",  // Blue
          "rgba(16, 185, 129, 0.7)",  // Green
          "rgba(239, 68, 68, 0.7)",   // Red
          "rgba(245, 158, 11, 0.7)",  // Yellow
          "rgba(99, 102, 241, 0.7)",  // Indigo
        ],
        borderColor: [
          "rgb(147, 51, 234)",
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
          "rgb(99, 102, 241)",
        ],
        borderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} votes (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeInOutQuart",
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  }

  return <Pie data={chartData} options={options} />
}
