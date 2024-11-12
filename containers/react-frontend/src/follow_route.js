// Import Turf.js (Assume you are working in an environment where Turf is available)
import * as turf from '@turf/turf'

// Constants
const DRIFT_THRESHOLD = 50; // meters (adjustable based on drift sensitivity)

// Haversine distance using Turf.js (though Turf has its own distance calculation)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    return turf.distance(from, to, { units: 'meters' });
}

// Split a LineString into travelled and untravelled segments based on a GPS point
function splitLineStringByGPS(linestring, gpsPoint) {
    // Find the nearest point on the LineString to the GPS Point
    const snapped = turf.nearestPointOnLine(linestring, gpsPoint);

    // Measure the distance from the start of the LineString to the nearest point
    const splitDistance = turf.lineSliceAlong(linestring, 0, snapped.properties.location, { units: 'meters' });

    // Measure the remaining untravelled segment
    const totalLength = turf.length(linestring, { units: 'meters' });
    const remainingSegment = turf.lineSliceAlong(linestring, snapped.properties.location, totalLength, { units: 'meters' });

    return [splitDistance, remainingSegment];
}

// Check if the car is drifting from the route
function isDriftingFromRoute(routeLines, gpsPoint, driftThreshold = DRIFT_THRESHOLD) {
    for (let i = 0; i < routeLines.length; i++) {
        const linestring = routeLines[i];
        // Find the nearest point on this LineString
        const snapped = turf.nearestPointOnLine(linestring, gpsPoint);
        // Calculate the distance between the car and the nearest point on the route
        const distanceToRoute = haversineDistance(gpsPoint.geometry.coordinates[1], gpsPoint.geometry.coordinates[0], snapped.geometry.coordinates[1], snapped.geometry.coordinates[0]);

        if (distanceToRoute <= driftThreshold) {
            return false;  // Not drifting
        }
    }
    return true;  // Car is drifting if no close segment is found
}

// Process the route and return travelled and untravelled segments
function processRouteProgress(routeLines, gpsPoint) {
    const travelledSegments = [];
    const untravelledSegments = [];

    routeLines.forEach((linestring) => {
        // Split the LineString into travelled/untravelled segments
        const [travelled, untravelled] = splitLineStringByGPS(linestring, gpsPoint);
        travelledSegments.push(travelled);
        untravelledSegments.push(untravelled);
    });

    return { travelledSegments, untravelledSegments };
}

// Example usage:
// routeLines is an array of LineString features (Turf LineStrings)
// gpsPoint is the current GPS position (Turf Point)

function updateRouteProgress(routeLines, gpsPoint) {
    if (isDriftingFromRoute(routeLines, gpsPoint)) {
        console.log("Car is drifting from the route, recalculating route...");
        // Call your function to recalculate route here
    } else {
        const { travelledSegments, untravelledSegments } = processRouteProgress(routeLines, gpsPoint);
        console.log("Travelled segments:", travelledSegments);
        console.log("Untravelled segments:", untravelledSegments);
        // Now you can visualize the travelled and untravelled segments on a map
    }
}

// Example Data (replace these with actual data)
// GPS point of the car
// const gpsPoint = turf.point([4.9041, 52.3676]);  // Example coordinates (longitude, latitude)

// LineString route (example, replace with actual route data)
// const routeLines = [
//     turf.lineString([
//         [4.9003, 52.3637],
//         [4.9021, 52.3660],
//         [4.9048, 52.3683],
//         [4.9080, 52.3705]
//     ]),
//     turf.lineString([
//         [4.9080, 52.3705],
//         [4.9105, 52.3728],
//         [4.9145, 52.3751]
//     ])
// ];

// Call to update route progress
// updateRouteProgress(routeLines, gpsPoint);

