# ChartCraft

ChartCraft is a Python-based web application that allows users to upload CSV files, process the data, and dynamically generate different types of charts (Pie, Bar, Line) to visualize the data. It uses **Matplotlib** for chart rendering and provides a simple API for file upload and chart generation.

## Features

- **CSV File Upload**: Allows users to upload CSV files through a web interface
- **Dynamic Chart Generation**: Supports Pie, Bar, and Line charts based on user selection
- **Column Selection**: Users can select specific columns from the uploaded CSV to visualize
- **Data Filtering**: Apply filters to visualize specific subsets of data
- **CORS Support**: Enables cross-origin resource sharing for API endpoints
- **SVG Output**: Generates charts in SVG format for high-quality visualization

## Tech Stack

- **Backend**: Python
  - Flask web framework
  - CSV processing with Python's `csv` module
  - JSON handling with Python's `json` module
  - Chart rendering using `matplotlib`
  - SVG output optimization with `re` (regular expressions)

## Setup and Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/ChartCraft.git
cd ChartCraft
```

2. **Install dependencies**:
```bash
pip install flask flask-cors matplotlib numpy
```

3. **Run the Flask application**:
```bash
python backend.py
```

The server will start on `http://localhost:8080`.

## API Endpoints

### 1. File Upload
- **URL**: `/api/upload`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: CSV file (key: "file")
- **Response**: JSON containing headers of the CSV file
```json
{
    "headers": ["column1", "column2", ...],
    "message": "File uploaded successfully"
}
```

### 2. Chart Generation
- **URL**: `/api/chart`
- **Method**: POST
- **Content-Type**: application/json
- **Body**:
```json
{
    "chartType": "pie|bar|line",
    "xColumn": "0",
    "yColumn": "1",
    "filterColumn": "2",
    "filterValue": "someValue",
    "fileData": [["header1", "header2"], ["data1", "data2"], ...]
}
```
- **Response**: JSON containing SVG representation of the generated chart

## Code Structure

- `app.py`: Main application file containing:
  - Flask application setup
  - Route handlers for file upload and chart generation
  - Chart generation logic using matplotlib
  - SVG optimization utilities
- `GradeData` class: Handles data organization and storage
- Helper functions for chart generation and data processing

## How It Works

1. **File Upload**:
   - Users upload a CSV file through the `/api/upload` endpoint
   - The server parses the CSV and returns the headers to the client

2. **Chart Generation**:
   - Clients send a POST request to `/api/chart` with:
     - Desired chart type
     - X and Y column indices
     - Filter column and value
     - File data
   - The server generates the specified chart using matplotlib
   - Charts are returned as optimized SVG

3. **Data Processing**:
   - Data is filtered based on user-specified criteria
   - Numeric values are automatically converted and validated
   - Charts are customized with VIBGYOR color scheme

## Example Usage

1. Upload a CSV file:
```bash
curl -X POST -F "file=@data.csv" http://localhost:8080/api/upload
```

2. Generate a chart:
```bash
curl -X POST -H "Content-Type: application/json" -d '{
    "chartType": "bar",
    "xColumn": "0",
    "yColumn": "1",
    "filterColumn": "2",
    "filterValue": "2023",
    "fileData": [["Month", "Revenue", "Year"], ["Jan", "1000", "2023"], ["Feb", "1200", "2023"]]
}' http://localhost:8080/api/chart
```

## Dependencies

- Python 3.6 or higher
- Flask
- Flask-CORS
- Matplotlib
- NumPy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.