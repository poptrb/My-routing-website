document.addEventListener("DOMContentLoaded", async () => {
  var map = L.map("leafletmap", {"doubleClickZoom": false}).setView([44.4183, 26.1042], 19);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 13,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  policeIcon = L.icon({
    iconUrl: 'police_badge.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })


  let geoServiceEndpoint = 'http://localhost:5000/route/v1/driving/'
  let geoServiceParameters = '?steps=true'

  let routePoints = []
  let mapPolylines = []
  let markers = []
  var osrmRoutePolyline = false

  async function waypointsToPolyline(waypoints) {
    if (routePoints.length > 1 ) {
      if (osrmRoutePolyline) {
        map.removeLayer(osrmRoutePolyline)
      }
      let formatted_routePoints = routePoints
        .map( x =>x.lng + ',' + x.lat)
        .join(";")
      let response = await fetch(
        geoServiceEndpoint + formatted_routePoints + geoServiceParameters)
      let osrmRouteData = await response.json()
      let osrmRouteLegs = osrmRouteData.routes[0].legs
      let osrmRoutePoints = []
      let osrmRouteGeometry = osrmRouteData.routes[0].geometry

      osrmRouteLegs.forEach(leg => {
        leg.steps.forEach(step => {
          osrmRoutePoints.push(...polyline.decode(step.geometry))
        })
      })
      osrmRoutePolyline = L.polyline(osrmRoutePoints, {color: 'red'}).addTo(map)
    }
  }

  async function onMapClick(e) {
    routePoints.push(e.latlng)
    let changedRoutePoint = null

    let marker = L.marker(
        [e.latlng.lat, e.latlng.lng],
        {title: routePoints.length, draggable: true
      })

    marker.addTo(map)
    marker.dragging.enable()

    marker.on('dragstart', function() {
        var oldCoordinates = {
          'lat': marker.getLatLng().lat,
          'lng': marker.getLatLng().lng
        }
        changedRoutePoint = oldCoordinates
      })

    marker.on('dragend', function () {
        routePoints.forEach((route_point, idx) => {
          // console.log(route_point, changedRoutePoint)
          if (route_point.lat == changedRoutePoint.lat
            && route_point.lng == changedRoutePoint.lng) {
            routePoints[idx] = marker.getLatLng()
            waypointsToPolyline(routePoints)
          }
        })
      })

    markers.push(marker)
    waypointsToPolyline(routePoints)
    }

  map.on('click', onMapClick )


  async function addPoliceMarkers() {
    try {
      const response = await fetch('http://localhost:8001/');
      const data = await response.json();

      data.forEach(item => {
        const lat = item.location.y;
        const lng = item.location.x;

        L.marker([lat, lng], {icon: policeIcon}).addTo(map);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  addPoliceMarkers()



})
