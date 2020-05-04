/**
 * This javascript file creates a route from point A to point B using a MultiPolygon GeoJSON object.
 * The MultiPolygon GeoJSON object contains the coordinates of each polygon that represents a buffered region 
 * around a single point of crime.
 * After making changes to this file, run 'browserify main.js -o bundle.js' in the command line after to see
 * the changes on the website. 
 */


var circleToPolygon = require('circle-to-polygon');
//Set style for crime marker points
var myStyle = {
    "color": "#ff7800",
    "weight": 5
};

//Replace later with data from JSON file
var sampleCrimeData = {
    "incidents": [
        {
           "location": "Illini Union", 
           "incident_latitude": 40.1092,
            "incident_longitude": -88.2272
        },
        {
           "location": "Engineering Hall",
           "incident_latitude": 40.106499574,
           "incident_longitude": -88.222832442
       },
       {
           "location": "Alma Mater",
           "incident_latitude": 40.1099,
           "incident_longitude": -88.2284
       },
       {
           "location": "Altgeld",
           "incident_latitude": 40.105666244, 
           "incident_longitude": -88.223665772
       },
       {
           "location": "Noyes",
           "incident_latitude": 40.1085,
           "incident_longitude": -88.2261
       },
    ]
}

/**
 * Uses the Node.js package circle-to-polygon to create a GeoJSON that roughly approximates a circle 
 * centered at a specific latitude and longitude
 * @param circleToPolygon the module loaded by require
 * @param coordinates represented by array [longitude, latitude]
 * @param radius in meters
 * @param numberofEdges polygon resembles more of a circle as this value increases
 */
 function createBufferPolygon(latitude, longitude) {
     let coordinates = [longitude, latitude];
     let radius = 100;
     let numberOfEdges = 20;
     return circleToPolygon(coordinates, radius, numberOfEdges);
 }

//Plots each point on the map
//Creates 20 meter buffer around each crime point and stores in a MultiPolygon GeoJSON object
var bufferPolygons = {
    "type": "MultiPolygon",
    "coordinates": []
}

var incidents = sampleCrimeData.incidents;
var bufferPolygons = {
    "type": "MultiPolygon",
    "coordinates": []
}

for (i = 0; i < incidents.length; i++) {
    let latitude = incidents[i].incident_latitude;
    let longitude = incidents[i].incident_longitude;
    L.circle([latitude, longitude], {
        style:myStyle
    }).addTo(map);
    let buffPolyCoordinates = createBufferPolygon(latitude, longitude).coordinates;
    bufferPolygons.coordinates.push(buffPolyCoordinates);
}

window.plotCrimePoints = function(latitudes, longitudes) {
    for(i = 0; i < latitudes.length; i++) {
        let latitude = latitudes[i];
        let longitude = longitudes[i];
        let buffPolyCoordinates = createBufferPolygon(latitude, longitude).coordinates;
        bufferPolygons.coordinates.push(buffPolyCoordinates);
    }
    console.log(bufferPolygons);
}

//Set start and end points of travel (Start: State Farm, End: Everitt Laboratory)
//Should be based on user-input
window.createRoute = function(startLat, startLng, endLat, endLng) {
    //Creates route with a POST request to OpenRouteServices
    let request = new XMLHttpRequest();

    var url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";
    request.open('POST', url);

    request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', '5b3ce3597851110001cf6248b365d96ecb99476a8e3a4ca7d24de70f');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            console.log('Status:', this.status);
            console.log('Headers:', this.getAllResponseHeaders());
            console.log('Body:', this.responseText);
            //Plot route on map
            var route = JSON.parse(this.responseText);
            L.geoJSON(route).addTo(map);
        }
    };
    let pathing_restrictions = {
        "coordinates": [[startLng, startLat],[endLng, endLat]],
        "options":{
        "avoid_polygons": bufferPolygons
        },
        format: 'geojson'
    };
    const body = JSON.stringify(pathing_restrictions);
    
    request.send(body);
    return 0;
}
