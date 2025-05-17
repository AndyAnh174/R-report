import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ExperienceLevelDistribution } from '../types/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ExperienceLevelChartProps {
  data: ExperienceLevelDistribution[] | null;
  loading: boolean;
}

const ExperienceLevelChart: React.FC<ExperienceLevelChartProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(level => level.ExperienceLevel),
    datasets: [
      {
        label: 'Tỷ lệ thu nhập cao (%)',
        data: data.map(level => level.high_earner_percentage),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Thu nhập trung bình (USD)',
        data: data.map(level => level.mean_earnings / 1000), // Chia 1000 để hiển thị dưới dạng K (nghìn)
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mức kinh nghiệm, Tỷ lệ thu nhập cao và Thu nhập trung bình',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            if (label.includes('Tỷ lệ')) {
              return `${label}: ${value.toFixed(1)}%`;
            } else if (label.includes('Thu nhập')) {
              return `${label}: $${(value * 1000).toLocaleString()}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Tỷ lệ thu nhập cao (%)'
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Thu nhập trung bình (nghìn USD)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Bar data={chartData} options={options} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        {data.map(level => (
          <div key={level.ExperienceLevel} className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-800">{level.ExperienceLevel}</h4>
            <div className="mt-2">
              <p>Số lượng freelancer: <span className="font-medium">{level.count}</span></p>
              <p>Tỷ lệ thu nhập cao: <span className="font-medium">{level.high_earner_percentage.toFixed(1)}%</span></p>
              <p>Thu nhập trung bình: <span className="font-medium">${Math.round(level.mean_earnings).toLocaleString()}</span></p>
              <p>Thu nhập trung vị: <span className="font-medium">${Math.round(level.median_earnings).toLocaleString()}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceLevelChart; 