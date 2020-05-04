(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * This javascript file creates a route from point A to point B using a MultiPolygon GeoJSON object.
 * The MultiPolygon GeoJSON object contains the coordinates of each polygon that represents a buffered region 
 * around a single point of crime.
 * After making changes to this file, run 'browserify main.js -o bundle1.js' in the command line after to see
 * the changes on the website. 
 */

var circleToPolygon = require('circle-to-polygon');

// The free version of Crimeometer API contains limited data points
// Generated JSON in a similar format to Crimeomter to test the app in the Urbana-Champaign area with police reports
var sampleCrimeData = {
    "incidents": [
        {
            "location": " Motor Vehicle Theft 1600 BLOCK OF N MATTIS AVE",
            "incident_latitude": 40.132970,
            "incident_longitude": -88.277000
        },
        {
            "location": "Burglary 700 BLOCK OF HAMILTON Dr",
            "incident_latitude": 40.100430,
            "incident_longitude": -88.253530
        },
        {
            "location": "Mob Action 1000 Block RACE ST S",
            "incident_latitude": 40.104110,
            "incident_longitude": -88.209590
        },
        {
            "location": "Disorderly Conduct 400 Block VINE ST S",
            "incident_latitude": 40.110200,
            "incident_longitude": -88.204600
        },
        {
            "location": "Disorderly Conduct 800 Block GREEN ST W",
            "incident_latitude": 40.110680,
            "incident_longitude": -88.217770
        },
        {
            "location": "Theft 200 Block HARVEY ST",
            "incident_latitude": 40.113180,
            "incident_longitude": -88.222270
        },
        {
            "location": "RECKLESS DISCHARGE OF A FIREARM COLER AV & FAIRVIEW AV",
            "incident_latitude":40.120110,
            "incident_longitude": -88.215740
        },
        {
            "location": "Burglary 4000 BLOCK OF TURNBERRY DR",
            "incident_latitude": 40.103130,
            "incident_longitude": -88.310780
        },
        {
            "location":"Burglary 1200 BLOCK OF S MATTIS AVE",
            "incident_latitude": 40.103730,
            "incident_longitude":-88.276490
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
           "location": "Bell Tower",
           "incident_latitude": 40.1028,
           "incident_longitude": -88.2272  
       },
       {
           "location": "ARC",
           "incident_latitude": 40.1008,
           "incident_longitude": -88.2356 
       }
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
     let radius = 20;
     let numberOfEdges = 20;
     return circleToPolygon(coordinates, radius, numberOfEdges);
 }

// Plots and creates 20 meter buffer around each sampleCrimeData entry and stores in the bufferPolygons MultiPolygon GeoJSON object
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
    L.circle([latitude, longitude], 20, {
        color:'red'
    }).addTo(map);
    let buffPolyCoordinates = createBufferPolygon(latitude, longitude).coordinates;
    bufferPolygons.coordinates.push(buffPolyCoordinates);
}

/**
 * Creates 20 meter buffer around each crime point and stores in the bufferPolygons MultiPolygon GeoJSON object
 * @param latitudes array of crime point latitudes
 * @param longitudes array of crime point longitudes
 */
window.crimePointsToPolygons = function(latitudes, longitudes) {
    for(i = 0; i < latitudes.length; i++) {
        let latitude = latitudes[i];
        let longitude = longitudes[i];
        let buffPolyCoordinates = createBufferPolygon(latitude, longitude).coordinates;
        bufferPolygons.coordinates.push(buffPolyCoordinates);
    }
}

/**
 * Creates openrouteservice POST request to construct an FeatureCollection GeoJSON object that represents 
 * the path from the user-inputed start point to destination that also avoids polygons that represent areas with
 * past crime
 * @param startLat start point latitude
 * @param startLng start point longitude
 * @param endLat destination latitude
 * @param endLng destination longitude
 */
window.createRoute = function(startLat, startLng, endLat, endLng) {
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
}

},{"circle-to-polygon":2}],2:[function(require,module,exports){
"use strict";
function toRadians(angleInDegrees) {
  return (angleInDegrees * Math.PI) / 180;
}

function toDegrees(angleInRadians) {
  return (angleInRadians * 180) / Math.PI;
}

function offset(c1, distance, bearing) {
  var lat1 = toRadians(c1[1]);
  var lon1 = toRadians(c1[0]);
  var dByR = distance / 6378137; // distance divided by 6378137 (radius of the earth) wgs84
  var lat = Math.asin(
    Math.sin(lat1) * Math.cos(dByR) +
      Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing)
  );
  var lon =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
      Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat)
    );
  return [toDegrees(lon), toDegrees(lat)];
}

function validateCenter(center) {
  const validCenterLengths = [2, 3]
  if (!Array.isArray(center) || !validCenterLengths.includes(center.length)) {
    throw new Error("ERROR! Center has to be an array of length two or three");
  }
  const [lng, lat] = center;
  if (typeof lng !== "number" || typeof lat !== "number") {
    throw new Error(
      `ERROR! Longitude and Latitude has to be numbers but where ${typeof lng} and ${typeof lat}`
    );
  }
  if (lng > 180 || lng < -180) {
    throw new Error(
      `ERROR! Longitude has to be between -180 and 180 but was ${lng}`
    );
  }

  if (lat > 90 || lat < -90) {
    throw new Error(
      `ERROR! Latitude has to be between -90 and 90 but was ${lat}`
    );
  }
}

function validateRadius(radius) {
  if (typeof radius !== "number") {
    throw new Error(
      `ERROR! Radius has to be a positive number but was: ${typeof radius}`
    );
  }

  if (radius <= 0) {
    throw new Error(
      `ERROR! Radius has to be a positive number but was: ${radius}`
    );
  }
}

function validateNumberOfSegments(numberOfSegments) {
  if (typeof numberOfSegments !== "number" && numberOfSegments !== undefined) {
    throw new Error(
      `ERROR! Number of segments has to be a number but was: ${typeof numberOfSegments}`
    );
  }

  if (numberOfSegments < 3) {
    throw new Error(
      `ERROR! Number of segments has to be at least 3 but was: ${numberOfSegments}`
    );
  }
}

function validateInput({ center, radius, numberOfSegments }) {
  validateCenter(center);
  validateRadius(radius);
  validateNumberOfSegments(numberOfSegments);
}

module.exports = function circleToPolygon(center, radius, numberOfSegments) {
  var n = numberOfSegments ? numberOfSegments : 32;

  // validateInput() throws error on invalid input and do nothing on valid input
  validateInput({ center, radius, numberOfSegments });

  var coordinates = [];
  for (var i = 0; i < n; ++i) {
    coordinates.push(offset(center, radius, (2 * Math.PI * -i) / n));
  }
  coordinates.push(coordinates[0]);

  return {
    type: "Polygon",
    coordinates: [coordinates]
  };
};

},{}]},{},[1]);
