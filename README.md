# ChartCraft

ChartCraft is a Go-based web application that allows users to upload CSV files, process the data, and dynamically generate different types of charts (Pie, Bar, Line) to visualize the data. It uses the **go-echarts/v2** library for chart rendering and provides a simple API for file upload and chart generation.

## Features

- **CSV File Upload**: Allows users to upload CSV files through a web interface.
- **Dynamic Chart Generation**: Supports Pie, Bar, and Line charts based on user selection.
- **Column Selection**: Users can select specific columns from the uploaded CSV to visualize.
- **Grade Grouping**: Automatically groups numeric grades into ranges when creating charts.
- **CORS Support**: Enables cross-origin resource sharing for API endpoints.

## Tech Stack

- **Backend**: Go
  - HTTP server using Go's `net/http` package
  - CSV parsing with Go's `encoding/csv` package
  - JSON encoding/decoding with Go's `encoding/json` package
  - Chart rendering using the **go-echarts/v2** library
- **Frontend**: Not included in this backend code, but the API supports a separate frontend application
- **Libraries**: 
  - [go-echarts/v2](https://github.com/go-echarts/go-echarts) for rendering charts

## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/ChartCraft.git
    cd ChartCraft
    ```

2. **Install Go dependencies**:
    ```bash
    go mod tidy
    ```

3. **Run the Go application**:
    ```bash
    go run main.go
    ```

4. **Access the application**:
    The server will start on `http://localhost:8080`. You can now use the API endpoints to interact with the application.

## API Endpoints

1. **File Upload**
   - URL: `/api/upload`
   - Method: POST
   - Content-Type: multipart/form-data
   - Body: CSV file (key: "file")
   - Response: JSON containing headers of the CSV file

2. **Chart Generation**
   - URL: `/api/chart`
   - Method: POST
   - Content-Type: application/json
   - Body: 
     ```json
     {
       "ChartType": "pie|bar|line",
       "Column": 0,
       "FileData": [["header1", "header2"], ["data1", "data2"], ...]
     }
     ```
   - Response: JSON containing HTML of the generated chart

## Code Structure

- `main.go`: Contains the main logic for handling HTTP requests, file uploads, and chart generation.
- `enableCORS()`: Middleware function to enable CORS for all routes.
- `uploadFileHandler()`: Handles CSV file uploads and returns the headers.
- `generateChartHandler()`: Processes requests for chart generation.
- `generateChart()`: Creates the specified chart type using the provided data.
- `createPieChart()`, `createBarChart()`, `createLineChart()`: Functions to generate specific chart types.
- `groupGrades()`: Helper function to group numeric grades into ranges.

## How It Works

1. **File Upload**: 
   - Users upload a CSV file through the `/api/upload` endpoint.
   - The server parses the CSV and returns the headers to the client.

2. **Chart Generation**:
   - Clients send a POST request to `/api/chart` with the desired chart type, column index, and file data.
   - The server generates the specified chart using go-echarts and returns the HTML representation.

3. **Data Processing**:
   - Numeric grades are automatically grouped into ranges (e.g., 80-89, 90-99) for better visualization.
   - Non-numeric data is treated as categories.

## Example Usage

1. Upload a CSV file:
   ```
   POST /api/upload
   Content-Type: multipart/form-data
   Body: file=@grades.csv
   ```

2. Generate a chart:
   ```
   POST /api/chart
   Content-Type: application/json
   Body: 
   {
     "ChartType": "pie",
     "Column": 1,
     "FileData": [["Name", "Math", "Science"], ["Alice", "85", "92"], ["Bob", "78", "75"]]
   }
   ```

## Dependencies

- Go 1.20 or higher
- github.com/go-echarts/go-echarts/v2

## Future Improvements

- Add authentication and authorization for API endpoints.
- Implement data caching to improve performance for large datasets.
- Add more chart types and customization options.
- Create a frontend application to interact with the API.
- Implement error logging and monitoring.

Happy coding!