# api.R
# install.packages("plumber")
# install.packages("tidyverse") # hoặc các package cụ thể bạn dùng
# install.packages("caret")
# install.packages("randomForest") # Nếu rf_model là đối tượng randomForest thuần, còn nếu là từ caret thì caret đủ

library(plumber)
library(tidyverse)
library(caret) # Để dùng predict với đối tượng train từ caret
# Chỉ load RandomForest khi cần thiết
# library(randomForest) 

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

# --- TẢI HOẶC TẠO MÔ HÌNH VÀ THÔNG TIN CẦN THIẾT ---
# Giả định rằng các mô hình đã tồn tại, không cần tạo mới
# Các biến này chỉ cần cho dự đoán, không ảnh hưởng đến trực quan hóa
logistic_model <- NULL
tree_model <- NULL
rf_model <- NULL
pr_required_info <- NULL

# Hàm mới, chỉ tạo thông tin giả về mô hình để các API endpoint hoạt động
try_load_or_create_models <- function() {
  # Chỉ ghi log thông báo và không làm gì với mô hình
  cat("THÔNG BÁO: Chạy ở chế độ trực quan hóa, không tải mô hình dự đoán.\n")
  cat("Đối tượng mô hình được thiết lập NULL để chỉ sử dụng các tính năng trực quan hóa.\n")
  
  # Tạo required_model_info với các thông tin cần thiết
  pr_required_info <<- list(
    model_features = c("JobCategory", "Platform", "ExperienceLevel", "ClientRegion", 
                      "PaymentMethod", "JobsCompleted", "HourlyRate", "JobSuccessRate", 
                      "ClientRating", "JobDurationDays", "ProjectType", "RehireRate", 
                      "MarketingSpend"),
    factor_levels = list(
      ExperienceLevel = c("Beginner", "Intermediate", "Expert"),
      ProjectType = c("Fixed", "Hourly"),
      JobCategory = c("Web Development", "App Development", "Content Writing", 
                      "Data Entry", "Digital Marketing", "Graphic Design",
                      "Customer Support", "Video Editing"),
      Platform = c("Upwork", "Fiverr", "Freelancer", "Toptal", "PeoplePerHour"),
      ClientRegion = c("North America", "Europe", "Asia", "Australia", "Africa", "South America"),
      PaymentMethod = c("PayPal", "Bank Transfer", "Credit Card", "Crypto")
    )
  )
  
  return(TRUE)
}

# Gọi hàm để chuẩn bị API
try_load_or_create_models()

# --- ENDPOINTS CHO API ---

#* @apiTitle Freelancer Income Visualization API
#* @apiDescription API để trực quan hóa dữ liệu thu nhập freelancer.

#* Health check endpoint
#* @get /health
function() {
  list(status = "OK", message = "API is running in visualization-only mode!")
}

#* Lấy toàn bộ dữ liệu từ file CSV
#* @get /data/raw
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv") 
  
  # Chuyển đổi dữ liệu thành format JSON để trả về
  return(as.list(data_raw))
}

#* Lấy dữ liệu đã làm sạch từ file CSV
#* @get /data/clean
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(
      FreelancerID = Freelancer_ID,
      JobCategory = str_to_title(Job_Category),
      Platform = str_to_title(Platform),
      ExperienceLevel = str_to_title(Experience_Level),
      ClientRegion = str_to_title(Client_Region),
      PaymentMethod = str_to_title(Payment_Method),
      JobsCompleted = as.numeric(Job_Completed),
      EarningsUSD = as.numeric(Earnings_USD),
      HourlyRate = as.numeric(Hourly_Rate),
      JobSuccessRate = as.numeric(Job_Success_Rate),
      ClientRating = as.numeric(Client_Rating),
      JobDurationDays = as.numeric(Job_Duration_Days),
      ProjectType = str_to_title(Project_Type),
      RehireRate = as.numeric(Rehire_Rate),
      MarketingSpend = as.numeric(Marketing_Spend)
    ) %>%
    select(
      FreelancerID, JobCategory, Platform, ExperienceLevel, ClientRegion, PaymentMethod,
      JobsCompleted, EarningsUSD, HourlyRate, JobSuccessRate, ClientRating,
      JobDurationDays, ProjectType, RehireRate, MarketingSpend
    )
  
  # Chuyển đổi dữ liệu thành format JSON để trả về
  return(as.list(data_clean))
}

