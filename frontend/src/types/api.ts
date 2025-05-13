export interface SummaryData {
  mean_income: number;
  median_income: number;
  max_income: number;
  min_income: number;
}

export interface JobIncomeData {
  JobCategory: string;
  avg_income: number;
}

export interface GenderIncomeData {
  Gender: string | null;
  avg_income: number;
}

export interface CleanData {
  id: number;
  Earnings_USD: string;
  Job_Category: string;
  Income: number;
  Gender: string | null;
  JobCategory: string;
}

export interface NormalizedData extends CleanData {
  Income_norm: number;
}

export interface ChartJSData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
} 