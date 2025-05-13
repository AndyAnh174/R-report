import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import JobIncomeChart from '../components/JobIncomeChart';
import DataTable from '../components/DataTable';
import PieChart from '../components/PieChart';  
import {
  fetchSummary,
  fetchCleanData,
  fetchChartJsIncomeByJob,
  fetchChartJsProjectType,
  fetchChartJsPaymentMethod
} from '../api';
import { SummaryData, CleanData, ChartJSData } from '../types/api';

const Dashboard: React.FC = () => {
  // State
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [cleanData, setCleanData] = useState<CleanData[] | null>(null);
  const [jobChartData, setJobChartData] = useState<ChartJSData | null>(null);
  const [projectTypeData, setProjectTypeData] = useState<ChartJSData | null>(null);
  const [paymentMethodData, setPaymentMethodData] = useState<ChartJSData | null>(null);
  const [loading, setLoading] = useState({
    summary: true,
    cleanData: true,
    jobChart: true,
    projectType: true,
    paymentMethod: true
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summary data
        const summary = await fetchSummary();
        setSummaryData(summary);
        setLoading(prev => ({ ...prev, summary: false }));

        // Fetch clean data for table
        const cleanDataResult = await fetchCleanData();
        setCleanData(cleanDataResult);
        setLoading(prev => ({ ...prev, cleanData: false }));

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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading({
          summary: false,
          cleanData: false,
          jobChart: false,
          projectType: false,
          paymentMethod: false
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Phân Tích Thu Nhập Freelancer</h1>
          <p className="text-blue-100 mt-2">Dữ liệu và thống kê về thu nhập freelancer từ nhiều ngành nghề khác nhau</p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Summary Section */}
        <section className="mb-8">
          <SummaryCard data={summaryData} loading={loading.summary} />
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Thu Nhập Theo Loại Công Việc</h2>
            <JobIncomeChart data={jobChartData} loading={loading.jobChart} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tỷ Lệ Loại Hình Dự Án</h2>
            <PieChart data={projectTypeData} loading={loading.projectType} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tỷ Lệ Phương Thức Thanh Toán</h2>
            <PieChart data={paymentMethodData} loading={loading.paymentMethod} />
          </div>
        </section>

        {/* Data Table Section */}
        <section className="mb-8">
          <DataTable data={cleanData} loading={loading.cleanData} />
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4 md:p-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Phân Tích Thu Nhập Freelancer. Dữ liệu từ Kaggle.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 