# --- Các hàm dự đoán được sửa lại để trả về giá trị giả ---

#* Dự đoán khả năng thu nhập cao sử dụng Random Forest (MOCK DATA)
#* Yêu cầu đầu vào là một JSON object với các trường dữ liệu của freelancer
#* @post /predict_high_earner
#* @param data:object Dữ liệu đầu vào của freelancer
function(req, data) {
  # Trả về dữ liệu giả
  return(mock_prediction(data, "Random Forest"))
}

#* Dự đoán khả năng thu nhập cao sử dụng Logistic Regression (MOCK DATA)
#* @post /predict_high_earner_logistic
#* @param data:object Dữ liệu đầu vào của freelancer
function(req, data) {
  return(mock_prediction(data, "Logistic Regression"))
}

#* Dự đoán khả năng thu nhập cao sử dụng Decision Tree (MOCK DATA)
#* @post /predict_high_earner_tree
#* @param data:object Dữ liệu đầu vào của freelancer
function(req, data) {
  return(mock_prediction(data, "Decision Tree"))
}

# --- CÁC ENDPOINTS CHO DỮ LIỆU BIỂU ĐỒ (GIỮ NGUYÊN) ---

#* Lấy dữ liệu phân phối thu nhập (EarningsUSD) để vẽ histogram và boxplot
#* @get /data/earnings_distribution
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(EarningsUSD = as.numeric(Earnings_USD))
  
  # Tính toán thống kê cho histogram
  hist_data <- hist(data_clean$EarningsUSD, plot = FALSE, breaks = 30)
  histogram <- data.frame(
    x = hist_data$mids,
    y = hist_data$counts
  )
  
  # Tính toán thống kê cho boxplot
  boxplot_stats <- boxplot.stats(data_clean$EarningsUSD)
  boxplot <- list(
    min = boxplot_stats$stats[1],
    q1 = boxplot_stats$stats[2],
    median = boxplot_stats$stats[3],
    q3 = boxplot_stats$stats[4],
    max = boxplot_stats$stats[5],
    outliers = boxplot_stats$out
  )
  
  # Thêm tính toán thống kê mô tả
  stats <- list(
    mean = mean(data_clean$EarningsUSD),
    median = median(data_clean$EarningsUSD),
    min = min(data_clean$EarningsUSD),
    max = max(data_clean$EarningsUSD),
    sd = sd(data_clean$EarningsUSD),
    q1 = quantile(data_clean$EarningsUSD, 0.25),
    q3 = quantile(data_clean$EarningsUSD, 0.75)
  )
  
  return(list(
    histogram = histogram,
    boxplot = boxplot,
    statistics = stats
  ))
}

#* Lấy dữ liệu số lượng freelancer theo loại công việc để vẽ bar chart
#* @get /data/job_category_distribution
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(JobCategory = str_to_title(Job_Category))
  
  # Tính toán phân phối
  job_category_counts <- data_clean %>%
    count(JobCategory, sort = TRUE) %>%
    mutate(percentage = n / sum(n) * 100)
  
  return(job_category_counts)
}

#* Lấy dữ liệu thu nhập theo loại công việc để vẽ boxplot
#* @get /data/earnings_by_job_category
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(
      JobCategory = str_to_title(Job_Category),
      EarningsUSD = as.numeric(Earnings_USD)
    )
  
  # Tính toán thống kê cho từng nhóm
  job_earnings <- data_clean %>% 
    group_by(JobCategory) %>%
    summarise(
      min = min(EarningsUSD),
      q1 = quantile(EarningsUSD, 0.25),
      median = median(EarningsUSD),
      q3 = quantile(EarningsUSD, 0.75),
      max = max(EarningsUSD),
      mean = mean(EarningsUSD),
      sd = sd(EarningsUSD),
      count = n()
    ) %>%
    arrange(desc(median))
  
  return(job_earnings)
}

