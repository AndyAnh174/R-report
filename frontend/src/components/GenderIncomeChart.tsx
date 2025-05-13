import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartJSData } from '../types/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface GenderIncomeChartProps {
  data: ChartJSData | null;
  loading: boolean;
}

const GenderIncomeChart: React.FC<GenderIncomeChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  // Map labels to make them more readable (handle null/undefined values)
  const formattedLabels = data.labels.map(label => {
    if (label === null || label === undefined || label === 'NA') {
      return 'Không xác định';
    }
    return label;
  });

  const chartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Thu Nhập Trung Bình (USD)',
        data: data.datasets[0].data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thu Nhập Theo Giới Tính',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
              }).format(context.raw);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GenderIncomeChart; 