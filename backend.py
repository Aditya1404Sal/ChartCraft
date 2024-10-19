import csv
import json
from io import StringIO
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
from flask_cors import CORS

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
    column = request_data.get('column')
    file_data = request_data.get('fileData')
    
    if not all([chart_type, column is not None, file_data]):
        return jsonify({"error": "Invalid request body"}), 400
    
    data = GradeData(file_data[0], file_data[1:])
    
    try:
        chart_html = generate_chart_plt(chart_type, data, column)
        return jsonify({"html": chart_html})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_chart_plt(chart_type, data, column):
    counts = {}
    for row in data.rows:
        if column < len(row):
            grade = row[column].strip('"')
            counts[grade] = counts.get(grade, 0) + 1
    
    grouped_data = group_grades(counts)
    
    x = data.headers[column].strip('"')
    y = x[0].upper() + x[1:]
    title = f"{y} Distribution"
    
    plt.figure(figsize=(10, 6))
    plt.title(title)
    
    labels = sorted(grouped_data.keys())
    values = [grouped_data[label] for label in labels]
    
    if chart_type == "pie":
        plt.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
    elif chart_type == "bar":
        plt.bar(labels, values)
        plt.xlabel(y)
        plt.ylabel("Count")
    elif chart_type == "line":
        plt.plot(labels, values, marker='o')
        plt.xlabel(y)
        plt.ylabel("Count")
    else:
        raise ValueError("Invalid chart type")
    
    img_buffer = StringIO()
    plt.savefig(img_buffer, format='svg')
    img_buffer.seek(0)
    svg_string = img_buffer.getvalue()
    
    return svg_string

def group_grades(data):
    grouped = {}
    for grade, count in data.items():
        grade = grade.strip().strip('"')
        
        if grade == "":
            continue
        
        try:
            score = int(grade)
            range_start = (score // 10) * 10
            range_end = range_start + 9
            range_label = f"{range_start}-{range_end}"
        except ValueError:
            range_label = grade
        
        grouped[range_label] = grouped.get(range_label, 0) + count
    
    return grouped

if __name__ == '__main__':
    print("Server listening on http://localhost:80800")
    app.run(port=8080)