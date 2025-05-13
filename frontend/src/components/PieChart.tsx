import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ChartJSData } from '../types/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: ChartJSData | null;
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, loading }) => {
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!data) return <div>Không có dữ liệu</div>;

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((ds, idx) => ({
      ...ds,
      backgroundColor: [
        '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#8BC34A', '#E91E63', '#00BCD4'
      ],
      borderWidth: 1
    }))
  };

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart; 