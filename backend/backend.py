import csv
import pandas as pd
from io import StringIO, BytesIO
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from backend.plotter import generate_chart_plt

app = Flask(__name__)
CORS(app)

class GradeData:
    def __init__(self, headers, rows):
        self.headers = headers
        self.rows = rows


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename.lower()
    if filename.endswith('.csv'):
        # Read CSV file and convert to JSON format
        content = file.read().decode('utf-8')
        df = pd.read_csv(StringIO(content))
    elif filename.endswith(('.xls', '.xlsx')):
        # Read Excel file and convert to CSV for download
        try:
            df = pd.read_excel(file)
            # Convert Excel file to CSV format
            csv_output = BytesIO()
            df.to_csv(csv_output, index=False)
            csv_output.seek(0)  # Reset pointer to the start of the file
            return send_file(csv_output, as_attachment=True, download_name='converted_file.csv', mimetype='text/csv')
        except Exception as e:
            return jsonify({"error": f"Failed to process Excel file: {str(e)}"}), 500
    else:
        return jsonify({"error": "Unsupported file format. Please upload a CSV, XLS, or XLSX file."}), 400

    # Convert dataframe to JSON format with records orientation
    json_data = df.to_dict(orient='records')
    headers = list(df.columns)
    
    return jsonify({"headers": headers, "data": json_data, "message": "File uploaded successfully"})


@app.route('/api/chart', methods=['POST'])
def generate_chart():
    request_data = request.json
    chart_type = request_data.get('chartType')
    x_column = request_data.get('xColumn')
    y_column = request_data.get('yColumn')
    filter_column = request_data.get('filterColumn')
    filter_value = request_data.get('filterValue')
    file_data = request_data.get('fileData')

    if not all([chart_type, x_column is not None, y_column is not None, file_data]):
        return jsonify({"error": "Invalid request body"}), 400

    try:
        # Filter data based on filter_column and filter_value, if specified
        data = pd.DataFrame(file_data)
        if filter_column and filter_value:
            data = data[data[filter_column] == filter_value]

        # Pass filtered data to generate chart
        chart_html = generate_chart_plt(chart_type, data, x_column, y_column)
        return jsonify({"html": chart_html})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    print("Server listening on http://localhost:8080")
    app.run(port=8080)
