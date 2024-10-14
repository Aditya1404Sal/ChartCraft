package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/opts"
	"github.com/xuri/excelize/v2"
)

type GradeData struct {
	Headers []string
	Rows    [][]string
}

type ChartRequest struct {
	ChartType string
	Column    int
	FileData  [][]string
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

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))

	var records [][]string

	switch ext {
	case ".csv":
		records, err = readCSV(file)
	case ".xlsx":
		records, err = readExcel(file)
	default:
		http.Error(w, "Unsupported file type", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Error reading file: %v", err), http.StatusBadRequest)
		return
	}

	if len(records) < 2 {
		http.Error(w, "File is empty or has insufficient data", http.StatusBadRequest)
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

func readCSV(file multipart.File) ([][]string, error) {
	reader := csv.NewReader(file)
	return reader.ReadAll()
}

func readExcel(file multipart.File) ([][]string, error) {
	f, err := excelize.OpenReader(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets found in Excel file")
	}

	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return nil, err
	}

	return rows, nil
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

	x := strings.Trim(data.Headers[column], "\"")
	y := strings.ToUpper(string(x[0])) + x[1:]
	title := y + " Distribution"

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

	pie.SetGlobalOptions(
		charts.WithTitleOpts(opts.Title{
			Title: title,
		}),
		charts.WithLegendOpts(opts.Legend{
			Orient: "vertical",
			Left:   "left",
			Top:    "10%",
		}),
	)

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

	return pie.Render(w)
}

func createBarChart(w io.Writer, data map[string]int, title string) error {
	bar := charts.NewBar()
	bar.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: title}))

	groupedData := groupGrades(data)

	var labels []string
	for label := range groupedData {
		labels = append(labels, label)
	}
	sort.Strings(labels)

	var values []opts.BarData
	for _, label := range labels {
		values = append(values, opts.BarData{Value: groupedData[label]})
	}

	bar.SetXAxis(labels).AddSeries(title, values)

	return bar.Render(w)
}

func createLineChart(w io.Writer, data map[string]int, title string) error {
	line := charts.NewLine()
	line.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: title}))

	groupedData := groupGrades(data)

	var labels []string
	for label := range groupedData {
		labels = append(labels, label)
	}
	sort.Strings(labels)

	var values []opts.LineData
	for _, label := range labels {
		values = append(values, opts.LineData{Value: groupedData[label]})
	}

	line.SetXAxis(labels).AddSeries(title, values)

	return line.Render(w)
}

func groupGrades(data map[string]int) map[string]int {
	grouped := make(map[string]int)
	for grade, count := range data {
		grade = strings.TrimSpace(grade)
		grade = strings.Trim(grade, "\"")

		if grade == "" {
			continue
		}

		score, err := strconv.Atoi(grade)
		if err != nil {
			grouped[grade] += count
			continue
		}

		rangeStart := (score / 10) * 10
		rangeEnd := rangeStart + 9
		rangeLabel := fmt.Sprintf("%d-%d", rangeStart, rangeEnd)
		grouped[rangeLabel] += count
	}
	return grouped
}
