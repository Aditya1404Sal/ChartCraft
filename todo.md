# All Things to do:

## Frontend

- customizability for generating charts
- excel data processing

## Backend

- Golang -> Python refactor
- bar, line, pie (already implemented : basic)

- parse the input data and get the user's customization request
- based on the customization requet , generate appropriate graphs

- python : matplotlib and other libraries, django for backend server

## Actual TODO

### Understand and implement graph generators in python for different chart types
### Learn how to setup a server in django and implement API's, and request assertion
### Create helper middlewares that intelligently detect the customization
### Serialization of data and conversion of it into approriate data structures


## NEEDED Capabilities:

#### Person uploads data in form of CSV (comma seperated values) 
file get's transported to backend by the frontend multi-part processing (basically a whole file is divided into chunks and then transported)

#### Backend reception
Backend has api routes setup that detect incoming file data, this backend will serialize the incoming data into the csv format, with some added modifications that are lost while data streaming

### Frontend data customization
after the backend processes the csv, it sends the headers (like the different column names to the frontend as a response)

The frontend then loads these column names into the HTML structure which will let people select different options and generate preferred graphs

### Graph generation
when users select the colums and chart type : these fields are sent tho the backend
, the backend receives these fields and based onn the earlier parsed data, it performs chart / graph generation

### go-Echarts (the library we're currently using for generation)
### TBD (replace with python impl of matplotlibs)

It basicalyy takes the specific column that user chose and performs ("Specific actions") here specific actions are what we need to make customizable

for the time being it merely does distribution processing which shows the data count being grouped into batches of 10


# Work distribution:
Aditya : Manage
Harsh : 1/2 frontend + file parsing (excel) [Implement a function in python that takes in a .xlsv or .xls file and converts it into a csv file, make sure data is not lost]
Riya : Help me w customization [Also implement HTML to svg Conversion,should be non-blocking and should allow users on the frontend to download it once it's converted] (javascript)
Pranali : Tailwind CSS + 1/2 frontend [implement customization fields dynamically, like the parsed headers of a csv need to be presented in a form where users can describe the granularity of the chart]


## Deadlines:

Aditya : 20th Oct Sunday : Refactor done
Harsh : 22nd Oct Tuesday : python xl->csv parser
Riya : 21st Oct Monday : HTML to SVG converter helper function, plus a button on the frontendsselectedHeader
Pranali : 22nd Oct Tuesday : Dyanamic Field Customization  

## Scope : 

 Business Data : Revenue data : Company sales : Advertisements


## Brain storming:

Field specificity : keyword pattern recognition, (Fields shouls have a permutation of all acceptable parameters)