// Define the URL for earthquake data
const earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to fetch earthquake data
d3.json(earthquakeDataURL).then(function (data) {
    createFeatures(data.features);
});

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 2000;
}

// Function to determine marker color based on depth
function chooseColor(depth) {
    if (depth > 90) return "red";
    if (depth > 70) return "purple";
    if (depth > 50) return "orange";
    if (depth > 30) return "gold";
    if (depth > 10) return "yellow";
    return "green";
}

// Function to create earthquake features
function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                weight: 0.5
            };
            return L.circle(latlng, markers);
        }
    });

    createMap(earthquakes);
}

// Function to create the map
function createMap(earthquakes) {
    var grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });


    var baseMaps = {
        "Grayscale Map": grayscale
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [grayscale, earthquakes]
    });

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
}