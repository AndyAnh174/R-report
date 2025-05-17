import React, { useState } from 'react';
import { PredictionRequest, PredictionResponse, ModelType } from '../types/api';
import { predictWithModel } from '../api';

interface PredictionFormProps {
  onResult: (result: PredictionResponse) => void;
  onLoading: (loading: boolean) => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onResult, onLoading }) => {
  const [formData, setFormData] = useState<PredictionRequest>({
    JobCategory: 'Web Development',
    Platform: 'Upwork',
    ExperienceLevel: 'Intermediate',
    JobsCompleted: 50,
    HourlyRate: 25,
    JobSuccessRate: 85,
    ClientRating: 4.5,
    JobDurationDays: 15,
    ProjectType: 'Hourly',
    RehireRate: 60,
    MarketingSpend: 100
  });

  const [selectedModel, setSelectedModel] = useState<ModelType>('rf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for dropdowns
  const jobCategories = [
    'Web Development', 'App Development', 'Content Writing',
    'Data Entry', 'Digital Marketing', 'Graphic Design',
    'Customer Support', 'Video Editing'
  ];

  const platforms = ['Upwork', 'Fiverr', 'Freelancer', 'Toptal', 'PeoplePerHour'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Expert'];
  const projectTypes = ['Hourly', 'Fixed'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['JobsCompleted', 'HourlyRate', 'JobSuccessRate', 
               'ClientRating', 'JobDurationDays', 'RehireRate', 
               'MarketingSpend'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onLoading(true);
    
    try {
      const result = await predictWithModel(formData, selectedModel);
      onResult(result);
    } catch (err) {
      console.error('Error making prediction:', err);
      // Trả về kết quả giả nếu có lỗi
      onResult({
        model_used: selectedModel,
        predicted_class: 'No',
        probability_HighEarner_Yes: 0,
        probability_HighEarner_No: 1,
        error: 'Lỗi kết nối API',
        note: 'Dữ liệu giả tạo do lỗi kết nối'
      });
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Dự Đoán Thu Nhập Cao</h2>
      
      {/* Thông báo về dữ liệu giả */}
      <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
        <p><span className="font-bold">Lưu ý:</span> Chức năng dự đoán sử dụng dữ liệu giả chỉ dành cho mục đích minh họa.</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Mô Hình Dự Đoán</label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${selectedModel === 'rf' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setSelectedModel('rf')}
          >
            Random Forest
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${selectedModel === 'logistic' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setSelectedModel('logistic')}
          >
            Logistic Regression
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${selectedModel === 'tree' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setSelectedModel('tree')}
          >
            Decision Tree
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Categorical inputs */}
          <div>
            <label htmlFor="JobCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Loại Công Việc
            </label>
            <select
              id="JobCategory"
              name="JobCategory"
              value={formData.JobCategory}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {jobCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="Platform" className="block text-sm font-medium text-gray-700 mb-1">
              Nền Tảng
            </label>
            <select
              id="Platform"
              name="Platform"
              value={formData.Platform}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="ExperienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Mức Kinh Nghiệm
            </label>
            <select
              id="ExperienceLevel"
              name="ExperienceLevel"
              value={formData.ExperienceLevel}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="ProjectType" className="block text-sm font-medium text-gray-700 mb-1">
              Loại Dự Án
            </label>
            <select
              id="ProjectType"
              name="ProjectType"
              value={formData.ProjectType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Numeric inputs - Chỉ giữ các trường quan trọng nhất */}
          <div>
            <label htmlFor="JobsCompleted" className="block text-sm font-medium text-gray-700 mb-1">
              Công Việc Đã Hoàn Thành
            </label>
            <input
              type="number"
              id="JobsCompleted"
              name="JobsCompleted"
              value={formData.JobsCompleted}
              onChange={handleInputChange}
              min="0"
              max="1000"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="HourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
              Tỷ Lệ Giờ (USD)
            </label>
            <input
              type="number"
              id="HourlyRate"
              name="HourlyRate"
              value={formData.HourlyRate}
              onChange={handleInputChange}
              min="0"
              max="500"
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="ClientRating" className="block text-sm font-medium text-gray-700 mb-1">
              Đánh Giá Khách Hàng (1-5)
            </label>
            <input
              type="number"
              id="ClientRating"
              name="ClientRating"
              value={formData.ClientRating}
              onChange={handleInputChange}
              min="1"
              max="5"
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="JobSuccessRate" className="block text-sm font-medium text-gray-700 mb-1">
              Tỷ Lệ Thành Công (%)
            </label>
            <input
              type="number"
              id="JobSuccessRate"
              name="JobSuccessRate"
              value={formData.JobSuccessRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Dự Đoán Thu Nhập'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm; 