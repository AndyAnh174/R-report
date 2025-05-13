import React from 'react';
import { SummaryData } from '../types/api';

interface SummaryCardProps {
  data: SummaryData | null;
  loading: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const metrics = [
    { title: 'Thu Nhập Trung Bình', value: formatCurrency(data.mean_income), color: 'bg-blue-100 text-blue-800' },
    { title: 'Thu Nhập Trung Vị', value: formatCurrency(data.median_income), color: 'bg-green-100 text-green-800' },
    { title: 'Thu Nhập Thấp Nhất', value: formatCurrency(data.min_income), color: 'bg-red-100 text-red-800' },
    { title: 'Thu Nhập Cao Nhất', value: formatCurrency(data.max_income), color: 'bg-purple-100 text-purple-800' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Tổng Quan Thu Nhập Freelancer</h2>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg ${metric.color}`}>
            <p className="text-sm font-medium">{metric.title}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard; 