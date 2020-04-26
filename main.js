var circleToPolygon = require('circle-to-polygon');
var coordinates = [-88.2272, 40.1092]; //[lon, lat]
var radius = 20;                           // in meters
var numberOfEdges = 1000000;                     //optional that defaults to 32

var point = circleToPolygon(coordinates, radius, numberOfEdges);
console.log(point.type);

var myStyle = {
    "color": "#ff7800",
    "weight": 5
};
L.geoJSON(point, {
    style:myStyle
}).addTo(map);