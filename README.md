# XLtoChart

XLtoChart is a simple Go-based application that reads data from a CSV file, processes it, and dynamically generates different types of charts (Pie, Bar, Line) to visualize the data. It uses the **go-echarts/v2** library for chart rendering.

## Features

- **CSV Parsing**: Reads data from a CSV file and allows users to select specific columns to visualize.
- **Chart Generation**: Supports Pie, Bar, and Line charts.
- **Dynamic Selection**: Users can select a column to generate a chart dynamically via the web interface.
- **Grade Grouping**: Automatically groups grades into ranges when creating the chart.

## Tech Stack

- **Backend**: Go
  - CSV parsing with Go’s `encoding/csv` package.
  - Chart rendering using the **go-echarts/v2** library.
- **Frontend**: HTML generated dynamically by Go’s template engine.
- **Libraries**: 
  - [go-echarts/v2](https://github.com/go-echarts/go-echarts) for rendering charts.

## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/xltochart.git
    cd xltochart
    ```

2. **Install Go dependencies**:
    ```bash
    go mod tidy
    ```

3. **Prepare the CSV file**:
    - Create a `data.csv` file in the root directory. This file should have headers and data rows. For example:
    
      ```csv
      Name,Math,English,Science
      Alice,95,88,92
      Bob,75,80,78
      Charlie,85,82,89
      ```

4. **Run the Go application**:
    ```bash
    go run main.go
    ```

5. **Access the application**:
    Open a web browser and navigate to `http://localhost:8080`. You’ll see a page where you can select a column and choose a chart type (Pie, Bar, Line) to visualize the data.

## Code Structure

- `main.go`: Contains the main logic for reading CSV data, handling requests, and rendering charts.
- `data.csv`: The data file used for visualization (make sure this is present in the root folder).
- `charts/`: Holds the go-echarts configuration for creating different types of charts (Pie, Bar, Line).

## How It Works

1. **CSV Parsing**: 
    - Reads the CSV file and stores the headers and rows of data in memory.
2. **Frontend**:
    - Presents a page listing each column of the CSV file as options to visualize.
    - Users can click on options to visualize data with different charts (Pie, Bar, or Line).
3. **Backend**:
    - Dynamically generates the selected chart based on the column and chart type.
4. **Chart Rendering**:
    - Uses the go-echarts library to create and render the charts, which are displayed in the browser.

## Example

Here’s an example flow of how to use the application:

1. Upload a CSV file like this:
    ```csv
    Name,Math,Science,English
    Alice,85,92,88
    Bob,78,75,80
    Charlie,89,85,82
    ```
2. Run the Go application.
3. Visit `http://localhost:8080` and select the column "Math" to visualize with a Pie Chart.

## Dependencies

- Go 1.19 or higher
- **go-echarts/v2** library

## Future Improvements

- **Custom Charts**: Extend the application to allow for more advanced chart types like scatter plots and histograms.
- **Improved UI**: Enhance the frontend with more styling and interactive chart elements.


Happy coding!
