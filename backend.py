import csv
import json
import re
from io import StringIO
import matplotlib.pyplot as plt
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

VIBGYOR_COLORS = ['violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red']

class GradeData:
    def __init__(self, headers, rows):
        self.headers = headers
        self.rows = rows

def normalize_value(value):
    """
    Convert values with 'M' or 'B' suffixes into numeric format and return the suffix.
    Examples:
        '234M' -> (234e6, 'M')
        '1.5B' -> (1.5e9, 'B')
    """
    value = str(value)
    value = value.strip()
    suffix = ''
    if value.endswith('M'):
        numeric_value = float(value[:-1]) * 1e6
        suffix = 'M'
    elif value.endswith('B'):
        numeric_value = float(value[:-1]) * 1e9
        suffix = 'B'
    elif value.endswith('m'):  # Meters or similar metric units
        numeric_value = float(value[:-1])
        suffix = 'm'
    else:  # Assume plain numeric value if no recognized suffix
        numeric_value = float(value)  # Assume plain numeric value if no suffix
    return numeric_value, suffix

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

def generate_chart_plt(chart_type, data, x_column, y_column, filter_column, filter_value):
    # Filter based on any column and value
    filtered_rows = [row for row in data.rows if row[filter_column].strip().lower() == filter_value.strip().lower()]
    
    if not filtered_rows:
        raise ValueError("No data available after filtering")

    x_values = [row[x_column] for row in filtered_rows]
    
    y_values = []
    y_suffix = ""
    for row in filtered_rows:
        try:
            value, suffix = normalize_value(row[y_column].replace(',', '').replace('"', '').strip())
            y_values.append(value)
            y_suffix = suffix  # Assume all values in the column have the same suffix
        except ValueError as ve:
            raise ValueError("Non-numeric value found in Y column") from ve

    plt.figure(figsize=(10, 6))
    plt.title(f"{data.headers[y_column]} vs {data.headers[x_column]}")

    if chart_type == "pie":
        plt.pie(y_values, labels=[f"{x} ({y_suffix})" for x in x_values], autopct='%1.1f%%', colors=VIBGYOR_COLORS, startangle=90)
        plt.axis('equal')
        plt.legend(x_values, loc="upper left", bbox_to_anchor=(1, 1))
        
    elif chart_type == "bar":
        plt.bar(x_values, y_values, color=VIBGYOR_COLORS[0])
        plt.xticks(rotation=45)
        plt.xlabel(data.headers[x_column])
        plt.ylabel(f"{data.headers[y_column]} ({y_suffix})")
        
    elif chart_type == "line":
        plt.plot(x_values, y_values, marker='o', color=VIBGYOR_COLORS[0])
        plt.xticks(rotation=45)
        plt.xlabel(data.headers[x_column])
        plt.ylabel(f"{data.headers[y_column]} ({y_suffix})")

    elif chart_type == "scatter":
        plt.scatter(x_values, y_values, color=VIBGYOR_COLORS[0])
        plt.xlabel(data.headers[x_column])
        plt.ylabel(f"{data.headers[y_column]} ({y_suffix})")
        plt.xticks(rotation=45)
        
    else:
        raise ValueError("Invalid chart type")

    # Sanitize the SVG output
    img_buffer = StringIO()
    plt.savefig(img_buffer, format='svg', bbox_inches='tight')
    img_buffer.seek(0)
    svg_string = img_buffer.getvalue()
    
    # Remove fill and stroke attributes for better compatibility
    svg_string = re.sub(r'fill="[^"]*?"', '', svg_string)
    svg_string = re.sub(r'stroke="[^"]*?"', '', svg_string)

    return svg_string

if __name__ == '__main__':
    print("Server listening on http://localhost:8080")
    app.run(port=8080)
