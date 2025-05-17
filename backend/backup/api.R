library(plumber)
library(tidyverse)
library(jsonlite)
library(magrittr)

setwd("D:/R-report/backend")
data_raw <- read_csv("data/freelancer_earnings_bd.csv")

data_clean <- data_raw %>%
  filter(!is.na(Earnings_USD)) %>%
  mutate(
    Income = as.numeric(Earnings_USD),
    JobCategory = str_to_title(Job_Category),
    ExperienceLevel = str_to_title(Experience_Level),
    Platform = str_to_title(Platform),
    ClientRegion = str_to_title(Client_Region),
    PaymentMethod = str_to_title(Payment_Method),
    ProjectType = str_to_title(Project_Type),
    JobSuccessRate = as.numeric(Job_Success_Rate),
    ClientRating = as.numeric(Client_Rating),
    JobDuration = as.numeric(Job_Duration_Days),
    RehireRate = as.numeric(Rehire_Rate),
    MarketingSpend = as.numeric(Marketing_Spend),
    HourlyRate = as.numeric(Hourly_Rate),
    JobsCompleted = as.numeric(Job_Completed)
  )

data_norm <- data_clean %>%
  mutate(
    Income_norm = (Income - min(Income)) / (max(Income) - min(Income)),
    SuccessRate_norm = (JobSuccessRate - min(JobSuccessRate)) / (max(JobSuccessRate) - min(JobSuccessRate)),
    Rating_norm = (ClientRating - min(ClientRating)) / (max(ClientRating) - min(ClientRating))
  )

income_summary <- data_clean %>%
  summarise(
    mean_income = mean(Income, na.rm = TRUE),
    median_income = median(Income, na.rm = TRUE),
    max_income = max(Income, na.rm = TRUE),
    min_income = min(Income, na.rm = TRUE),
    mean_hourly_rate = mean(HourlyRate, na.rm = TRUE),
    mean_success_rate = mean(JobSuccessRate, na.rm = TRUE),
    mean_client_rating = mean(ClientRating, na.rm = TRUE)
  )

income_by_job <- data_clean %>%
  group_by(JobCategory) %>%
  summarise(
    avg_income = mean(Income, na.rm = TRUE),
    avg_hourly_rate = mean(HourlyRate, na.rm = TRUE),
    avg_success_rate = mean(JobSuccessRate, na.rm = TRUE),
    avg_client_rating = mean(ClientRating, na.rm = TRUE)
  ) %>%
  arrange(desc(avg_income))

income_by_platform <- data_clean %>%
  group_by(Platform) %>%
  summarise(
    avg_income = mean(Income, na.rm = TRUE),
    avg_hourly_rate = mean(HourlyRate, na.rm = TRUE),
    avg_success_rate = mean(JobSuccessRate, na.rm = TRUE),
    avg_client_rating = mean(ClientRating, na.rm = TRUE)
  ) %>%
  arrange(desc(avg_income))

pr() %>%
  pr_filter("cors", function(req, res) {
    res$setHeader("Access-Control-Allow-Origin", "*")
    res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if (req$REQUEST_METHOD == "OPTIONS") {
      res$status <- 200
      return(list())
    }
    forward()
  }) %>%
  pr_get("/summary", function(){ income_summary }) %>%
  pr_get("/income_by_job", function(){ income_by_job }) %>%
  pr_get("/income_by_platform", function(){ income_by_platform }) %>%
  pr_get("/clean_data", function(){ data_clean }) %>%
  pr_get("/normalized_data", function(){ data_norm }) %>%
  pr_get("/chartjs_income_by_job", function(){
    list(
      labels = income_by_job$JobCategory,
      datasets = list(
        list(label = "Average Income", data = income_by_job$avg_income),
        list(label = "Average Hourly Rate", data = income_by_job$avg_hourly_rate),
        list(label = "Average Success Rate", data = income_by_job$avg_success_rate),
        list(label = "Average Client Rating", data = income_by_job$avg_client_rating)
      )
    )
  }) %>%
  pr_get("/chartjs_income_by_platform", function(){
    list(
      labels = income_by_platform$Platform,
      datasets = list(
        list(label = "Average Income", data = income_by_platform$avg_income),
        list(label = "Average Hourly Rate", data = income_by_platform$avg_hourly_rate),
        list(label = "Average Success Rate", data = income_by_platform$avg_success_rate),
        list(label = "Average Client Rating", data = income_by_platform$avg_client_rating)
      )
    )
  }) %>%
  pr_get("/chartjs_project_type", function(){
    project_type_count <- data_clean %>% group_by(ProjectType) %>% summarise(count = n())
    list(
      labels = project_type_count$ProjectType,
      datasets = list(
        list(label = "Tỷ lệ loại hình dự án", data = project_type_count$count)
      )
    )
  }) %>%
  pr_get("/chartjs_payment_method", function(){
    payment_method_count <- data_clean %>% group_by(PaymentMethod) %>% summarise(count = n())
    list(
      labels = payment_method_count$PaymentMethod,
      datasets = list(
        list(label = "Tỷ lệ phương thức thanh toán", data = payment_method_count$count)
      )
    )
  }) %>%
  pr_run(host = "0.0.0.0", port = 8000)
