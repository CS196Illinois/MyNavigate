/**
 * Uses the Node.js package circle-to-polygon to create a GeoJSON that roughly approximates a circle 
 * centered at a specific latitude and longitude
 * @param circleToPolygon the module loaded by require
 * @param coordinates represented by array [longitude, latitude]
 * @param radius in meters
 * @param numberofEdges polygon resembles more of a circle as this value increases
 * In order to see the updates in the website, run: 'browserify main.js -o bundle.js' in the command line
 */
var circleToPolygon = require('circle-to-polygon');
var coordinates = [-88.2272, 40.1092];
var radius = 20;
var numberOfEdges = 20;

var point = circleToPolygon(coordinates, radius, numberOfEdges);
console.log(point.type);

var myStyle = {
    "color": "#ff7800",
    "weight": 5
};
L.geoJSON(point, {
    style:myStyle
}).addTo(map);