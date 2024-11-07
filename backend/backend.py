import csv
from io import StringIO
from flask import Flask, request, jsonify
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
    if file:
        content = file.read().decode('utf-8')
        csv_reader = csv.reader(StringIO(content))
        records = list(csv_reader)
        if len(records) < 2:
            return jsonify({"error": "CSV file is empty or has insufficient data"}), 400
        headers = records[0]
        return jsonify({"headers": headers, "message": "File uploaded successfully"})

@app.route('/api/chart', methods=['POST'])
def generate_chart():
    request_data = request.json
    chart_type = request_data.get('chartType')
    x_column = request_data.get('xColumn')
    y_column = request_data.get('yColumn')
    filter_column = request_data.get('filterColumn')
    filter_value = request_data.get('filterValue')
    file_data = request_data.get('fileData')

    if not all([chart_type, x_column is not None, y_column is not None, filter_column is not None, filter_value is not None, file_data]):
        return jsonify({"error": "Invalid request body"}), 400

    data = GradeData(file_data[0], file_data[1:])
    
    try:
        # Convert column indices from string to integer
        x_column_index = int(x_column)
        y_column_index = int(y_column)
        filter_column_index = int(filter_column)

        chart_html = generate_chart_plt(chart_type, data, x_column_index, y_column_index, filter_column_index, filter_value)
        return jsonify({"html": chart_html})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    print("Server listening on http://localhost:8080")
    app.run(port=8080)
