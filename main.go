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
	http.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
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
	})

	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
