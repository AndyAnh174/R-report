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
  FreelancerID?: string;
  JobCategory?: string;
  Platform?: string;
  ExperienceLevel?: string;
  ClientRegion?: string;
  PaymentMethod?: string;
  JobsCompleted?: number;
  EarningsUSD?: number;
  HourlyRate?: number;
  JobSuccessRate?: number;
  ClientRating?: number;
  JobDurationDays?: number;
  ProjectType?: string;
  RehireRate?: number;
  MarketingSpend?: number;
  [key: string]: any; // Để hỗ trợ các trường bổ sung khác
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

export interface PredictionRequest {
  JobCategory?: string;
  Platform?: string;
  ExperienceLevel?: string;
  ClientRegion?: string;
  PaymentMethod?: string;
  JobsCompleted?: number;
  HourlyRate?: number;
  JobSuccessRate?: number;
  ClientRating?: number;
  JobDurationDays?: number;
  ProjectType?: string;
  RehireRate?: number;
  MarketingSpend?: number;
}

export interface PredictionResponse {
  model_used: string;
  predicted_class: "Yes" | "No";
  probability_HighEarner_Yes: number;
  probability_HighEarner_No: number;
  error?: string;
  note?: string;
}

export interface ModelInfo {
  model_name: string; 
  model_type: string;
  best_tune: any;
  cv_roc_on_train: number;
}

export type ModelType = "rf" | "logistic" | "tree";

// Interfaces for visualization data
export interface EarningsDistribution {
  histogram: {x: number; y: number}[];
  boxplot: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
  };
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    sd: number;
    q1: number;
    q3: number;
  }
}

export interface JobCategoryDistribution {
  JobCategory: string;
  n: number;
  percentage: number;
}

export interface EarningsByJobCategory {
  JobCategory: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  sd: number;
  count: number;
}

export interface ExperienceLevelDistribution {
  ExperienceLevel: string;
  count: number;
  high_earner_count: number;
  high_earner_percentage: number;
  mean_earnings: number;
  median_earnings: number;
}

export interface CorrelationMatrix {
  correlation_matrix: Record<string, number>[];
  variables: string[];
}

export interface JobsVsEarnings {
  scatter_data?: {
    JobsCompleted?: number;
    EarningsUSD?: number;
    ExperienceLevel?: string;
  }[];
  correlation?: number;
  regression?: {
    intercept?: number;
    slope?: number;
    r_squared?: number;
  }
}

export interface ModelComparison {
  performance: {
    model: string;
    accuracy: number;
    sensitivity: number;
    specificity: number;
    precision: number;
    f1_score: number;
    auc: number;
  }[];
  roc_curves: {
    logistic: {specificity: number; sensitivity: number}[];
    tree: {specificity: number; sensitivity: number}[];
    rf: {specificity: number; sensitivity: number}[];
  };
  auc_values: {
    logistic: number;
    tree: number;
    rf: number;
  };
  error?: string;
} 