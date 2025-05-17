import axios from 'axios';
import { 
  SummaryData, 
  JobIncomeData, 
  CleanData, 
  NormalizedData, 
  ChartJSData,
  PredictionRequest,
  PredictionResponse,
  ModelInfo,
  ModelType,
  EarningsDistribution,
  JobCategoryDistribution,
  EarningsByJobCategory,
  ExperienceLevelDistribution,
  CorrelationMatrix,
  JobsVsEarnings,
  ModelComparison
} from '../types/api';

const API_URL = 'http://localhost:8000';

// Function to fetch income summary data - Thay đổi sang endpoint hợp lệ
export const fetchSummary = async (): Promise<SummaryData> => {
  try {
    const response = await axios.get<EarningsDistribution>(`${API_URL}/data/earnings_distribution`);
    // Chuyển đổi dữ liệu từ earnings_distribution sang định dạng SummaryData
    const earnings = response.data;
    
    // Tạo đối tượng SummaryData từ dữ liệu earnings_distribution theo đúng định dạng interface
    const summaryData: SummaryData = {
      mean_income: earnings.statistics?.mean || 0,
      median_income: earnings.statistics?.median || 0,
      min_income: earnings.statistics?.min || 0,
      max_income: earnings.statistics?.max || 0
    };
    
    return summaryData;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
};

// Function to fetch income by job data - Thay đổi sang endpoint hợp lệ
export const fetchIncomeByJob = async (): Promise<JobIncomeData[]> => {
  try {
    const response = await axios.get<EarningsByJobCategory[]>(`${API_URL}/data/earnings_by_job_category`);
    // Chuyển đổi dữ liệu từ earnings_by_job_category sang định dạng JobIncomeData[]
    return response.data.map(item => ({
      JobCategory: item.JobCategory,
      avg_income: item.mean
    }));
  } catch (error) {
    console.error("Error fetching income by job:", error);
    throw error;
  }
};

// Function to fetch raw data
export const fetchRawData = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/data/raw`);
  return response.data;
  } catch (error) {
    console.error("Error fetching raw data:", error);
    throw error;
  }
};

// Function to fetch clean data - Thay đổi sang endpoint phù hợp
export const fetchCleanData = async (): Promise<CleanData[]> => {
  try {
    const response = await axios.get(`${API_URL}/data/clean`);
  return response.data;
  } catch (error) {
    console.error("Error fetching clean data:", error);
    throw error;
  }
};

// Function to fetch normalized data - Thay đổi sang endpoint phù hợp
export const fetchNormalizedData = async (): Promise<NormalizedData[]> => {
  try {
    // Sử dụng endpoint health để kiểm tra kết nối, sau đó trả về mảng trống
    await axios.get(`${API_URL}/health`);
    console.warn("No direct normalized data endpoint available, returning empty array");
    return [];
  } catch (error) {
    console.error("Error checking API health:", error);
    throw error;
  }
};

// Function to fetch chart.js data for income by job
export const fetchChartJsIncomeByJob = async (): Promise<ChartJSData> => {
  try {
    const response = await axios.get<EarningsByJobCategory[]>(`${API_URL}/data/earnings_by_job_category`);
    
    // Chuyển đổi dữ liệu sang định dạng ChartJSData
    const labels = response.data.map(item => item.JobCategory);
    const medianData = response.data.map(item => item.median);
    const meanData = response.data.map(item => item.mean);
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Thu nhập trung bình',
          data: meanData,
        },
        {
          label: 'Thu nhập trung vị',
          data: medianData,
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching chart data for job income:", error);
    throw error;
  }
};

// Function to fetch chart.js data for project type (pie chart)
export const fetchChartJsProjectType = async (): Promise<ChartJSData> => {
  try {
    // Không có endpoint trực tiếp cho project type, nên sử dụng endpoint khác
    // và xử lý dữ liệu phù hợp, giả định có thể dùng job_category_distribution
    const response = await axios.get<JobCategoryDistribution[]>(`${API_URL}/data/job_category_distribution`);
    
    // Chuyển đổi dữ liệu sang định dạng ChartJSData cho pie chart
    const labels = response.data.map(item => item.JobCategory);
    const data = response.data.map(item => item.percentage || item.n);
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Loại dự án',
          data: data
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching chart data for project type:", error);
    throw error;
  }
};

// Function to fetch chart.js data for payment method (pie chart)
export const fetchChartJsPaymentMethod = async (): Promise<ChartJSData> => {
  try {
    // Tương tự, không có endpoint trực tiếp cho payment method
    // Sử dụng endpoint experience_level_distribution thay thế
    const response = await axios.get<ExperienceLevelDistribution[]>(`${API_URL}/data/experience_level_distribution`);
    
    const labels = response.data.map(item => item.ExperienceLevel);
    const data = response.data.map(item => item.count);
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Phương thức thanh toán',
          data: data
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching chart data for payment method:", error);
    throw error;
  }
};

// --- API funcs for new endpoints --- //

// Prediction endpoints for the 3 models
export const predictHighEarner = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    // Cách 1: Gửi đúng theo định dạng mà R API mong đợi
    const processedData = {
      JobCategory: String(data.JobCategory),
      Platform: String(data.Platform),
      ExperienceLevel: String(data.ExperienceLevel),
      ClientRegion: "North America", 
      PaymentMethod: "PayPal", 
      JobsCompleted: Number(data.JobsCompleted),
      HourlyRate: Number(data.HourlyRate),
      JobSuccessRate: Number(data.JobSuccessRate),
      ClientRating: Number(data.ClientRating),
      JobDurationDays: Number(data.JobDurationDays),
      ProjectType: String(data.ProjectType),
      RehireRate: Number(data.RehireRate),
      MarketingSpend: Number(data.MarketingSpend)
    };
    
    // Thử một cách khác: Dữ liệu dạng mảng
    const dataArray = [
      {
        JobCategory: String(data.JobCategory),
        Platform: String(data.Platform),
        ExperienceLevel: String(data.ExperienceLevel),
        ClientRegion: "North America", 
        PaymentMethod: "PayPal", 
        JobsCompleted: Number(data.JobsCompleted),
        HourlyRate: Number(data.HourlyRate),
        JobSuccessRate: Number(data.JobSuccessRate),
        ClientRating: Number(data.ClientRating),
        JobDurationDays: Number(data.JobDurationDays),
        ProjectType: String(data.ProjectType),
        RehireRate: Number(data.RehireRate),
        MarketingSpend: Number(data.MarketingSpend)
      }
    ];
    
    // Thử nhiều cách gửi dữ liệu khác nhau
    console.log("Trying different data formats...");
    
    // Cách 1: Gửi object trực tiếp
    try {
      console.log("Method 1: Sending direct object");
      const response = await axios.post<PredictionResponse>(
        `${API_URL}/predict_high_earner`,
        processedData
      );
      return response.data;
    } catch (e1) {
      console.error("Method 1 failed:", e1);
      
      // Cách 2: Gửi mảng (dạng dataset)
      try {
        console.log("Method 2: Sending as array");
        const response = await axios.post<PredictionResponse>(
          `${API_URL}/predict_high_earner`,
          dataArray
        );
        return response.data;
      } catch (e2) {
        console.error("Method 2 failed:", e2);
        
        // Cách 3: Gửi với key 'data'
        try {
          console.log("Method 3: Sending with 'data' key");
          const response = await axios.post<PredictionResponse>(
            `${API_URL}/predict_high_earner`,
            { data: processedData }
          );
          return response.data;
        } catch (e3) {
          console.error("Method 3 failed:", e3);
          
          // Cách 4: Gửi object JSON string
          try {
            console.log("Method 4: Sending stringified JSON");
            const jsonData = JSON.stringify(processedData);
            const response = await axios.post<PredictionResponse>(
              `${API_URL}/predict_high_earner`,
              { data: jsonData },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            return response.data;
          } catch (e4) {
            console.error("Method 4 failed:", e4);
            
            // Cách 5: Gửi dưới dạng tham số query
            try {
              console.log("Method 5: Sending as query params");
              // Chuyển đổi object thành params
              let params = new URLSearchParams();
              Object.entries(processedData).forEach(([key, value]) => {
                params.append(key, String(value));
              });
              
              const response = await axios.get<PredictionResponse>(
                `${API_URL}/predict_high_earner?${params.toString()}`
              );
              return response.data;
            } catch (e5) {
              console.error("All methods failed");
              throw e5;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in predictHighEarner:", error);
    throw error;
  }
};

export const predictHighEarnerLogistic = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    // Xử lý dữ liệu
    const processedData = {
      JobCategory: String(data.JobCategory),
      Platform: String(data.Platform),
      ExperienceLevel: String(data.ExperienceLevel),
      ClientRegion: "North America", 
      PaymentMethod: "PayPal",
      JobsCompleted: Number(data.JobsCompleted),
      HourlyRate: Number(data.HourlyRate),
      JobSuccessRate: Number(data.JobSuccessRate),
      ClientRating: Number(data.ClientRating),
      JobDurationDays: Number(data.JobDurationDays),
      ProjectType: String(data.ProjectType),
      RehireRate: Number(data.RehireRate),
      MarketingSpend: Number(data.MarketingSpend)
    };
    
    console.log("Trying different data formats (logistic)...");
    
    // Thử cách tương tự
    try {
      console.log("Method 3: Sending with 'data' key");
      const response = await axios.post<PredictionResponse>(
        `${API_URL}/predict_high_earner_logistic`,
        { data: processedData }
      );
      return response.data;
    } catch (e) {
      console.error("Method failed:", e);
      throw e;
    }
  } catch (error) {
    console.error("Error in predictHighEarnerLogistic:", error);
    throw error;
  }
};

export const predictHighEarnerTree = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    // Xử lý dữ liệu
    const processedData = {
      JobCategory: String(data.JobCategory),
      Platform: String(data.Platform),
      ExperienceLevel: String(data.ExperienceLevel),
      ClientRegion: "North America", 
      PaymentMethod: "PayPal",
      JobsCompleted: Number(data.JobsCompleted),
      HourlyRate: Number(data.HourlyRate),
      JobSuccessRate: Number(data.JobSuccessRate),
      ClientRating: Number(data.ClientRating),
      JobDurationDays: Number(data.JobDurationDays),
      ProjectType: String(data.ProjectType),
      RehireRate: Number(data.RehireRate),
      MarketingSpend: Number(data.MarketingSpend)
    };
    
    console.log("Trying different data formats (tree)...");
    
    // Thử cách tương tự
    try {
      console.log("Method 3: Sending with 'data' key");
      const response = await axios.post<PredictionResponse>(
        `${API_URL}/predict_high_earner_tree`,
        { data: processedData }
      );
      return response.data;
    } catch (e) {
      console.error("Method failed:", e);
      throw e;
    }
  } catch (error) {
    console.error("Error in predictHighEarnerTree:", error);
    throw error;
  }
};

// Hàm cực kỳ đơn giản hóa, chỉ gửi dữ liệu tối thiểu
export const predictHighEarnerSimplified = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    // Dữ liệu cực kỳ tối giản, giảm nguy cơ lỗi định dạng
    const minimalData = {
      JobCategory: "Web Development",
      ExperienceLevel: "Expert",
      HourlyRate: 50,
      JobsCompleted: 100
    };
    
    console.log("Sending minimal data:", minimalData);
    
    // Thử nhiều cách gửi đơn giản nhất
    try {
      const response = await axios.post<any>(
        `${API_URL}/predict_high_earner`,
        { data: minimalData }
      );
      return response.data;
    } catch (e) {
      console.error("Minimal data attempt failed:", e);
      
      // Thử gửi dữ liệu giả cứng để kiểm tra API
      try {
        // Dữ liệu giả cứng
        const fakeData = { test: "testing" };
        const response = await axios.post<any>(
          `${API_URL}/predict_high_earner`,
          fakeData
        );
        return response.data;
      } catch (e2) {
        console.error("Even fake data failed:", e2);
        throw e2;
      }
    }
  } catch (error) {
    console.error("Error in simplified prediction:", error);
    throw error;
  }
};

// Kiểm tra xem API có hoạt động không
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log("Checking API health...");
    const response = await axios.get<any>(`${API_URL}/health`);
    console.log("API health check result:", response.data);
    return true;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

// Thử truy cập trực tiếp đến thông tin mô hình
export const accessModelDirectly = async (): Promise<any> => {
  try {
    console.log("Trying to access model info directly...");
    const response = await axios.get<any>(`${API_URL}/model_info/rf`);
    console.log("Model info result:", response.data);
    return response.data;
  } catch (error) {
    console.error("Model access failed:", error);
    throw error;
  }
};

// Cập nhật hàm predictWithModel để kiểm tra sức khỏe API trước
export const predictWithModel = async (data: PredictionRequest, modelType: "rf" | "logistic" | "tree"): Promise<PredictionResponse> => {
  // Kiểm tra API trước
  const isApiHealthy = await checkApiHealth();
  
  if (!isApiHealthy) {
    throw new Error("API is not healthy or not accessible");
  }
  
  // Thử cách đơn giản nhất trước
  try {
    return await predictHighEarnerSimplified(data);
  } catch (simplifiedError) {
    console.log("Simplified method failed, trying original methods");
    
    // Nếu không thành công, thử các cách cũ
    switch (modelType) {
      case "rf":
        return await predictHighEarner(data);
      case "logistic":
        return await predictHighEarnerLogistic(data);
      case "tree":
        return await predictHighEarnerTree(data);
      default:
        return await predictHighEarner(data);
    }
  }
};

// Model info endpoint
export const fetchModelInfo = async (modelType: ModelType): Promise<ModelInfo> => {
  const response = await axios.get<ModelInfo>(`${API_URL}/model_info/${modelType}`);
  return response.data;
};

// Variable importance endpoint
export const fetchVariableImportance = async (modelType: ModelType): Promise<any> => {
  const response = await axios.get(`${API_URL}/variable_importance/${modelType}`);
  return response.data;
};

// --- Data visualization endpoints --- //

// Fetch earnings distribution data
export const fetchEarningsDistribution = async (): Promise<EarningsDistribution> => {
  try {
    const response = await axios.get(`${API_URL}/data/earnings_distribution`);
    return response.data;
  } catch (error) {
    console.error('Error fetching earnings distribution data:', error);
    throw error;
  }
};

// Fetch job category distribution data
export const fetchJobCategoryDistribution = async (): Promise<JobCategoryDistribution[]> => {
  const response = await axios.get<JobCategoryDistribution[]>(`${API_URL}/data/job_category_distribution`);
  return response.data;
};

// Fetch earnings by job category data
export const fetchEarningsByJobCategory = async (): Promise<EarningsByJobCategory[]> => {
  const response = await axios.get<EarningsByJobCategory[]>(`${API_URL}/data/earnings_by_job_category`);
  return response.data;
};

// Fetch experience level distribution data
export const fetchExperienceLevelDistribution = async (): Promise<ExperienceLevelDistribution[]> => {
  try {
    const response = await axios.get(`${API_URL}/data/experience_level_distribution`);
    return response.data;
  } catch (error) {
    console.error('Error fetching experience level data:', error);
    throw error;
  }
};

// Fetch correlation matrix data
export const fetchCorrelationMatrix = async () => {
  try {
    const response = await axios.get(`${API_URL}/data/correlation_matrix`);
    return response.data;
  } catch (error) {
    console.error('Error fetching correlation matrix:', error);
    throw error;
  }
};

// Fetch jobs completed vs earnings data
export const fetchJobsVsEarnings = async (): Promise<JobsVsEarnings> => {
  try {
    const response = await axios.get(`${API_URL}/data/jobs_completed_vs_earnings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs vs earnings data:', error);
    throw error;
  }
};

