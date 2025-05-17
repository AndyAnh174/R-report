# Hàm helper để dự đoán với mô hình bất kỳ
predict_with_model <- function(data, model, model_name) {
  # Debug: In ra dữ liệu nhận được
  cat("=== DEBUG: Data received in predict_with_model ===\n")
  cat("Type:", class(data), "\n")
  cat("Structure:\n")
  print(str(data))
  
  # Kiểm tra và chuyển đổi dữ liệu nếu là JSON string
  if (is.character(data) && length(data) == 1) {
    tryCatch({
      cat("Dữ liệu nhận được là chuỗi, thử chuyển từ JSON...\n")
      data <- jsonlite::fromJSON(data)
      cat("Chuyển đổi JSON thành công\n")
    }, error = function(e) {
      cat("Lỗi khi chuyển đổi JSON:", e$message, "\n")
    })
  }
  
  # Chuyển đổi list từ JSON thành data frame 1 dòng
  if (!is.list(data) || length(data) == 0) {
    cat("ERROR: Input data is not a list or is empty!\n")
    return(list(error = "Input data must be a non-empty JSON object."))
  }
  
  # Kiểm tra và xử lý trường hợp input có key 'data'
  if ("data" %in% names(data)) {
    cat("Data has 'data' key, using data$data instead\n")
    data <- data$data
  }
  
  # Nếu data là mảng, lấy phần tử đầu tiên
  if (is.list(data) && length(data) > 0 && is.list(data[[1]])) {
    cat("Data is an array, using first element\n")
    data <- data[[1]]
  }
  
  # Debug trước khi tạo dataframe
  cat("Converting data to dataframe\n")
  cat("Data after processing:\n")
  print(str(data))
  
  tryCatch({
    # Tạo dataframe từ dữ liệu đã xử lý
    if (is.data.frame(data)) {
      input_raw_df <- data
      cat("Input is already a dataframe\n")
    } else {
      input_raw_df <- as.data.frame(t(unlist(data)), stringsAsFactors = FALSE)
      cat("Successfully created dataframe\n")
    }
    
    # In ra dataframe để debug
    cat("Input dataframe:\n")
    print(input_raw_df)
  }, error = function(e) {
    cat("ERROR when creating dataframe:", e$message, "\n")
    return(list(error = paste("Error converting data to dataframe:", e$message)))
  })
  
  # Chuẩn bị dữ liệu đầu vào
  prepared_data <- tryCatch({
    cat("Preparing input data\n")
    result <- prepare_input_data(input_raw_df)
    cat("Input data prepared successfully\n")
    cat("Prepared data:\n")
    print(str(result))
    result
  }, error = function(e) {
    cat("ERROR in prepare_input_data:", e$message, "\n")
    print(e)
    return(NULL) # Trả về NULL nếu có lỗi
  })
  
  if (is.null(prepared_data)) {
    cat("ERROR: prepared_data is NULL\n")
    return(list(error = "Error processing input data. Check data format and values."))
  }
  
  # Kiểm tra xem các cột cần thiết có trong prepared_data không
  if (!exists("pr_required_info")) {
    cat("ERROR: pr_required_info does not exist. Model info may not be loaded.\n")
    return(list(error = "Model information not loaded. Please check if model files exist."))
  }
  
  missing_cols <- setdiff(pr_required_info$model_features, colnames(prepared_data))
  if (length(missing_cols) > 0) {
    cat("ERROR: Missing columns:", paste(missing_cols, collapse = ", "), "\n")
    return(list(error = paste("Missing required features for prediction:", paste(missing_cols, collapse = ", "))))
  }
  
  # Dự đoán
  prediction_result <- tryCatch({
    cat("Making prediction with model:", model_name, "\n")
    if (!exists(deparse(substitute(model)), envir = .GlobalEnv)) {
      cat("ERROR: Model", deparse(substitute(model)), "does not exist in global environment\n")
      return(NULL)
    }
    
    prob <- predict(model, newdata = prepared_data, type = "prob")
    cls <- predict(model, newdata = prepared_data, type = "raw")
    cat("Prediction successful\n")
    cat("Predicted class:", as.character(cls), "\n")
    cat("Probability Yes:", prob$Yes, "\n")
    cat("Probability No:", prob$No, "\n")
    list(prob = prob, class = cls)
  }, error = function(e) {
    cat("ERROR in prediction:", e$message, "\n")
    print(e)
    return(NULL)
  })
  
  if (is.null(prediction_result)) {
    return(list(error = "Error during prediction. Model may not be compatible with input data or not loaded properly."))
  }
  
  list(
    model_used = model_name,
    input_data = data,
    predicted_class = as.character(prediction_result$class),
    probability_HighEarner_Yes = round(prediction_result$prob$Yes, 4),
    probability_HighEarner_No = round(prediction_result$prob$No, 4)
  )
} 