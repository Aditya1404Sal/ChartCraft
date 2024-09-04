package main

import (
	"encoding/csv"
	"log"
	"net/http"
	"os"
	"text/template"

	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/opts"
)

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grade Distribution</title>
</head>
<body>
    <div id="chart-container">
        {{.}}
    </div>
    <button onclick="downloadDiv('chart-container')">Download Chart as HTML</button>

    <script>
        function downloadDiv(divId) {
            const element = document.getElementById(divId).innerHTML; // Get inner HTML of the specific div
            const blob = new Blob([element], { type: 'text/html' }); // Create a Blob from the HTML
            const link = document.createElement('a'); // Create a link element
            link.href = URL.createObjectURL(blob); // Create a URL for the Blob
            link.download = 'Grade_Distribution.html'; // Set the default filename
            link.click(); // Trigger the download
        }
    </script>
</body>
</html>
`

func main() {

	// change the code to incorporate csv file processing in the main file itself, then the csv attribute processing should be done
	// by the handlers
	// reduce handlers to just the root handler with some sub-routes for smoother api handling
	// first scan the csv to extract the attribute headers, then proceed to give the users the headers as options to do stuff with
	// the data should be processed index wise to either calculate the number of grades in aa particular segment or count the number of students passed
	// in a particular subject after which the data should be passed to the chart rendering functions, but i still need to understannd
	// how exactly go-echarts works , in the sense that how the data is passed to the chart rendering functions like opts.AddSeries() and opts.AddData()
	// then i just need to return a html blob of the chart to the user with the download button.
	http.HandleFunc("/pie-chart", pieChartHandler)
	http.HandleFunc("/bar-chart", barChartHandler)
	http.HandleFunc("/line-chart", lineChartHandler)
	http.HandleFunc("/", defaultHandler)

	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func defaultHandler(w http.ResponseWriter, _ *http.Request) {
	// Read CSV file
	file, err := os.Open("grades.csv")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	// Process grades
	gradeCounts := make(map[string]int)
	for _, record := range records[1:] { // Skip header row
		grade := record[1] // Assuming grade is in the second column
		gradeCounts[grade]++
	}

	// Prepare data for chart
	items := make([]opts.PieData, 0, len(gradeCounts))
	for grade, count := range gradeCounts {
		items = append(items, opts.PieData{Name: grade, Value: count})
	}

	// Create pie chart
	pie := charts.NewPie()
	pie.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: "Grade Distribution"}))
	pie.AddSeries("Grade", items)

	// Serve the chart with an HTML template
	w.Header().Set("Content-Type", "text/html")

	// Create a temporary file to store the chart
	tempFile, err := os.Create("chart.html")
	if err != nil {
		log.Fatalf("Error creating temp file: %v", err)
	}
	defer tempFile.Close()

	err = pie.Render(tempFile)
	if err != nil {
		log.Fatalf("Error rendering chart: %v", err)
	}

	// Re-open the temp file to read the content
	tempFile, err = os.Open("chart.html")
	if err != nil {
		log.Fatalf("Error opening temp file: %v", err)
	}
	defer tempFile.Close()

	// Read the content of the temp file
	fileContent := make([]byte, 1024)
	_, err = tempFile.Read(fileContent)
	if err != nil {
		log.Fatalf("Error reading temp file: %v", err)
	}

	// Remove the temp file
	err = os.Remove("chart.html")
	if err != nil {
		log.Fatalf("Error removing temp file: %v", err)
	}

	// Parse and execute the HTML template
	tmpl, err := template.New("webpage").Parse(htmlTemplate)
	if err != nil {
		log.Fatalf("Error parsing template: %v", err)
	}
	err = tmpl.Execute(w, string(fileContent))
	if err != nil {
		log.Fatalf("Error executing template: %v", err)
	}
}

func pieChartHandler(w http.ResponseWriter, _ *http.Request) {
	// Read CSV file
	file, err := os.Open("grades.csv")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	// Process grades for pie chart
	gradeCounts := make(map[string]int)
	for _, record := range records[1:] { // Skip header row
		grade := record[1] // Assuming grade is in the second column
		gradeCounts[grade]++
	}

	// Prepare data for pie chart
	items := make([]opts.PieData, 0, len(gradeCounts))
	for grade, count := range gradeCounts {
		items = append(items, opts.PieData{Name: grade, Value: count})
	}

	// Create pie chart
	pie := charts.NewPie()
	pie.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: "Grade Distribution"}))
	pie.AddSeries("Grade", items)

	// Serve the pie chart with an HTML template
	w.Header().Set("Content-Type", "text/html")

	// Create a temporary file to store the chart
	tempFile, err := os.Create("pie_chart.html")
	if err != nil {
		log.Fatalf("Error creating temp file: %v", err)
	}
	defer tempFile.Close()

	err = pie.Render(tempFile)
	if err != nil {
		log.Fatalf("Error rendering chart: %v", err)
	}

	// Re-open the temp file to read the content
	tempFile, err = os.Open("pie_chart.html")
	if err != nil {
		log.Fatalf("Error opening temp file: %v", err)
	}
	defer tempFile.Close()

	// Read the content of the temp file
	fileContent := make([]byte, 1024)
	_, err = tempFile.Read(fileContent)
	if err != nil {
		log.Fatalf("Error reading temp file: %v", err)
	}

	// Remove the temp file
	err = os.Remove("pie_chart.html")
	if err != nil {
		log.Fatalf("Error removing temp file: %v", err)
	}

	// Parse and execute the HTML template
	tmpl, err := template.New("webpage").Parse(htmlTemplate)
	if err != nil {
		log.Fatalf("Error parsing template: %v", err)
	}
	err = tmpl.Execute(w, string(fileContent))
	if err != nil {
		log.Fatalf("Error executing template: %v", err)
	}
}

func barChartHandler(w http.ResponseWriter, _ *http.Request) {
	// Read CSV file
	file, err := os.Open("grades.csv")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	// Process grades for bar chart
	gradeCounts := make(map[string]int)
	for _, record := range records[1:] { // Skip header row
		grade := record[1] // Assuming grade is in the second column
		gradeCounts[grade]++
	}

	// Prepare data for bar chart
	var grades []string
	var counts []opts.BarData
	for grade, count := range gradeCounts {
		grades = append(grades, grade)
		counts = append(counts, opts.BarData{Value: count})
	}

	// Create bar chart
	bar := charts.NewBar()
	bar.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: "Grade Distribution (Bar Chart)"}))
	bar.AddSeries("Grades", counts)

	// Set x-axis labels
	bar.SetXAxis(grades)

	// Serve the bar chart with an HTML template
	w.Header().Set("Content-Type", "text/html")

	// Create a temporary file to store the chart
	tempFile, err := os.Create("bar_chart.html")
	if err != nil {
		log.Fatalf("Error creating temp file: %v", err)
	}
	defer tempFile.Close()

	err = bar.Render(tempFile)
	if err != nil {
		log.Fatalf("Error rendering chart: %v", err)
	}

	// Re-open the temp file to read the content
	tempFile, err = os.Open("bar_chart.html")
	if err != nil {
		log.Fatalf("Error opening temp file: %v", err)
	}
	defer tempFile.Close()

	// Read the content of the temp file
	fileContent := make([]byte, 1024)
	_, err = tempFile.Read(fileContent)
	if err != nil {
		log.Fatalf("Error reading temp file: %v", err)
	}

	// Remove the temp file
	err = os.Remove("bar_chart.html")
	if err != nil {
		log.Fatalf("Error removing temp file: %v", err)
	}

	// Parse and execute the HTML template
	tmpl, err := template.New("webpage").Parse(htmlTemplate)
	if err != nil {
		log.Fatalf("Error parsing template: %v", err)
	}
	err = tmpl.Execute(w, string(fileContent))
	if err != nil {
		log.Fatalf("Error executing template: %v", err)
	}
}

func lineChartHandler(w http.ResponseWriter, _ *http.Request) {
	// Read CSV file
	file, err := os.Open("grades.csv")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	// Process grades for line chart
	gradeCounts := make(map[string]int)
	for _, record := range records[1:] { // Skip header row
		grade := record[1] // Assuming grade is in the second column
		gradeCounts[grade]++
	}

	// Prepare data for line chart
	var grades []string
	var counts []opts.LineData
	for grade, count := range gradeCounts {
		grades = append(grades, grade)
		counts = append(counts, opts.LineData{Value: count})
	}

	// Create line chart
	line := charts.NewLine()
	line.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: "Grade Distribution (Line Chart)"}))
	line.AddSeries("Grades", counts)

	// Set x-axis labels
	line.SetXAxis(grades)

	// Serve the line chart with an HTML template
	w.Header().Set("Content-Type", "text/html")

	// Create a temporary file to store the chart
	tempFile, err := os.Create("line_chart.html")
	if err != nil {
		log.Fatalf("Error creating temp file: %v", err)
	}
	defer tempFile.Close()

	err = line.Render(tempFile)
	if err != nil {
		log.Fatalf("Error rendering chart: %v", err)
	}

	// Re-open the temp file to read the content
	tempFile, err = os.Open("line_chart.html")
	if err != nil {
		log.Fatalf("Error opening temp file: %v", err)
	}
	defer tempFile.Close()

	// Read the content of the temp file
	fileContent := make([]byte, 1024)
	_, err = tempFile.Read(fileContent)
	if err != nil {
		log.Fatalf("Error reading temp file: %v", err)
	}

	// Remove the temp file
	err = os.Remove("line_chart.html")
	if err != nil {
		log.Fatalf("Error removing temp file: %v", err)
	}

	// Parse and execute the HTML template
	tmpl, err := template.New("webpage").Parse(htmlTemplate)
	if err != nil {
		log.Fatalf("Error parsing template: %v", err)
	}
	err = tmpl.Execute(w, string(fileContent))
	if err != nil {
		log.Fatalf("Error executing template: %v", err)
	}
}