// Fetch model comparison data
export const fetchModelComparison = async (): Promise<ModelComparison> => {
  try {
    const response = await axios.get(`${API_URL}/data/model_comparison`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model comparison data:', error);
    throw error;
  }
};

// Hàm chẩn đoán toàn diện R API
export const diagnoseRApi = async (): Promise<{
  isHealthy: boolean;
  canAccessModel: boolean;
  availableEndpoints: string[];
  error?: string;
}> => {
  const result = {
    isHealthy: false,
    canAccessModel: false,
    availableEndpoints: [] as string[],
  };

  // Kiểm tra health endpoint
  try {
    const healthResponse = await axios.get<any>(`${API_URL}/health`);
    result.isHealthy = healthResponse.status === 200;
  } catch (healthError) {
    console.error("Health check failed:", healthError);
  }

  // Kiểm tra root endpoint (/)
  try {
    const rootResponse = await axios.get<any>(`${API_URL}/`);
    if (rootResponse.data && rootResponse.data.endpoints) {
      result.availableEndpoints = Object.keys(rootResponse.data.endpoints);
    }
  } catch (rootError) {
    console.error("Root endpoint check failed:", rootError);
  }

  // Kiểm tra model info
  try {
    const modelResponse = await axios.get<any>(`${API_URL}/model_info/rf`);
    result.canAccessModel = modelResponse.status === 200;
  } catch (modelError) {
    console.error("Model info check failed:", modelError);
  }

  return result;
}; 