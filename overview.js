
export async function fetchData() {
    try {
        const [processedData, barCategory, industryList, laggedIndustry, laggedYear, houstonMap] = 
        await Promise.all([
            d3.csv('test_data_slightly_cleaned.csv'),
            d3.csv('bar_category.csv'),
            d3.csv('industry_list.csv'),
            d3.csv('lagged_industry.csv'),
            d3.csv('lagged_year.csv'),
            d3.json('houston_map.geojson')
        ]);

        /* needs to be returned */

        return {
            processedData,
            barCategory,
            industryList,
            laggedIndustry,
            laggedYear,
            houstonMap
        };

    } catch(error) {
        console.log("Failed to load data")
        console.log(error)
    }
    
}

async function industryDropdown(industryList) {
    /* the indsutry list parameter should contain the choice 'All Industries' */
    const dropdown = document.getElementById("industry");

    industryList.forEach(row => {
        const option = document.createElement('option');
        option.value = row.industry;
        option.textContent = row.industry;
        dropdown.appendChild(option);
    })
}

async function yearDropdown() {
    const dropdown = document.getElementById("year");
    const years = d3.range(2021, 2027)

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        dropdown.appendChild(option);
    })
}

/* Create D3.js functions for creating and updating charts */

function getPageData(data, page) {
    console.log(data)
    const start = (page - 1) * 10;
    const end = start + 10;
    return data.slice(start, end);
}

export function getFilteredData(data, industry, year) {
    /* load the data needed for making the table. filter to the industry we are interested in and select only company and industry columns*/
    var filtered_data = Object.fromEntries(Object.entries(data));

    if (industry == "All Industries") {
        var filtered_data = data 
            .filter(row => row.year == year)
            .map(row => {
                return [row.company, row.industry_cluster, row.latitude, row.longitude]
        });

    } else {
        var filtered_data = data 
            .filter(row => row.industry_cluster == industry && row.year == year)
            .map(row => {
                return [row.company, row.industry_cluster, row.latitude, row.longitude]
            });
    }

    return filtered_data
}

async function updateTable(filtered_data, page) {
    // grab the old table
    const table = d3.select("#industry-table");

    // remove everything from the old table
    table.selectAll("*").remove();

    /* add a blank empty btable to the correct section in the HTML body */
    const newTable = table.append("table");

    /* create and array with the names of our columns. 'thead' is the tag for the header. 'tr' is the tag for the row */
    let headers = ["Company", "Industry"]

    newTable.append("thead").append("tr")
        /* 'th' is the tag for header cells */
        .selectAll("th")
        .data(headers)
        .enter().append("th")
        .text(function(d) {
            return d;
        })

    
    /* define the body of our table by adding rows from filtered data */
    let line = newTable.append('tbody')
        /* select rows */
        .selectAll('tr')
        /* use the filtered data we loaded in */
        // .data(filtered_data)
        .data(getPageData(filtered_data, page))
        /* enter the rows into the data */
        .enter()
        /* append the data rows into the table */
        .append('tr')

    /* start appending cell values to each row of the table */
    line.append('td')
        .text(d => d.at(0))
    line.append('td')
        .text(d => d.at(1))


    // Create pagination buttons
    let pagination = newTable.append("div")
        .attr("class", "pagination");

    pagination.append("button")
        .text("Previous")
        .property("disabled", page === 1)
        .on("click", () => {
            page--;
            updateTable(filtered_data, page);
        });

    pagination.append("button")
        .text("Next")
        .property("disabled", page * 10 >= filtered_data.length)
        .on("click", () => {
            page++;
            updateTable(filtered_data, page);
        });

    

}



// Initialize dashboard
async function init() {
    const data = await fetchData();
    console.log(data)

    industryDropdown(data.industryList);
    yearDropdown();
    

    let selectedIndustry = document.getElementById("industry").value;
    let selectedYear = document.getElementById("year").value;
    let filtered_data = getFilteredData(data.processedData, selectedIndustry, selectedYear);
    
    let page = 1;

    updateTable(filtered_data, page);

    d3.selectAll("#industry, #year")
      .on("change", function() {
        const newGroup = d3.select("#industry").property("value");
        const newYear = d3.select("#year").property("value");

        filtered_data = getFilteredData(
            data.processedData,
            newGroup,
            newYear
        );

        return updateTable(filtered_data, page)
      }); 


}

init();
