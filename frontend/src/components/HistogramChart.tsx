import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { EarningsDistribution } from '../types/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HistogramChartProps {
  data: EarningsDistribution | null;
  loading: boolean;
}

const HistogramChart: React.FC<HistogramChartProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = {
    labels: data.histogram.map(item => `$${Math.round(item.x/1000)}k`), // Format to $1k, $2k, etc.
    datasets: [
      {
        label: 'Số lượng Freelancer',
        data: data.histogram.map(item => item.y),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Phân phối Thu nhập của Freelancer',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Số lượng: ${context.parsed.y} freelancer`;
          },
          title: function(context: any) {
            return `Thu nhập: ${context.label}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Thu nhập (USD)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Số lượng Freelancer'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Bar data={chartData} options={options} />
      <div className="mt-4 text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <p className="font-medium">Thu nhập trung bình:</p>
          <p>${Math.round(data.statistics.mean).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">Thu nhập trung vị:</p>
          <p>${Math.round(data.statistics.median).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">Độ lệch chuẩn:</p>
          <p>${Math.round(data.statistics.sd).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium">Khoảng thu nhập:</p>
          <p>${Math.round(data.statistics.min).toLocaleString()} - ${Math.round(data.statistics.max).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default HistogramChart; 