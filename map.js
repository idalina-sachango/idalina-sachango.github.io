
import {LeafletMap, TileLayer, Marker, Circle, Polygon, LayerGroup} from 'leaflet';
import {MarkerClusterGroup} from 'leaflet.markercluster';
import { fetchData, getFilteredData } from './overview.js';

const {
    processedData,
    barCategory,
    industryList,
    laggedIndustry,
    laggedYear,
    houstonMap
} = await (async () => {
    try {
        const data = fetchData()
        console.log('Processed Data:', data.processedData);
        return data
        // You can now use these datasets in your charts/maps
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
})();


function createMap(data) {
    const markers = []
    const arrayOfLatLngs = []
    const map = new LeafletMap('map-location').setView([29.7604, -95.3698], 10);

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    data.forEach(row => {
        // setup the bounds
        arrayOfLatLngs.push([row.at(2), row.at(3)]);

        // create the marker
        var marker = new Marker([row.at(2), row.at(3)]);
        // marker.bindPopup([row.company, row.business_description]);
        markers.push(marker);


    })

    const clusterGroup = new MarkerClusterGroup();
    markers.forEach(m => clusterGroup.addLayer(m));
    map.addLayer(clusterGroup);

    return [map, clusterGroup];
}

function updateMap(newData, dataLayer) {

    // Remove previous markers
    dataLayer.clearLayers();

    const markers = []
    // Add markers from new data
    newData.forEach(item => {

        const marker = new Marker([
            item.at(2),
            item.at(3)
        ]);

        marker.bindPopup(item.name);
        dataLayer.addLayer(marker)

    });

}

// Initialize dashboard
async function init() {
    let selectedIndustry = document.getElementById("industry").value;
    let selectedYear = document.getElementById("year").value;
    let filtered_data = getFilteredData(processedData, selectedIndustry, selectedYear);
    console.log(filtered_data)

    const [map, dataLayer] = createMap(filtered_data);

    d3.selectAll("#industry, #year")
        .on("change", function() {
          const newGroup = d3.select("#industry").property("value");
          const newYear = d3.select("#year").property("value");

          filtered_data = getFilteredData(
              processedData,
              newGroup,
              newYear
            );

          return updateMap(filtered_data, dataLayer);
        }); 
}

init();

