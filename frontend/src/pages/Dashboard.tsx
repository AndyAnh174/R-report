import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import JobIncomeChart from '../components/JobIncomeChart';
import DataTable from '../components/DataTable';
import PieChart from '../components/PieChart';  
import HistogramChart from '../components/HistogramChart';
import ScatterChart from '../components/ScatterChart';
import ModelComparisonChart from '../components/ModelComparisonChart';
import ExperienceLevelChart from '../components/ExperienceLevelChart';
import {
  fetchSummary,
  fetchCleanData,
  fetchChartJsIncomeByJob,
  fetchChartJsProjectType,
  fetchChartJsPaymentMethod,
  fetchEarningsDistribution,
  fetchExperienceLevelDistribution,
  fetchCorrelationMatrix,
  fetchJobsVsEarnings,
  fetchModelComparison
} from '../api';
import { SummaryData, CleanData, ChartJSData, EarningsDistribution, ExperienceLevelDistribution, JobsVsEarnings, ModelComparison } from '../types/api';

const Dashboard: React.FC = () => {
  // State
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [cleanData, setCleanData] = useState<CleanData[] | null>(null);
  const [jobChartData, setJobChartData] = useState<ChartJSData | null>(null);
  const [projectTypeData, setProjectTypeData] = useState<ChartJSData | null>(null);
  const [paymentMethodData, setPaymentMethodData] = useState<ChartJSData | null>(null);
  const [earningsDistribution, setEarningsDistribution] = useState<EarningsDistribution | null>(null);
  const [experienceLevelData, setExperienceLevelData] = useState<ExperienceLevelDistribution[] | null>(null);
  const [jobsVsEarningsData, setJobsVsEarningsData] = useState<JobsVsEarnings | null>(null);
  const [modelComparisonData, setModelComparisonData] = useState<ModelComparison | null>(null);
  
  const [loading, setLoading] = useState({
    summary: true,
    cleanData: true,
    jobChart: true,
    projectType: true,
    paymentMethod: true,
    earningsDistribution: true,
    experienceLevel: true,
    jobsVsEarnings: true,
    modelComparison: true
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clean data for table (ưu tiên fetch data đầu tiên)
        const cleanDataResult = await fetchCleanData();
        setCleanData(cleanDataResult);
        setLoading(prev => ({ ...prev, cleanData: false }));
        
        // Fetch summary data
        const summary = await fetchSummary();
        setSummaryData(summary);
        setLoading(prev => ({ ...prev, summary: false }));

        // Fetch job income chart data
        const jobChart = await fetchChartJsIncomeByJob();
        setJobChartData(jobChart);
        setLoading(prev => ({ ...prev, jobChart: false }));

        // Fetch project type pie chart data
        const projectType = await fetchChartJsProjectType();
        setProjectTypeData(projectType);
        setLoading(prev => ({ ...prev, projectType: false }));

        // Fetch payment method pie chart data
        const paymentMethod = await fetchChartJsPaymentMethod();
        setPaymentMethodData(paymentMethod);
        setLoading(prev => ({ ...prev, paymentMethod: false }));
        
        // Fetch earnings distribution data
        const earningsData = await fetchEarningsDistribution();
        setEarningsDistribution(earningsData);
        setLoading(prev => ({ ...prev, earningsDistribution: false }));
        
        // Fetch experience level data
        const expLevelData = await fetchExperienceLevelDistribution();
        setExperienceLevelData(expLevelData);
        setLoading(prev => ({ ...prev, experienceLevel: false }));
        
        // Fetch jobs vs earnings data
        const jobsEarningsData = await fetchJobsVsEarnings();
        setJobsVsEarningsData(jobsEarningsData);
        setLoading(prev => ({ ...prev, jobsVsEarnings: false }));
        
        // Fetch model comparison data
        const modelCompData = await fetchModelComparison();
        setModelComparisonData(modelCompData);
        setLoading(prev => ({ ...prev, modelComparison: false }));
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading({
          summary: false,
          cleanData: false,
          jobChart: false,
          projectType: false,
          paymentMethod: false,
          earningsDistribution: false,
          experienceLevel: false,
          jobsVsEarnings: false,
          modelComparison: false
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 md:p-6">
        <div className="container mx-auto max-w-full px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Trực Quan Hóa Thu Nhập Freelancer</h1>
          <p className="text-blue-100 mt-2">Biểu đồ và thống kê về thu nhập freelancer từ nhiều ngành nghề khác nhau</p>
        </div>
      </header>

      <main className="container mx-auto max-w-full px-4 py-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Data Table Section - Đặt lên đầu tiên */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Dữ Liệu Freelancer</h2>
          <DataTable data={cleanData} loading={loading.cleanData} />
        </section>

        {/* Summary Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Tổng Quan Thu Nhập</h2>
          <SummaryCard data={summaryData} loading={loading.summary} />
        </section>
        
        {/* Earnings Distribution Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Phân phối Thu Nhập Freelancer</h2>
          <HistogramChart data={earningsDistribution} loading={loading.earningsDistribution} />
        </section>

        {/* Thu Nhập Theo Loại Công Việc */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Thu Nhập Theo Loại Công Việc</h2>
          <JobIncomeChart data={jobChartData} loading={loading.jobChart} />
        </section>
        
        {/* Tỷ Lệ Loại Hình Dự Án */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Tỷ Lệ Loại Hình Dự Án</h2>
          <PieChart data={projectTypeData} loading={loading.projectType} />
        </section>
        
        {/* Experience Level Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Mức Kinh Nghiệm & Thu Nhập</h2>
          <ExperienceLevelChart data={experienceLevelData} loading={loading.experienceLevel} />
        </section>
        
        {/* Jobs vs Earnings Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Mối Quan Hệ Công Việc - Thu Nhập</h2>
          <ScatterChart data={jobsVsEarningsData} loading={loading.jobsVsEarnings} />
        </section>
        
        {/* Model Comparison Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">So Sánh Hiệu Suất Các Mô Hình</h2>
          <ModelComparisonChart data={modelComparisonData} loading={loading.modelComparison} />
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4 md:p-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Trực Quan Hóa Thu Nhập Freelancer. Dữ liệu từ Kaggle.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 