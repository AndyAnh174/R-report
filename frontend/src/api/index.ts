import axios from 'axios';
import { SummaryData, JobIncomeData, CleanData, NormalizedData, ChartJSData } from '../types/api';

const API_URL = 'http://localhost:8000';

// Function to fetch income summary data
export const fetchSummary = async (): Promise<SummaryData> => {
  const response = await axios.get<SummaryData[]>(`${API_URL}/summary`);
  return response.data[0];
};

// Function to fetch income by job data
export const fetchIncomeByJob = async (): Promise<JobIncomeData[]> => {
  const response = await axios.get<JobIncomeData[]>(`${API_URL}/income_by_job`);
  return response.data;
};

// Function to fetch clean data
export const fetchCleanData = async (): Promise<CleanData[]> => {
  const response = await axios.get<CleanData[]>(`${API_URL}/clean_data`);
  return response.data;
};

// Function to fetch normalized data
export const fetchNormalizedData = async (): Promise<NormalizedData[]> => {
  const response = await axios.get<NormalizedData[]>(`${API_URL}/normalized_data`);
  return response.data;
};

// Function to fetch chart.js data for income by job
export const fetchChartJsIncomeByJob = async (): Promise<ChartJSData> => {
  const response = await axios.get<ChartJSData>(`${API_URL}/chartjs_income_by_job`);
  return response.data;
};

// Function to fetch chart.js data for project type (pie chart)
export const fetchChartJsProjectType = async (): Promise<ChartJSData> => {
  const response = await axios.get<ChartJSData>(`${API_URL}/chartjs_project_type`);
  return response.data;
};

// Function to fetch chart.js data for payment method (pie chart)
export const fetchChartJsPaymentMethod = async (): Promise<ChartJSData> => {
  const response = await axios.get<ChartJSData>(`${API_URL}/chartjs_payment_method`);
  return response.data;
}; 