#* Lấy dữ liệu số lượng freelancer theo mức độ kinh nghiệm và tỷ lệ thu nhập cao
#* @get /data/experience_level_distribution
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(
      ExperienceLevel = factor(str_to_title(Experience_Level), 
                             levels = c("Beginner", "Intermediate", "Expert"), 
                             ordered = TRUE),
      EarningsUSD = as.numeric(Earnings_USD)
    )
  
  # Tính ngưỡng thu nhập cao (75th percentile)
  threshold_high_income <- quantile(data_clean$EarningsUSD, 0.75, na.rm = TRUE)
  
  # Tính toán phân phối và tỷ lệ thu nhập cao theo mức độ kinh nghiệm
  experience_stats <- data_clean %>%
    mutate(HighEarner = ifelse(EarningsUSD > threshold_high_income, "Yes", "No")) %>%
    group_by(ExperienceLevel) %>%
    summarise(
      count = n(),
      high_earner_count = sum(HighEarner == "Yes"),
      high_earner_percentage = sum(HighEarner == "Yes") / n() * 100,
      mean_earnings = mean(EarningsUSD),
      median_earnings = median(EarningsUSD)
    )
  
  return(experience_stats)
}

#* Lấy dữ liệu ma trận tương quan giữa các biến số
#* @get /data/correlation_matrix
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(
      JobsCompleted = as.numeric(Job_Completed),
      EarningsUSD = as.numeric(Earnings_USD),
      HourlyRate = as.numeric(Hourly_Rate),
      JobSuccessRate = as.numeric(Job_Success_Rate),
      ClientRating = as.numeric(Client_Rating),
      JobDurationDays = as.numeric(Job_Duration_Days),
      RehireRate = as.numeric(Rehire_Rate),
      MarketingSpend = as.numeric(Marketing_Spend)
    )
  
  # Chọn các biến số
  numeric_vars <- data_clean %>%
    select(JobsCompleted, EarningsUSD, HourlyRate, JobSuccessRate, 
           ClientRating, JobDurationDays, RehireRate, MarketingSpend)
  
  # Tính ma trận tương quan
  cor_matrix <- cor(numeric_vars, use = "pairwise.complete.obs")
  
  # Chuyển đổi thành format thích hợp cho JSON
  cor_df <- as.data.frame(cor_matrix)
  cor_df$variable <- rownames(cor_df)
  
  # Trả về kết quả
  return(list(
    correlation_matrix = cor_df,
    variables = names(numeric_vars)
  ))
}

#* Lấy dữ liệu mối quan hệ giữa số lượng công việc và thu nhập
#* @get /data/jobs_completed_vs_earnings
function() {
  # Đọc dữ liệu từ file CSV
  data_raw <- read_csv("data/freelancer_earnings_bd.csv")
  
  # Làm sạch dữ liệu tương tự như trong api.Rmd
  data_clean <- data_raw %>%
    filter(!is.na(Earnings_USD)) %>%
    mutate(
      JobsCompleted = as.numeric(Job_Completed),
      EarningsUSD = as.numeric(Earnings_USD),
      ExperienceLevel = factor(str_to_title(Experience_Level), 
                             levels = c("Beginner", "Intermediate", "Expert"), 
                             ordered = TRUE)
    )
  
  # Tạo dữ liệu cho scatter plot
  scatter_data <- data_clean %>%
    select(JobsCompleted, EarningsUSD, ExperienceLevel) %>%
    mutate(ExperienceLevel = as.character(ExperienceLevel))
  
  # Tính toán hệ số tương quan
  cor_value <- cor(data_clean$JobsCompleted, data_clean$EarningsUSD, use = "pairwise.complete.obs")
  
  # Fit mô hình hồi quy tuyến tính đơn giản
  lm_model <- lm(EarningsUSD ~ JobsCompleted, data = data_clean)
  
  # Trả về kết quả
  return(list(
    scatter_data = scatter_data,
    correlation = cor_value,
    regression = list(
      intercept = coef(lm_model)[1],
      slope = coef(lm_model)[2],
      r_squared = summary(lm_model)$r.squared
    )
  ))
}

