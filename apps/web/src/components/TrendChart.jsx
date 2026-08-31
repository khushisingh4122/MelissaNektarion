import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// ❌ REMOVED useTheme to avoid circular dependency crash

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = ({ title, data, type = 'line', color = '#22c55e' }) => {
  // ✅ SAFE DEFAULT (no theme dependency)
  const isDark = false;

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const chartData = {
    labels: data.map(item => item.time || item.day || item.date || item.week || item.year),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value || item.probability || item.score || item.efficiency || item.yield),
        borderColor: color,
        backgroundColor: type === 'line' ? `${color}20` : color,
        fill: type === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: { size: 11 }
        }
      }
    }
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ChartComponent data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;