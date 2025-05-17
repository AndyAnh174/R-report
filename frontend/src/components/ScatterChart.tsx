import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { JobsVsEarnings } from '../types/api';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterChartProps {
  data: JobsVsEarnings | null;
  loading: boolean;
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Kiểm tra scatter_data có tồn tại không
  if (!data.scatter_data || data.scatter_data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Mối Quan Hệ Công Việc - Thu Nhập</h3>
        <div className="text-center py-10">Không có dữ liệu để hiển thị.</div>
      </div>
    );
  }

  // Dữ liệu cho biểu đồ scatter
  const chartData = {
    datasets: [
      {
        label: 'Beginner',
        data: data.scatter_data
          .filter(item => item.ExperienceLevel === 'Beginner')
          .map(item => ({ x: item.JobsCompleted, y: item.EarningsUSD })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Intermediate',
        data: data.scatter_data
          .filter(item => item.ExperienceLevel === 'Intermediate')
          .map(item => ({ x: item.JobsCompleted, y: item.EarningsUSD })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Expert',
        data: data.scatter_data
          .filter(item => item.ExperienceLevel === 'Expert')
          .map(item => ({ x: item.JobsCompleted, y: item.EarningsUSD })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }
    ]
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Số lượng công việc hoàn thành'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Thu nhập (USD)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const y = context.parsed.y;
            const x = context.parsed.x;
            
            // Kiểm tra giá trị trước khi định dạng
            return `${context.dataset.label}: $${y ? y.toLocaleString() : 'N/A'} (${x || 0} công việc)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Mối Quan Hệ Công Việc - Thu Nhập</h3>
      <Scatter data={chartData} options={options} />
      <div className="mt-4">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Thông tin phân tích:</p>
          <p>Hệ số tương quan: <span className="font-semibold">{typeof data.correlation === 'number' ? data.correlation.toFixed(2) : 'N/A'}</span></p>
          <p>Có mối tương quan {typeof data.correlation === 'number' && data.correlation > 0.5 ? 'mạnh' : 'trung bình'} giữa số lượng công việc và thu nhập.</p>
          <p>Phương trình hồi quy: y = {typeof data.regression?.slope === 'number' ? data.regression.slope.toFixed(2) : '0.00'}x + {data.regression?.intercept ? Math.round(data.regression.intercept).toLocaleString() : '0'}</p>
          <p>R² = {typeof data.regression?.r_squared === 'number' ? data.regression.r_squared.toFixed(3) : '0.000'} (độ khớp của mô hình)</p>
        </div>
      </div>
    </div>
  );
};

export default ScatterChart; 