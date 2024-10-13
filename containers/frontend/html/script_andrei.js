document.addEventListener("DOMContentLoaded", () => {
  function handlePermission() {
    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        document.getElementById("status").innerHTML = result.state;
        if (result.state == "granted") {
          console.log(result.state);
        } else if (result.state == "prompt") {
          console.log(result.state);
          //   navigator.geolocation.getCurrentPosition(revealPosition,positionDenied,geoSettings);
        } else if (result.state == "denied") {
          console.log(result.state);
        }
        result.onchange = function () {
          console.log(result.state);
        };
      });
  }
  handlePermission();
  //when the start tracking button is clicked, use the geolocation API to track the user's location and post it to index.php
  //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
  document.getElementById("start_tracking").addEventListener("click", () => {
    console.log("Start Tracking");
    alert("starting tracking 2");
    //set the div id status to started tracking
    document.getElementById("status").innerHTML = "Started Tracking";
    navigator.geolocation.watchPosition((position) => {
      document.getElementById("status").innerHTML =
        "Currently tracking: " +
        position.coords.latitude +
        ", " +
        position.coords.longitude +
        " (Acc: " +
        position.coords.accuracy +
        " / Sp: " +
        position.coords.speed +
        ")";
      //alert(position.coords.latitude);
      console.log(position);

      var data = {
        timestamp: position.timestamp,
        coords: {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
        },
      };

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "index.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("data=" + JSON.stringify(data));
      //log the response from index.php
      xhr.onload = function () {
        console.log(this.responseText);
      };
    });
  });
  //when the stop tracking button is clicked, stop tracking the user's location
  document.getElementById("stop_tracking").addEventListener("click", () => {
    console.log("Stop Tracking");
    navigator.geolocation.clearWatch();
  });

  var map = L.map("leafletmap").setView([45.6493, 25.6284], 5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  //periodically call index.php with post to get a json array of past locations and display them on the map with L.marker(coord).addto(map)
  //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
  function getPastLocations() {
    console.log("Getting past locations");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "index.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("get_past_locations=true");
    //log the response from index.php
    xhr.onload = function () {
      console.log(this.responseText);
      //parse the json array
      var locations = JSON.parse(this.responseText);
      //iterate through the array and add a marker for each location
      locations.forEach((location) => {
        console.log(location);
        L.marker([location.latitude, location.longitude]).addTo(map);
      });
    };
  }
  getPastLocations();
  setInterval(getPastLocations, 10000);
});

