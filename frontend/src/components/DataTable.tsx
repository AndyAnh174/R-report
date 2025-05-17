import React, { useState } from 'react';

interface DataTableProps {
  data: any[] | null;
  loading: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  if (!data) {
    return <div className="text-center py-10">Không có dữ liệu để hiển thị.</div>;
  }

  // Đảm bảo data là một mảng
  const dataArray = Array.isArray(data) ? data : Object.values(data);
  
  if (dataArray.length === 0) {
    return <div className="text-center py-10">Không có dữ liệu để hiển thị.</div>;
  }

  // Đảm bảo dataArray[0] tồn tại trước khi lấy các cột
  const columns = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];
  
  // Tính toán phân trang
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = dataArray.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(dataArray.length / rowsPerPage);

  // Hàm xử lý thay đổi trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Hàm xử lý thay đổi số dòng mỗi trang
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số dòng/trang
  };

  // Hàm kiểm tra loại dữ liệu
  const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  // Định dạng giá trị ô
  const formatCellValue = (value: any): { displayValue: string; cellClass: string } => {
    if (value === null || value === undefined) {
      return { displayValue: '—', cellClass: 'cell-text' };
    }
    
    if (isNumeric(value)) {
      const numValue = parseFloat(value);
      // Kiểm tra số nguyên hay số thập phân
      const displayValue = Number.isInteger(numValue) 
        ? numValue.toString()
        : numValue.toFixed(2);
      return { displayValue, cellClass: 'cell-number' };
    }
    
    return { displayValue: String(value), cellClass: 'cell-text' };
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="rowsPerPage" className="mr-2 font-semibold">Hiển thị:</label>
          <select 
            id="rowsPerPage" 
            value={rowsPerPage} 
            onChange={handleRowsPerPageChange}
            className="border rounded p-1 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">dòng mỗi trang</span>
        </div>
        <div>
          <span className="font-semibold">Tổng số: <span className="text-blue-600">{dataArray.length}</span> bản ghi</span>
        </div>
      </div>

      {columns.length > 0 ? (
        <div className="excel-table-container">
          {/* Container cố định chiều cao với scroll */}
          <div className="overflow-auto" style={{ maxHeight: '75vh' }}>
            <table className="excel-table">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      // Lấy giá trị của ô
                      const cellValue = row[column];
                      // Định dạng giá trị theo loại dữ liệu
                      const { displayValue, cellClass } = formatCellValue(cellValue);
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={cellClass}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">Không có cột dữ liệu để hiển thị.</div>
      )}

      {/* Phân trang */}
      {totalPages > 0 && (
        <div className="pagination flex justify-between items-center space-x-1 mt-6 pb-4">
          <div className="text-sm text-gray-600">
            Hiển thị {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, dataArray.length)} của {dataArray.length} bản ghi
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={() => currentPage > 1 && paginate(1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              « Đầu
            </button>
            
            <button 
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              ‹ Trước
            </button>
            
            {/* Hiển thị số trang */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Hiển thị 5 trang xung quanh trang hiện tại
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageToShow}
                  onClick={() => paginate(pageToShow)}
                  className={`px-3 py-2 min-w-[40px] text-sm rounded font-medium ${currentPage === pageToShow ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {pageToShow}
                </button>
              );
            })}
            
            <button 
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Sau ›
            </button>
            
            <button 
              onClick={() => currentPage < totalPages && paginate(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Cuối »
            </button>
          </div>
          
          <div>
            {/* Placeholder để giữ cân bằng layout */}
            <div className="invisible text-sm">Hiển thị</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 