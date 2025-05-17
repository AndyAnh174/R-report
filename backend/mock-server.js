const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// Bật CORS cho tất cả routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running smoothly!' });
});

// Summary endpoint
app.get('/summary', (req, res) => {
  res.json([{
    mean_income: 4850.75,
    median_income: 3200.50,
    max_income: 15000.00,
    min_income: 500.00
  }]);
});

// Clean data endpoint
app.get('/clean_data', (req, res) => {
  const mockData = [];
  for (let i = 1; i <= 20; i++) {
    mockData.push({
      ClientRegion: `Region ${i % 5 + 1}`,
      id: i,
      Earnings_USD: `${Math.floor(Math.random() * 10000) + 1000}`,
      Job_Category: ['Web Development', 'App Development', 'Content Writing', 'Design', 'Marketing'][i % 5],
      Income: Math.floor(Math.random() * 10000) + 1000,
      Gender: Math.random() > 0.3 ? 'Male' : 'Female',
      JobCategory: ['Web Development', 'App Development', 'Content Writing', 'Design', 'Marketing'][i % 5]
    });
  }
  res.json(mockData);
});

// Mock chart data endpoints
app.get('/chartjs_income_by_job', (req, res) => {
  res.json({
    labels: ['Web Development', 'App Development', 'Content Writing', 'Design', 'Marketing'],
    datasets: [{
      label: 'Avg Income (USD)',
      data: [6500, 8200, 3500, 4500, 5000]
    }]
  });
});

app.get('/chartjs_project_type', (req, res) => {
  res.json({
    labels: ['Hourly', 'Fixed'],
    datasets: [{
      label: 'Project Types',
      data: [65, 35]
    }]
  });
});

app.get('/chartjs_payment_method', (req, res) => {
  res.json({
    labels: ['PayPal', 'Bank Transfer', 'Credit Card', 'Other'],
    datasets: [{
      label: 'Payment Methods',
      data: [45, 30, 20, 5]
    }]
  });
});

// Prediction endpoints
const handlePrediction = (req, res, modelType) => {
  const { ExperienceLevel, HourlyRate } = req.body;
  
  // Đơn giản hóa logic dự đoán (thực tế sẽ phức tạp hơn)
  let highEarner = false;
  let probability = 0.2;
  
  // Kinh nghiệm cao hoặc giá theo giờ cao tăng khả năng thu nhập cao
  if (ExperienceLevel === 'Expert' || HourlyRate > 40) {
    highEarner = true;
    probability = 0.7 + Math.random() * 0.25; // 70-95%
  } else if (ExperienceLevel === 'Intermediate' && HourlyRate > 25) {
    highEarner = Math.random() > 0.4;
    probability = 0.4 + Math.random() * 0.3; // 40-70%
  } else {
    highEarner = Math.random() > 0.8; // Có khả năng thấp
    probability = Math.random() * 0.4; // 0-40%
  }

  res.json({
    model_used: modelType,
    predicted_class: highEarner ? "Yes" : "No", 
    probability_HighEarner_Yes: probability,
    probability_HighEarner_No: 1 - probability
  });
};

app.post('/predict_high_earner', (req, res) => {
  handlePrediction(req, res, 'rf');
});

app.post('/predict_high_earner_logistic', (req, res) => {
  handlePrediction(req, res, 'logistic');
});

app.post('/predict_high_earner_tree', (req, res) => {
  handlePrediction(req, res, 'tree');
});

// Data visualization endpoints
app.get('/data/earnings_distribution', (req, res) => {
  res.json({
    histogram: Array.from({length: 20}, (_, i) => ({x: 1000 + i * 500, y: Math.floor(Math.random() * 30)})),
    boxplot: {
      min: 800,
      q1: 2500,
      median: 4200,
      q3: 7800,
      max: 15000,
      outliers: [18000, 21000, 25000]
    },
    statistics: {
      mean: 5200,
      median: 4200,
      min: 800,
      max: 15000,
      sd: 3200,
      q1: 2500,
      q3: 7800
    }
  });
});

// Model info
app.get('/model_info/:model_type', (req, res) => {
  const { model_type } = req.params;
  res.json({
    model_name: model_type === 'rf' ? 'Random Forest' : 
               (model_type === 'logistic' ? 'Logistic Regression' : 'Decision Tree'),
    model_type: model_type,
    best_tune: {param: "value"},
    cv_roc_on_train: 0.85
  });
});

// Bắt đầu server
app.listen(port, () => {
  console.log(`Mock API server đang chạy tại http://localhost:${port}`);
}); 