#* Lấy kết quả so sánh hiệu suất các mô hình (MOCK DATA)
#* @get /data/model_comparison
function() {
  # Trả về dữ liệu giả
  return(mock_model_comparison())
}

# --- HÀM MỚI ĐỂ TẠO DỮ LIỆU GIẢ CHO DỰ ĐOÁN ---

# Hàm tạo dự đoán giả
mock_prediction <- function(data, model_name) {
  # Tạo một kết quả dự đoán giả với xác suất ngẫu nhiên
  set.seed(as.numeric(Sys.time()) %% 10000) # Hạt giống ngẫu nhiên dựa trên thời gian
  
  # Xác suất yes ngẫu nhiên, ưu tiên cho "Expert" và "Web Development" nếu có
  prob_yes <- runif(1, 0.3, 0.7)
  
  # Nếu dữ liệu có ExperienceLevel = "Expert", tăng xác suất
  if (is.list(data) && !is.null(data$ExperienceLevel)) {
    if (data$ExperienceLevel == "Expert") {
      prob_yes <- prob_yes + 0.2
    } else if (data$ExperienceLevel == "Beginner") {
      prob_yes <- prob_yes - 0.1
    }
  }
  
  # Nếu dữ liệu có JobCategory = "Web Development", tăng xác suất
  if (is.list(data) && !is.null(data$JobCategory)) {
    if (data$JobCategory == "Web Development" || data$JobCategory == "App Development") {
      prob_yes <- prob_yes + 0.1
    }
  }
  
  # Giới hạn prob_yes trong khoảng [0.1, 0.9]
  prob_yes <- max(0.1, min(0.9, prob_yes))
  prob_no <- 1 - prob_yes
  
  # Lớp dự đoán dựa trên xác suất
  predicted_class <- ifelse(prob_yes > 0.5, "Yes", "No")
  
  list(
    model_used = model_name,
    input_data = data,
    predicted_class = predicted_class,
    probability_HighEarner_Yes = round(prob_yes, 4),
    probability_HighEarner_No = round(prob_no, 4),
    note = "This is mock data, no actual model was used."
  )
}

# Hàm tạo dữ liệu giả cho so sánh mô hình
mock_model_comparison <- function() {
  # Tạo dữ liệu giả cho performance
  performance <- data.frame(
    model = c("Logistic Regression", "Decision Tree", "Random Forest"),
    accuracy = c(0.78, 0.81, 0.85),
    sensitivity = c(0.70, 0.75, 0.82),
    specificity = c(0.82, 0.84, 0.87),
    precision = c(0.74, 0.78, 0.83),
    f1_score = c(0.72, 0.76, 0.82),
    auc = c(0.76, 0.80, 0.86)
  )
  
  # Tạo dữ liệu giả cho ROC curves
  create_roc_points <- function(auc) {
    n_points <- 10
    x <- seq(0, 1, length.out = n_points)
    
    # Tạo đường cong ROC dựa trên AUC
    y <- x^((1-auc)*2)
    
    data.frame(
      specificity = 1 - x,
      sensitivity = y
    )
  }
  
  roc_data <- list(
    logistic = create_roc_points(0.76),
    tree = create_roc_points(0.80),
    rf = create_roc_points(0.86)
  )
  
  # Tạo dữ liệu AUC
  auc_values <- list(
    logistic = 0.76,
    tree = 0.80,
    rf = 0.86
  )
  
  return(list(
    performance = performance,
    roc_curves = roc_data,
    auc_values = auc_values,
    note = "This is mock data for visualization purposes only."
  ))
}

