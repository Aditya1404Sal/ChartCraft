import re
from io import StringIO
import matplotlib.pyplot as plt

from backend.normalizer import normalize_value

VIBGYOR_COLORS = ['violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red']


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