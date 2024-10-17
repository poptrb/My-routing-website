function success(pos) {
  var crd = pos.coords;
  console.log("Your current position is:");
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
  return pos.coords
}

function errors(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

var options = {
  enableHighAccuracy: true,
  timeout: 500000,
  maximumAge: 0,
};

export function getUserCoordinates() {
  if (navigator.geolocation) {
        navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
            console.log(result);
            if (result.state === "granted") {
              return navigator.geolocation.getCurrentPosition(success, errors, options);
            //If granted then you can directly call your function here
            } else if (result.state === "prompt") {
              return navigator.geolocation.getCurrentPosition(success, errors, options);
            //If prompt then the user will be asked to give permission
            } else if (result.state === "denied") {
            //If denied then you have to show instructions to enable location
            }
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