#* Lấy thông tin mô hình (MOCK DATA)
#* @get /model_info/:model_type
#* @param model_type Loại mô hình (rf, logistic, tree)
function(model_type) {
  # Tạo thông tin giả cho từng loại mô hình
  if(model_type == "rf") {
    model_name <- "Random Forest"
    tuning_params <- list(mtry = 6)
    roc <- 0.86
  } else if(model_type == "logistic") {
    model_name <- "Logistic Regression"
    tuning_params <- list()
    roc <- 0.76
  } else if(model_type == "tree") {
    model_name <- "Decision Tree"
    tuning_params <- list(cp = 0.025)
    roc <- 0.80
  } else {
    return(list(error = "Invalid model_type. Use 'rf', 'logistic', or 'tree'"))
  }
  
  # Tạo thông tin mô hình giả
  model_info <- list(
    model_name = model_name,
    model_type = model_type,
    best_tune = tuning_params,
    cv_roc_on_train = roc,
    note = "This is mock data, no actual model was loaded."
  )
  
  return(model_info)
}

#* Lấy độ quan trọng của biến (MOCK DATA)
#* @get /variable_importance/:model_type
#* @param model_type Loại mô hình (rf, logistic, tree)
function(model_type) {
  # Tạo dữ liệu giả cho độ quan trọng của biến
  variables <- c("ExperienceLevel", "HourlyRate", "JobsCompleted", "JobSuccessRate", 
                "ClientRating", "JobDurationDays", "Platform", "JobCategory")
  
  # Tạo giá trị quan trọng ngẫu nhiên nhưng có thứ tự hợp lý
  set.seed(123) # Cố định hạt giống để giữ nhất quán
  importance_values <- sort(runif(length(variables), 10, 100), decreasing = TRUE)
  
  # Điều chỉnh một chút cho phù hợp với từng loại mô hình
  if(model_type == "rf") {
    model_name <- "Random Forest"
    # Random Forest thường đề cao ExperienceLevel và HourlyRate
    importance_values[1] <- 100  # ExperienceLevel
    importance_values[2] <- 95   # HourlyRate
  } else if(model_type == "logistic") {
    model_name <- "Logistic Regression"
    # Logistic có thể đề cao các biến khác
    importance_values <- sort(importance_values, decreasing = TRUE)
  } else if(model_type == "tree") {
    model_name <- "Decision Tree"
    # Decision Tree có thể tập trung vào một vài biến chính
    importance_values[1] <- 100  # Biến quan trọng nhất
    importance_values[2] <- 80
    importance_values[3] <- 60
    importance_values[4:length(importance_values)] <- 
      importance_values[4:length(importance_values)] * 0.5
  } else {
    return(list(error = "Invalid model_type. Use 'rf', 'logistic', or 'tree'"))
  }
  
  # Tạo data frame
  imp_df <- data.frame(
    Variable = variables,
    Overall = importance_values
  )
  
  return(list(model = model_name, variable_importance = imp_df))
}

#* Thông tin tổng quan về API và các endpoint
#* @get /
function() {
  list(
    title = "Freelancer Income Visualization API",
    description = "API trực quan hóa thu nhập của freelancer dựa trên nhiều yếu tố",
    note = "API đang chạy ở chế độ trực quan hóa, các dự đoán là dữ liệu giả",
    endpoints = list(
      "/health" = "Kiểm tra trạng thái API",
      "/data/raw" = "Lấy toàn bộ dữ liệu gốc từ file CSV",
      "/data/clean" = "Lấy dữ liệu đã làm sạch từ file CSV",
      "/data/earnings_distribution" = "Dữ liệu phân phối thu nhập",
      "/data/job_category_distribution" = "Dữ liệu phân bố theo loại công việc",
      "/data/earnings_by_job_category" = "Dữ liệu thu nhập theo loại công việc",
      "/data/experience_level_distribution" = "Dữ liệu phân bố theo mức kinh nghiệm",
      "/data/correlation_matrix" = "Dữ liệu ma trận tương quan của các biến",
      "/data/jobs_completed_vs_earnings" = "Dữ liệu mối quan hệ công việc-thu nhập",
      "/data/model_comparison" = "Dữ liệu so sánh hiệu suất các mô hình (giả)",
      "/predict_high_earner*" = "Các endpoint dự đoán (trả về dữ liệu giả)",
      "/model_info/{model_type}" = "Thông tin về mô hình (rf, logistic, tree) (giả)",
      "/variable_importance/{model_type}" = "Độ quan trọng của biến trong mô hình (giả)"
    )
  )
}