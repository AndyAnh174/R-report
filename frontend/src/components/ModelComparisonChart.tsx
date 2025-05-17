import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ModelComparison } from '../types/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ModelComparisonChartProps {
  data: ModelComparison | null;
  loading: boolean;
}

const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Kiểm tra dữ liệu có đầy đủ không
  if (!data.performance || data.performance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">So Sánh Hiệu Suất Các Mô Hình</h3>
        <div className="text-center py-10">Không có dữ liệu để hiển thị.</div>
      </div>
    );
  }

  const chartData = {
    labels: data.performance.map(model => model.model),
    datasets: [
      {
        label: 'Accuracy',
        data: data.performance.map(model => model.accuracy),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Precision',
        data: data.performance.map(model => model.precision),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Recall',
        data: data.performance.map(model => model.sensitivity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'F1 Score',
        data: data.performance.map(model => model.f1_score),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
      {
        label: 'AUC',
        data: data.performance.map(model => model.auc),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
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
        text: 'So Sánh Hiệu Suất Các Mô Hình',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const measure = context.dataset.label;
            const value = context.parsed.y;
            // Kiểm tra giá trị tồn tại trước khi gọi toFixed
            return `${measure}: ${value !== undefined && value !== null ? value.toFixed(3) : 'N/A'}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Giá trị (0-1)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Bar data={chartData} options={options} />
      <div className="mt-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-800">Các chỉ số đánh giá:</h4>
            <ul className="list-disc pl-5 mt-2">
              <li><span className="font-medium">Accuracy:</span> Tỷ lệ dự đoán đúng tổng thể</li>
              <li><span className="font-medium">Precision:</span> Độ chính xác của dự đoán dương tính</li>
              <li><span className="font-medium">Recall:</span> Khả năng nhận diện mẫu dương tính</li>
              <li><span className="font-medium">F1 Score:</span> Trung bình hài hòa của Precision và Recall</li>
              <li><span className="font-medium">AUC:</span> Diện tích dưới đường cong ROC</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Mô hình hiệu quả nhất:</h4>
            <p className="mt-2">
              {(() => {
                try {
                  const bestModel = data.performance.reduce((best, current) => 
                    (current.auc > best.auc) ? current : best
                  );
                  return <span className="font-medium">{bestModel.model}</span>;
                } catch (error) {
                  return <span>Không xác định</span>;
                }
              })()}
            </p>
            <p>
              AUC cao nhất: {(() => {
                try {
                  const bestModel = data.performance.reduce((best, current) => 
                    (current.auc > best.auc) ? current : best
                  );
                  return <span className="font-medium">{bestModel.auc?.toFixed(3) || 'N/A'}</span>;
                } catch (error) {
                  return <span>N/A</span>;
                }
              })()}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Lưu ý:</h4>
            <p className="mt-2 italic text-gray-600">{'Random Forest thường hoạt động tốt nhất trong việc dự đoán thu nhập cao của freelancer.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonChart; 