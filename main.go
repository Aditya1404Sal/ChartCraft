package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strconv"

	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/opts"
)

type GradeData struct {
	Headers []string   `json:"headers"`
	Rows    [][]string `json:"rows"`
}

type ChartRequest struct {
	ChartType string     `json:"chartType"`
	Column    int        `json:"column"`
	FileData  [][]string `json:"fileData"`
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/upload", uploadFileHandler)
	mux.HandleFunc("/api/chart", generateChartHandler)

	handlerWithCORS := enableCORS(mux)

	fmt.Println("Server listening on http://localhost:8080")
	http.ListenAndServe(":8080", handlerWithCORS)
}

func uploadFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		http.Error(w, "Error reading CSV file", http.StatusBadRequest)
		return
	}

	if len(records) < 2 {
		http.Error(w, "CSV file is empty or has insufficient data", http.StatusBadRequest)
		return
	}

	headers := records[0]

	response := map[string]interface{}{
		"headers": headers,
		"message": "File uploaded successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateChartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request ChartRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	data := GradeData{
		Headers: request.FileData[0],
		Rows:    request.FileData[1:],
	}

	var buf bytes.Buffer
	if err := generateChart(&buf, request.ChartType, data, request.Column); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"html": buf.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateChart(w io.Writer, chartType string, data GradeData, column int) error {
	counts := make(map[string]int)
	for _, row := range data.Rows {
		if column < len(row) {
			counts[row[column]]++
		}
	}

	title := data.Headers[column] + " Distribution"

	switch chartType {
	case "pie":
		return createPieChart(w, counts, title)
	case "bar":
		return createBarChart(w, counts, title)
	case "line":
		return createLineChart(w, counts, title)
	default:
		return fmt.Errorf("invalid chart type")
	}
}

func createPieChart(w io.Writer, data map[string]int, title string) error {
	pie := charts.NewPie()
	pie.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: title}))

	groupedData := groupGrades(data)

	var labels []string
	for label := range groupedData {
		labels = append(labels, label)
	}
	sort.Strings(labels)

	items := make([]opts.PieData, 0, len(groupedData))
	for _, label := range labels {
		items = append(items, opts.PieData{Name: label, Value: groupedData[label]})
	}
	pie.AddSeries(title, items)

	if err := pie.Render(w); err != nil {
		return err
	}
	return nil
}

func createBarChart(w io.Writer, data map[string]int, title string) error {
	bar := charts.NewBar()
	bar.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: title}))

	groupedData := groupGrades(data)

	var labels []string
	var values []opts.BarData

	for label := range groupedData {
		labels = append(labels, label)
	}
	sort.Strings(labels)

	for _, label := range labels {
		values = append(values, opts.BarData{Value: groupedData[label]})
	}

	bar.SetXAxis(labels).AddSeries(title, values)

	if err := bar.Render(w); err != nil {
		return err
	}
	return nil
}

func createLineChart(w io.Writer, data map[string]int, title string) error {
	line := charts.NewLine()
	line.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: title}))

	groupedData := groupGrades(data)

	var labels []string
	var values []opts.LineData

	for label := range groupedData {
		labels = append(labels, label)
	}
	sort.Strings(labels)

	for _, label := range labels {
		values = append(values, opts.LineData{Value: groupedData[label]})
	}

	line.SetXAxis(labels).AddSeries(title, values)

	if err := line.Render(w); err != nil {
		return err
	}
	return nil
}

func groupGrades(data map[string]int) map[string]int {
	grouped := make(map[string]int)
	for grade, count := range data {
		score, err := strconv.Atoi(grade)
		if err != nil {
			// If the grade is not a number, keep it as is
			grouped[grade] += count
		} else {
			// Group scores into ranges of 10
			rangeStart := (score / 10) * 10
			rangeEnd := rangeStart + 9
			rangeLabel := fmt.Sprintf("%d-%d", rangeStart, rangeEnd)
			grouped[rangeLabel] += count
		}
	}
	return grouped
}
