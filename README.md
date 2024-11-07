# ChartCraft 

ChartCraft is a Python-based web application that allows users to upload CSV/Excel files, process the data, and dynamically generate different types of charts (Pie, Bar, Line) to visualize the data. It uses [matplotlib] for chart rendering and provides a simple API for file upload and chart generation.

## Tech Stack

- **Backend**: Python
  - [Flask] server for HTTP handling
  - [matplotlib] for chart generation
  - [Pandas] for data processing
  - CSV/Excel file parsing support
- **Frontend**: [Next.js] application

## Features

- **CSV/Excel File Upload**: Allows users to upload CSV/Excel files through a web interface
- **Dynamic Chart Generation**: Supports Pie, Bar, and Line charts based on user selection
- **Column Selection**: Users can select specific columns from the uploaded file to visualize
- **Data Processing**: Automatic handling of numeric and categorical data
- **CORS Support**: Enables [cross-origin resource sharing] for API endpoints

## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone [https://github.com/yourusername/ChartCraft.git](https://github.com/yourusername/ChartCraft.git)
    cd ChartCraft
    ```

2. **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3. **Run the Flask application**:
    ```bash
    python3 -m backend.backend
    ```

4. **Access the application**:
    The server will start on [http://localhost:8080](http://localhost:8080). You can now use the API endpoints to interact with the application.

## API Endpoints

1. **File Upload**
   - URL: `/api/upload`
   - Method: POST
   - Content-Type: multipart/form-data
   - Body: CSV/Excel file (key: "file")
   - Response: JSON containing headers of the file

2. **Chart Generation**
   - URL: `/api/chart`
   - Method: POST
   - Content-Type: application/json
   - Body:
     ```json
     {
       "ChartType": "pie",
       "Column": 1,
       "FileData": [["Name", "Math", "Science"], ["Alice", "85", "92"], ["Bob", "78", "75"]]
     }
     ```

## Code Structure

- `backend/backend.py`: Main Flask application with route handlers
- `backend/plotter.py`: Chart generation using [matplotlib]
- `backend/normalizer.py`: Data normalization utilities

## Future Improvements

- Add authentication and authorization for API endpoints
- Implement data caching to improve performance for large datasets
- Add more chart types and customization options
- Implement error logging and monitoring

Happy charting!
